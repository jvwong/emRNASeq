"use strict";

var util = require('./util.js');
var ocpu = require('../lib/opencpu.js/opencpu-0.5-npm.js');
var modulename = (function(){

  // ---------- BEGIN MODULE SCOPE VARIABLES -----------------------------------
  var
  configMap = {
    anchor_schema_map : {
    },
    template : String() +
      '<div class="em-emdata">' +
        '<div class="row">' +
          '<h2 class="col-xs-12 col-sm-10 em-section-title">EM Data Files <small></small></h2>' +
          '<h4 class="col-xs-12 col-sm-2"><a class="btn btn-danger btn-block em-emdata-clear clear-btn ajax-sensitive col-xs-3 col-md-3">Reset</a></h4>' +
        '</div>' +
        '<hr/>' +
        '<p><small class="col-sm-offset-2 help-block"></small></p>' +
        '<div class="em-emdata-results">' +
          '<div class="row em-emdata-results-progress">' +
            '<div class="col-sm-12">' +
              '<div class="progress">' +
                '<div class="progress-bar progress-bar-danger" style="width: 34%;">' +
                  '<span>Ranks</span>' +
                '</div>' +
                '<div class="progress-bar progress-bar-primary" style="width: 33%;">' +
                  '<span>Expression</span>' +
                '</div>' +
                '<div class="progress-bar progress-bar-success" style="width: 33%;">' +
                  '<span>Phenotypes</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="em-emdata-results-files-gsea"></div>' +
          '<div class="em-emdata-results-files-em"></div>' +
        '</div>' +
      '</div>',

    settable_map : {}
  },
  stateMap = {
    filter_rseq_session     : null,
    normalize_rseq_session  : null,
    de_test_rseq_session    : null,
    rank_gsea_session       : null,
    expression_em_session   : null,
    pheontype               : null
  },
  jqueryMap = {},
  reset,
  setJQueryMap,

  fetchGSEAFiles,
  fetchEMFiles,
  createDataFiles,

  configModule,
  initModule;
  // ---------- END MODULE SCOPE VARIABLES -------------------------------------


  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function( $container ){
    jqueryMap = {
      $container                                : $container,
      $emdata_clear                             : $container.find('.em-emdata .em-emdata-clear'),
      $emdata_help                              : $container.find('.em-emdata .help-block'),
      $emdata_results                           : $container.find('.em-emdata .em-emdata-results'),
      $emdata_results_progress                  : $container.find('.em-emdata .em-emdata-results .em-emdata-results-progress'),
      $emdata_results_files_gsea                : $container.find('.em-emdata .em-emdata-results .em-emdata-results-files-gsea'),
      $emdata_results_files_em                  : $container.find('.em-emdata .em-emdata-results .em-emdata-results-files-em')
    };
  };
  // End DOM method /setJQueryMap/

  /* Fetch and append the various files required for GSEA
   *
   * @param $container object the jquery object to append to
   *
   * @return boolean
   */
  fetchGSEAFiles = function( $container, cb ){
    var
    jqxhr_rank,
    onfail,
    onDone;

    onDone = function( n ){
      var $bar = jqueryMap.$emdata_results_progress.find( '.progress-bar:nth-child(' + n + ')' );
        $bar.toggle( true );
    };

    onfail = function( jqXHR ){
      var errText = "Server error: " + jqXHR.responseText;
      console.error(errText);
      jqueryMap.$emdata_help.text(errText);
      cb( true );
    };

    // filter
    jqxhr_rank = ocpu.call('format_ranks_gsea', {
      de_tested_tt : stateMap.de_test_rseq_session
    }, function( session ){ stateMap.rank_gsea_session = session; })
    .done(function(){
      onDone( 1 );
      util.displayAsTable('Rank Files (.rnk)',
      stateMap.rank_gsea_session,
      jqueryMap.$emdata_results_files_gsea,
      null );
    })
    .fail( onfail );

    return true;
  };


  /* Fetch and append the various files required
   *
   * @param $container object the jquery object to append to
   *
   * @return boolean
   */
  createDataFiles = function( $container ){
    fetchGSEAFiles( jqueryMap.$emdata_results_files_gsea, function(){} );
    return true;
  };
  // ---------- END DOM METHODS ------------------------------------------------

  // ---------- BEGIN EVENT HANDLERS -------------------------------------------
  // ---------- END EVENT HANDLERS ---------------------------------------------

  // ---------- BEGIN PUBLIC METHODS -------------------------------------------
  // Begin public method /reset/
  /* Return to the ground state
   *
   * @return boolean
   */
  reset = function( ) {
    alert('reset called');
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
   * @param ocpu (Object) ocpu singleton
   * @param $container (Object) jQuery parent
   */
  initModule = function( $container, msg_map ){
    if( !$container ){
      console.error('Missing container');
      return false;
    }
    if( $.isEmptyObject( msg_map ) ||
       !msg_map.hasOwnProperty( 'filter_rseq_session' ) ||
       !msg_map.hasOwnProperty( 'normalize_rseq_session' ||
       !msg_map.hasOwnProperty( 'de_test_rseq_session' ) )){
      console.error('Missing msg_map');
      return false;
    }
    $container.html( configMap.template );
    setJQueryMap( $container );
    jqueryMap.$emdata_clear.click( reset );

    jqueryMap.$emdata_results_progress.find( '.progress-bar' ).toggle( false );
    jqueryMap.$emdata_results_progress.toggle( false );

    stateMap.filter_rseq_session = msg_map.filter_rseq_session;
    stateMap.normalize_rseq_session = msg_map.normalize_rseq_session;
    stateMap.de_test_rseq_session = msg_map.de_test_rseq_session;

    // do stuff
    createDataFiles( jqueryMap.$emdata_results );
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule      : initModule,
    configModule    : configModule,
    reset           : reset
  };

}());

module.exports = modulename;
