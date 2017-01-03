"use strict";

var util = require('./util.js');
var ocpu = require('../lib/opencpu.js/opencpu-0.5-npm.js');

var process_rseq = (function(){
  // ---------- BEGIN MODULE SCOPE VARIABLES -----------------------------------
  var
  configMap = {
    anchor_schema_map : {
    },
    template : String() +
      '<div class="em-process_rseq">' +
        '<h2>RNA Sequencing Analysis <small></small></h2>' +
        '<hr/>' +
        '<form class="form-horizontal em-process_rseq-class">' +
          '<fieldset>' +
            '<legend>Differential Expression Testing</legend>' +
            '<div class="form-group">' +
              '<label for="em-process_rseq-class-test" class="col-sm-3 control-label">Test Class</label>' +
              '<div class="col-sm-9">' +
                '<input type="text" class="form-control" id="em-process_rseq-class-test" placeholder="Test">' +
              '</div>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="em-process_rseq-class-baseline" class="col-sm-3 control-label">Baseline Class</label>' +
              '<div class="col-sm-9">' +
                '<input type="text" class="form-control" id="em-process_rseq-class-baseline" placeholder="Baseline">' +
              '</div>' +
            '</div>' +
            '<div class="form-group">' +
              '<div class="col-sm-offset-3 col-sm-9">' +
                '<button type="submit" class="btn btn-primary btn-block em-process_rseq-class-submit">Submit</button>' +
              '</div>' +
            '</div>' +
            '<p><small class="col-sm-offset-3 help-block"></small></p>' +
          '</fieldset>' +
        '</form>' +
        '<div class="em-process_rseq-results">' +
          '<div class="row">' +
            '<div class="alert alert-info em-process_rseq-results-status status col-sm-offset-4 col-sm-6"></div>' +
          '</div>' +
          '<div class="em-process_rseq-results-normalize"></div>' +
          '<div class="em-process_rseq-results-deplot"></div>' +          
        '</div>' +
      '</div>',

    settable_map : {}
  },
  stateMap = {
    metadata_session        : null,
    data_session            : null,
    filter_rseq_session     : null,
    normalize_rseq_session  : null,
    de_test_rseq_session    : null,
    classes                 : [],
    test_class              : null,
    baseline_class          : null
  },
  jqueryMap = {},
  reset,
  setJQueryMap,
  configModule,
  onSubmitClass,
  processRNASeq,
  onRNASeqProcessed,
  toggleInput,
  initModule;
  // ---------- END MODULE SCOPE VARIABLES -------------------------------------


  // ---------- Begin UTILITY METHODS ------------------------------------------
  // ---------- End UTILITY METHODS --------------------------------------------


  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function( $container ){
    jqueryMap = {
      $container                            : $container,
      $em_process_rseq_class_test_input     : $container.find('.em-process_rseq .em-process_rseq-class #em-process_rseq-class-test'),
      $em_process_rseq_class_baseline_input : $container.find('.em-process_rseq .em-process_rseq-class #em-process_rseq-class-baseline'),
      $em_process_rseq_class_form           : $container.find('.em-process_rseq .em-process_rseq-class'),
      $em_process_rseq_class_submit         : $container.find('.em-process_rseq .em-process_rseq-class .em-process_rseq-class-submit'),
      $em_process_rseq_class_help           : $container.find('.em-process_rseq .help-block'),
      $em_process_rseq_results_status       : $container.find('.em-process_rseq .em-process_rseq-results .em-process_rseq-results-status'),
      $em_process_rseq_results_normalize    : $container.find('.em-process_rseq .em-process_rseq-results .em-process_rseq-results-normalize'),
      $em_process_rseq_results_deplot       : $container.find('.em-process_rseq .em-process_rseq-results .em-process_rseq-results-deplot')
    };
  };
  // End DOM method /setJQueryMap/

  // Begin DOM method /processRNASeq/
  processRNASeq = function( baseline, test, cb ){

    var
    jqxhr_filter,
    jqxhr_normalize,
    jqxhr_test,
    onfail,
    onDone;

    onDone = function( text ){
      jqueryMap.$em_process_rseq_results_status
        .append('<p>' + text + '</p>')
        .toggle( true );
    };

    onfail = function( jqXHR ){
      var errText = "Server error: " + jqXHR.responseText;
      console.error(errText);
      jqueryMap.$em_process_rseq_class_help.text(errText);
      cb( true );
    };

    // filter
    jqxhr_filter = ocpu.call('filter_rseq', {
      se          : stateMap.data_session,
      baseline    : baseline,
      test        : test,
      min_counts  : 1
    }, function( session ){ stateMap.filter_rseq_session = session; })
    .done(function(){ onDone('Filtering complete'); })
    .fail( onfail );

    jqxhr_normalize = jqxhr_filter.then( function( ){
      return ocpu.call('normalize_rseq', {
        filtered_dge  : stateMap.filter_rseq_session
      }, function( session ){ stateMap.normalize_rseq_session = session; });
    })
    .done( function(){ onDone('Normalization complete'); } )
    .fail( onfail );

    jqxhr_test = jqxhr_normalize.then( function( ){
      return ocpu.call('de_test_rseq', {
        normalized_dge  : stateMap.normalize_rseq_session,
        baseline        : baseline,
        test            : test
      }, function( session ){ stateMap.de_test_rseq_session = session; });
    })
    .done( function(){
      onDone('Differential expression testing complete');
      cb( null,
        stateMap.filter_rseq_session,
        stateMap.normalize_rseq_session,
        stateMap.de_test_rseq_session );
    })
    .fail( onfail );
    // test

    return true;
  };
  // End DOM method /processRNASeq/
  // ---------- BEGIN EVENT HANDLERS -------------------------------------------
  onSubmitClass = function( event ) {
    event.preventDefault();
    jqueryMap.$em_process_rseq_class_help.text("");

    var
      proposed_test_class = jqueryMap.$em_process_rseq_class_test_input.val(),
      proposed_baseline_class = jqueryMap.$em_process_rseq_class_baseline_input.val(),
      isOK = ( stateMap.classes.indexOf(proposed_test_class) > -1 &&
       stateMap.classes.indexOf(proposed_baseline_class) > -1 );

      if( !isOK ) {
        jqueryMap.$em_process_rseq_class_help
          .text(['Invalid class declarations: ',
                proposed_test_class,
                proposed_baseline_class].join(' '));
        return false;
      }

      return processRNASeq( proposed_baseline_class,
        proposed_test_class,
        onRNASeqProcessed );
  };

  onRNASeqProcessed = function( err,
    filter_rseq_session,
    normalize_rseq_session,
    de_test_rseq_session ){

    if( err ) { return false; }

    util.displayAsPrint( 'Results',
      de_test_rseq_session,
      jqueryMap.$em_process_rseq_results_normalize );
    toggleInput( 'class', false );

    jqueryMap.$em_process_rseq_results_deplot.rplot("plot_de", {
      filtered_dge  : filter_rseq_session,
      de_tested_tt  : de_test_rseq_session,
      baseline      : stateMap.baseline_class,
      test          : stateMap.test_class,
      threshold     : 0.05
    }, function( session ){ console.log(session); });

    return true;
  };
  // ---------- END EVENT HANDLERS ---------------------------------------------

  // ---------- BEGIN PUBLIC METHODS -------------------------------------------
  // Begin public method /toggleInput/
  /* Toggle the input availbility for a matched element
   *
   * @param label the stateMap key to set
   * @param do_enable boolean true if enable, false to disable
   *
   * @return boolean
   */
  toggleInput = function( label, do_enable ) {
    var $handles = label === 'class' ?
      [ jqueryMap.$em_process_rseq_class_test_input,
        jqueryMap.$em_process_rseq_class_baseline_input,
        jqueryMap.$em_process_rseq_class_submit ] :
      [];

    $.each( $handles, function( index, value ){
      value.attr('disabled', !do_enable );
      value.attr('disabled', !do_enable );
    });

    return true;
  };
  // End public method /toggleInput/

  // Begin public method /reset/
  /* Return to the ground state
   *
   * @return boolean
   */
  reset = function( ) {
    return true;
  };
  // End public method /reset/


  // Begin public method /configModule/
  // Example   : spa.chat.configModule({ slider_open_em : 18 });
  // Purpose   : Configure the module prior to initialization
  // Arguments :
  //   * set_chat_anchor - a callback to modify the URI anchor to
  //     indicate opened or closed state. This callback must return
  //     false if the requested state cannot be met
  //   * chat_model - the chat model object provides methods
  //       to interact with our instant messaging
  //   * people_model - the people model object which provides
  //       methods to manage the list of people the model maintains
  //   * slider_* settings. All these are optional scalars.
  //       See mapConfig.settable_map for a full list
  //       Example: slider_open_em is the open height in em's
  // Action    :
  //   The internal configuration data structure (configMap) is
  //   updated with provided arguments. No other actions are taken.
  // Returns   : true
  // Throws    : JavaScript error object and stack trace on
  //             unacceptable or missing arguments
  //
  configModule = function ( input_map ) {
    util.setConfigMap({
      input_map    : input_map,
      settable_map : configMap.settable_map,
      config_map   : configMap
    });
    return true;
  };
  // End public method /configModule/

  /* initModule
   * @param $container (Object) jQuery parent
   * @param msg_map Object the parent session
   */
  initModule = function( $container, msg_map ){
    if( !$container ){
      console.error('Missing container');
      return false;
    }
    if( $.isEmptyObject( msg_map ) ||
       !msg_map.hasOwnProperty( 'metadata_session' ) ||
       !msg_map.hasOwnProperty( 'data_session' )){
      console.error('Missing msg_map');
      return false;
    }
    $container.html( configMap.template );
    setJQueryMap( $container );
    jqueryMap.$em_process_rseq_results_status.toggle( false );
    stateMap.metadata_session = msg_map.metadata_session;
    stateMap.data_session = msg_map.data_session;

    // populate the comparisons by default
    stateMap.metadata_session.getObject(function( data ){
      if( !data.length ){ return; }
      var keys = Object.keys(data[0]);
      var classes = data.map(function( val ){ return val[keys[1]]; });

      // Set the classes inthe stateMap
      var unique = util.unique( classes );
      if( unique.length !== 2 ){
        console.error( 'There are not exactly 2 classes' );
        return false;
      }

      stateMap.classes = unique;
      jqueryMap.$em_process_rseq_class_test_input
        .attr( 'placeholder', stateMap.classes[0] )
        .val( stateMap.classes[0] );
      jqueryMap.$em_process_rseq_class_baseline_input
        .attr( 'placeholder', stateMap.classes[1] )
        .val( stateMap.classes[1] );
    });

    jqueryMap.$em_process_rseq_class_form.submit( onSubmitClass );
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule      : initModule,
    configModule    : configModule,
    reset           : reset
  };

}());

module.exports = process_rseq;
