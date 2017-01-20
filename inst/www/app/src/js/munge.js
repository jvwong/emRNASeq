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
          '<fieldset class="form-group em-munge-metadata">' +
            '<legend>Metadata Input</legend>' +
            '<div class="em-munge-metadata-file row">' +
              '<label class="col-sm-3 col-form-label">Metadata File</label>' +
              '<div class="col-sm-9">' +
                '<label class="btn btn-primary btn-file btn-md btn-block" for="em-munge-metadata-input">Select</label>' +
                '<input type="file" class="form-control-file" style="display: none;" id="em-munge-metadata-input" />' +
              '</div>' +
            '</div>' +
            '<div><small class="help-block"></small></div>' +
            '<div class="form-group em-munge-metadata-results"></div>' +
          '</fieldset>' +

          '<fieldset class="form-group em-munge-data">' +
            '<legend>Data Input</legend>' +
            '<div class="em-munge-data-species row">' +
              '<label class="col-sm-3 col-form-label">Species &nbsp</label>' +
              '<div class="col-sm-9">' +
                '<select class="selectpicker form-control" data-style="btn-default">' +
                  '<option>human</option>' +
                  '<option>mouse</option>' +
                '</select>' +
              '</div>' +
            '</div>' +
            '<div class="em-munge-data-source_name row">' +
              '<label class="col-sm-3 col-form-label">Source Namespace</label>' +
              '<div class="col-sm-9">' +
                '<select class="selectpicker form-control" data-style="btn-default">' +
                  '<option>ensembl_gene_id</option>' +
                  '<option>hgnc_symbol</option>' +
                  '<option>mgi_symbol</option>' +
                '</select>' +
              '</div>' +
            '</div>' +
            '<div class="em-munge-data-target_name row">' +
              '<label class="col-sm-3 col-form-label">Target Namespace</label>' +
              '<div class="col-sm-9">' +
                '<select class="selectpicker form-control" data-style="btn-default">' +
                  '<option>hgnc_symbol</option>' +
                  '<option>ensembl_id</option>' +
                  '<option>mgi_symbol</option>' +
                '</select>' +
              '</div>' +
            '</div>' +
            '<div class="em-munge-data-file row">' +
              '<label class="col-sm-3 col-form-label">Data Files</label>' +
              '<div class="col-sm-9">' +
                '<label class="btn btn-primary btn-file btn-md btn-block" for="em-munge-data-file">Select</label>' +
                '<input type="file" class="form-control-file" style="display: none;" id="em-munge-data-file" multiple />' +
              '</div>' +
            '</div>' +
            '<div><small class="help-block"></small></div>' +
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
      $container                          : $container,
      $munge                              : $container.find('.em-munge'),
      $munge_clear                        : $container.find('.em-munge .em-munge-clear'),

      $munge_metadata_fieldset            : $container.find('.em-munge fieldset.em-munge-metadata'),
      $munge_metadata_file_input          : $container.find('.em-munge .em-munge-metadata .em-munge-metadata-file #em-munge-metadata-input'),
      $munge_metadata_help                : $container.find('.em-munge .em-munge-metadata .help-block'),
      $munge_metadata_results             : $container.find('.em-munge .em-munge-metadata .em-munge-metadata-results'),

      $munge_data_fieldset                : $container.find('.em-munge fieldset.em-munge-data'),
      $munge_data_species_select          : $container.find('.em-munge .em-munge-data .em-munge-data-species .selectpicker'),
      $munge_data_source_name_select      : $container.find('.em-munge .em-munge-data .em-munge-data-source_name .selectpicker'),
      $munge_data_target_name_select      : $container.find('.em-munge .em-munge-data .em-munge-data-target_name .selectpicker'),
      $munge_data_file                    : $container.find('.em-munge .em-munge-data .em-munge-data-file input'),
      $munge_data_help                    : $container.find('.em-munge .em-munge-data .help-block'),
      $munge_data_results                 : $container.find('.em-munge .em-munge-data-results')
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
      jqueryMap.$munge_metadata_help.text('');
      cb( null, stateMap.metadata_session, stateMap.metadata_file.name );
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

    // THis is required
    if( !data.species ){
      alert('Species must be set to \'human\' or \'mouse\'');
      cb( true );
      return false;
    }

    stateMap.data_files = data.files;

    // opencpu only accepts single files as arguments
    var args = {
      metadata_file   : stateMap.metadata_file,
      species         : data.species,
      source_name     : data.source_name,
      target_name     : data.target_name
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

  onMetadataProcessed = function( err, session, fname ){
    if( err ) { return false; }
    util.displayAsTable(fname,
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
      files       : self[0].files,
      species     : jqueryMap.$munge_data_species_select.val().trim().toLowerCase() || null,
      source_name : jqueryMap.$munge_data_source_name_select.val().trim().toLowerCase(),
      target_name : jqueryMap.$munge_data_target_name_select.val().trim().toLowerCase()
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

    if ( label === 'data' ) {
      jqueryMap.$munge_data_fieldset.attr( 'disabled', !do_enable );
      jqueryMap.$munge_data_species_select.selectpicker('refresh');
    } else {
      jqueryMap.$munge_metadata_fieldset.attr( 'disabled', !do_enable );
    }

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
    jqueryMap.$munge_metadata_file_input.val("");
    jqueryMap.$munge_metadata_help.text(configMap.default_metadata_help);
    jqueryMap.$munge_metadata_results.empty();
    jqueryMap.$munge_data_species_select.val("");
    jqueryMap.$munge_data_file.val("");
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
    jqueryMap.$munge_metadata_file_input.change( onMetaFileChange );
    jqueryMap.$munge_data_file.change( onDataFilesChange );
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
