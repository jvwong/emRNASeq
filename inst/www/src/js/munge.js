"use strict";

var util = require('./util.js');

var munge = (function(){

  // ---------- BEGIN MODULE SCOPE VARIABLES -----------------------------------
  var
  configMap = {

    template : String() +
      '<div class="em-munge">' +
        '<h2>Data Munge <small>Upload RNA sequencing (meta)data</small></h2>' +
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

    table_template : String() +
     '<table class="table table-striped table-bordered em-table">' +
       '<thead>' +
         '<tr></tr>' +
       '</thead>' +
     '</table>',

     code_template : String() +
      '<pre class="em-code"></pre>',

     panel_template : String() +
       '<div class="panel panel-success">' +
          '<div class="panel-heading">' +
            '<h3 class="panel-title"></h3>' +
          '</div>' +
          '<div class="panel-body"></div>' +
          '<div class="panel-footer"></div>' +
        '</div>',

    settable_map : {}
  },

  stateMap = {
    metadata_session        : undefined,
    metadata_file           : undefined,
    data_session            : undefined,
    data_files              : undefined
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
  displayAsTable,
  displayAsPrint,
  initModule;
  // ---------- END MODULE SCOPE VARIABLES -------------------------------------


  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function( $container ){
    jqueryMap = {
      $container                : $container,
      $munge                    : $container.find('.em-munge'),
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

  // Begin DOM method /displayAsTable/
  displayAsTable = function(text, session, $container){
    session.getObject(function(data){
      if(!data.length){ return; }

      // Data manipulations
      var keys = Object.keys(data[0]);
      var headers = keys.map(function(v){
        return '<th>' + v + '</th>';
      });
      var aoColumns = keys.map(function(v){
        return {
           "mDataProp": v
        };
      });

      // DOM manipulations
      var $table = $(configMap.table_template);
      if(headers.length){
        $table.find('thead tr').html($(headers.join('')));
      }
      var $panel = $(configMap.panel_template);
      $panel.find('.panel-title').text(text);
      $panel.find('.panel-body').append($table);
      $container.empty();
      $container.append($panel);
      $table.DataTable({
            "aaData": data,
            "aoColumns": aoColumns
          });
    });
  };
  // End DOM method /displayAsTable/

  // Begin DOM method /displayAsPrint/
  displayAsPrint = function(text, session, $container){
    var url = session.getLoc() + 'R/.val/print';
    $.get(url, function(data){
      // DOM manipulations
      var $code = $(configMap.code_template);
      $code.html(data);
      var $panel = $(configMap.panel_template);
      $panel.find('.panel-title').text(text);
      $panel.find('.panel-body').append($code);
      $panel.find('.panel-footer').append('<a type="button" class="btn btn-default" href="' +
       session.getLoc() + 'R/.val/rds">Download (.rds)</a>');
      $container.empty();
      $container.append($panel);
    });
  };
  // End DOM method /displayAsPrint/

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
      displayAsTable('Results',
        stateMap.metadata_session,
        jqueryMap.$munge_metadata_results);
    });

    jqxhr.done(function(){
      //clear any previous help messages
      jqueryMap.$munge_metadata_help.text( stateMap.metadata_file.name );
      cb( stateMap.metadata_session );
    });

    jqxhr.fail(function(){
      var errText = "Server error: " + jqxhr.responseText;
      console.error(errText);
      jqueryMap.$munge_metadata_help.text(errText);
      jqueryMap.$munge_metadata_results.empty();
      cb( false );
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
        displayAsPrint('Results',
          stateMap.data_session,
          jqueryMap.$munge_data_results);
    });

    jqxhr.done(function(){
      jqueryMap.$munge_data_help.text('Files merged: ' + stateMap.data_files.length);
      cb( stateMap.data_session );
    });

    jqxhr.fail(function(){
      var errText = "Server error: " + jqxhr.responseText;
      console.error(errText);
      jqueryMap.$munge_data_help.text(errText);
      jqueryMap.$munge_data_results.empty();
      cb( false );
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

  onMetadataProcessed = function( session ){
    if( !session ) { return false; }
    displayAsTable('Results', session, jqueryMap.$munge_metadata_results);
    toggleInput( 'data', true );
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

  onDataProcessed = function( session ){
    if( !session ){ return false; }
    displayAsPrint('Results', session, jqueryMap.$munge_data_results);
    toggleInput( 'metadata', false );
    toggleInput( 'data', false );
    $.gevent.publish( 'em-munge-data', { session : session } );
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
      value.attr('disabled', !do_enable);
      value.attr('disabled', !do_enable);
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
    stateMap.metadata_session = undefined;
    stateMap.metadata_file    = undefined;
    stateMap.data_session     = undefined;
    stateMap.data_files        = undefined;

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
    $container.html( configMap.template );
    setJQueryMap( $container );

    jqueryMap.$munge_metadata_help.text(configMap.default_metadata_help);
    jqueryMap.$munge_data_help.text(configMap.default_data_help);

    // bind file change HANDLERS
    jqueryMap.$munge_metadata_input.change(onMetaFileChange);
    jqueryMap.$munge_data_input.change(onDataFilesChange);
    toggleInput( 'metadata', true );
    toggleInput( 'data', false );
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule      : initModule,
    configModule    : configModule,
    reset           : reset
  };

}());

module.exports = munge;
