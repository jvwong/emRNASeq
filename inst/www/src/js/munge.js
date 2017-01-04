"use strict";

var util = require('./util.js');
var ocpu = require('../lib/opencpu.js/opencpu-0.5-npm.js');

var munge = (function(){

  // ---------- BEGIN MODULE SCOPE VARIABLES -----------------------------------
  var
  configMap = {

    template : String() +
      '<div class="em-munge">' +
        '<div class="row">' +
          '<h2 class="col-xs-12 col-sm-10 em-section-title">Data Munge <small></small></h2>' +
          '<h4 class="col-xs-12 col-sm-2"><a class="btn btn-danger btn-block em-munge-clear clear-btn ajax-sensitive col-xs-3 col-md-3">Reset</a></h4>' +
        '</div>' +
        '<hr/>' +
        '<form>' +
          '<fieldset class="form-group">' +
            '<legend>Metadata Input</legend>' +
            '<div class="em-munge-meta row">' +
              '<label class="col-sm-2 col-form-label">File</label>' +
              '<div class="col-sm-10">' +
                '<label class="btn btn-primary btn-file btn-md btn-block" for="em-munge-meta-input">Select</label>' +
                '<input type="file" class="form-control-file" style="display: none;" id="em-munge-meta-input" />' +
                '<p><small class="help-block"></small></p>' +
              '</div>' +
            '</div>' +
            '<div class="form-group em-munge-meta-results"></div>' +
          '</fieldset>' +

          '<fieldset class="form-group">' +
            '<legend>Data Input</legend>' +
            '<div class="em-munge-species row">' +
              '<label for="em-munge-species-input" class="col-sm-2 col-form-label">Species &nbsp</label>' +
              '<div class="col-sm-10">' +
                '<input type="text" class="form-control" placeholder="e.g. \'mouse\' (optional)">' +
                '<p><small class="help-block"></small></p>' +
              '</div>' +
            '</div>' +
            '<div class="em-munge-data row">' +
              '<label class="col-sm-2 col-form-label">File</label>' +
              '<div class="col-sm-10">' +
                '<label class="btn btn-primary btn-file btn-md btn-block" for="em-munge-data-input">Select</label>' +
                '<input type="file" class="form-control-file" style="display: none;" id="em-munge-data-input" disabled multiple />' +
                '<p><small class="help-block"></small></p>' +
              '</div>' +
            '</div>' +
            '<div class="form-group em-munge-data-results"></div>' +
          '</fieldset>' +
        '</form>' +
      '</div>',

    default_metadata_help : String() + 'Tab-delimited (.txt). Headers for \'id\' (filenames) and \'class\'',
    default_data_help     : String() + 'Tab-delimited (.txt). Rows indicate gene and count',

     code_template : String() +
      '<pre class="em-code"></pre>',
    settable_map : {}
  },

  stateMap = {
    metadata_session        : null,
    metadata_file           : null,
    data_session            : null,
    data_files              : null
  },
  jqueryMap = {},
  setJQueryMap,
  configModule,
  toggleInput,
  reset,
  onMetaFileChange,
  onMetadataProcessed,
  processMetaFile,
  onDataFilesChange,
  onDataProcessed,
  processDataFiles,
  initModule;
  // ---------- END MODULE SCOPE VARIABLES -------------------------------------


  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function( $container ){
    jqueryMap = {
      $container                : $container,
      $munge                    : $container.find('.em-munge'),
      $munge_clear              : $container.find('.em-munge .em-munge-clear'),
      $munge_metadata_input     : $container.find('.em-munge .em-munge-meta input'),
      $munge_metadata_label     : $container.find('.em-munge .em-munge-meta label'),
      $munge_metadata_help      : $container.find('.em-munge .em-munge-meta .help-block'),
      $munge_metadata_results   : $container.find('.em-munge .em-munge-meta-results'),
      $munge_spec_input         : $container.find('.em-munge .em-munge-species input'),
      $munge_data_input         : $container.find('.em-munge .em-munge-data input'),
      $munge_data_label         : $container.find('.em-munge .em-munge-data label'),
      $munge_data_help          : $container.find('.em-munge .em-munge-data .help-block'),
      $munge_data_results       : $container.find('.em-munge .em-munge-data-results')
    };
  };
  // End DOM method /setJQueryMap/

  // Begin DOM method /processMetaFile/
  processMetaFile = function( data, cb ){
    if( !data.hasOwnProperty('files') || !data.files.length ){
      alert('No file selected.');
      return;
    }

    stateMap.metadata_file = data.files[0];

    //perform the request
    var jqxhr = ocpu.call('create_meta', {
      metadata_file : stateMap.metadata_file
    }, function(session){
      stateMap.metadata_session = session;    
    });

    jqxhr.done(function(){
      //clear any previous help messages
      jqueryMap.$munge_metadata_help.text( stateMap.metadata_file.name );
      cb( null, stateMap.metadata_session );
    });

    jqxhr.fail(function(){
      var errText = "Server error: " + jqxhr.responseText;
      console.error(errText);
      jqueryMap.$munge_metadata_help.text(errText);
      jqueryMap.$munge_metadata_results.empty();
      cb( true );
    });

    return true;
  };
  // End DOM method /processMetaFile/

  // Begin DOM method /processDataFiles/
  processDataFiles = function( data, cb ){

    if( !data.hasOwnProperty('species') ||
        !data.hasOwnProperty('files') ||
        !data.files.length ){
      alert('No file(s) selected.');
      return;
    }

    if( !stateMap.metadata_file ){
      alert('Please load metadata.');
      return;
    }

    stateMap.data_files = data.files;

    // opencpu only accepts single files as arguments
    var args = {
      metadata_file   : stateMap.metadata_file,
      species         : data.species
    };

    // loop through files
    for (var i = 0; i < stateMap.data_files.length; i++) {
        var file = stateMap.data_files.item(i);
        args['file' + i] = file;
    }

    //perform the request
    var jqxhr = ocpu.call('merge_data',
      args,
      function(session){
        stateMap.data_session = session;
        util.displayAsPrint('Results',
          stateMap.data_session,
          jqueryMap.$munge_data_results);
    });

    jqxhr.done(function(){
      jqueryMap.$munge_data_help.text('Files merged: ' + stateMap.data_files.length);
      cb( null, stateMap.data_session );
    });

    jqxhr.fail(function(){
      var errText = "Server error: " + jqxhr.responseText;
      console.error(errText);
      jqueryMap.$munge_data_help.text(errText);
      jqueryMap.$munge_data_results.empty();
      cb( true );
    });

    return true;
  };
  // End DOM method /processDataFiles/
  // ---------- END DOM METHODS ------------------------------------------------

  // ---------- BEGIN EVENT HANDLERS -------------------------------------------
  onMetaFileChange = function(){
    var
    self = $(this),
    data = {
      files   : self[0].files,
    };
    return processMetaFile( data, onMetadataProcessed );
  };

  onMetadataProcessed = function( err, session ){
    if( err ) { return false; }
    util.displayAsTable('Results',
      session,
      jqueryMap.$munge_metadata_results,
      function( err ){
        if( err ) { return false; }
        toggleInput( 'data', true );
      });
    return true;
  };

  onDataFilesChange = function(){
    var self = $(this),
    data = {
      files   : self[0].files,
      species : jqueryMap.$munge_spec_input.val().trim().toLowerCase() || null
    };
    return processDataFiles( data, onDataProcessed );
  };

  onDataProcessed = function( err, session ){
    if( err ){ return false; }
    util.displayAsPrint('Results',
     session,
     jqueryMap.$munge_data_results,
     function( err ) {
        if ( err ) { return false; }
        toggleInput( 'metadata', false );
        toggleInput( 'data', false );

        //Make the data available
        $.gevent.publish(
          'em-munge-data',
          {
            metadata_session : stateMap.metadata_session,
            data_session     : stateMap.data_session
          }
         );
     });
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
    var $handles = label === 'data' ?
      [ jqueryMap.$munge_data_label,
        jqueryMap.$munge_data_input,
        jqueryMap.$munge_spec_input ] :
      [ jqueryMap.$munge_metadata_label,
        jqueryMap.$munge_metadata_input ];

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
    // Must do this manually
    jqueryMap.$munge_metadata_input.val("");
    jqueryMap.$munge_metadata_help.text(configMap.default_metadata_help);
    jqueryMap.$munge_metadata_results.empty();
    jqueryMap.$munge_spec_input.val("");
    jqueryMap.$munge_data_input.val("");
    jqueryMap.$munge_data_help.text(configMap.default_data_help);
    jqueryMap.$munge_data_results.empty();

    // must clear out stateMap references
    stateMap.metadata_session = null;
    stateMap.metadata_file    = null;
    stateMap.data_session     = null;
    stateMap.data_files       = null;

    // reset input
    toggleInput( 'metadata', true );
    toggleInput( 'data', false );
    return true;
  };
  // End public method /reset/


  // Begin public method /configModule/
  /* The internal configuration data structure (configMap) is
   * updated with provided arguments. No other actions are taken.
   *
   * @return true if updated successfully
   */
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
  initModule = function( $container ){
    if( !$container ){
      console.error( 'Missing container' );
      return false;
    }

    $container.html( configMap.template );
    setJQueryMap( $container );

    jqueryMap.$munge_metadata_help.text( configMap.default_metadata_help );
    jqueryMap.$munge_data_help.text( configMap.default_data_help );

    // bind file change HANDLERS
    jqueryMap.$munge_metadata_input.change( onMetaFileChange );
    jqueryMap.$munge_data_input.change( onDataFilesChange );
    toggleInput( 'metadata', true );
    toggleInput( 'data', false );

    jqueryMap.$munge_clear.click( reset );

    return true;
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule      : initModule,
    configModule    : configModule,
    reset           : reset
  };

}());

module.exports = munge;
