"use strict";

var util = require('./util.js');

//init this script when the page has loaded
var munge = (function(){

  // ---------- BEGIN MODULE SCOPE VARIABLES -----------------------------------
  var
  configMap = {

    anchor_schema_map : {
      metadata  : { enabled: true, disabled: true },
      data      : { enabled: true, disabled: true }
    },

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
                '<input type="file" class="form-control-file" style="display: none;" id="em-munge-meta-input" >' +
                '<p class="help-block"><small>Tab-delimited (.txt). Headers for \'id\' (filenames) and \'class\'</small></p>' +
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
                '<p class="help-block"></p>' +
              '</div>' +
            '</div>' +
            '<div class="em-munge-data row">' +
              '<label class="col-sm-2 col-form-label">File</label>' +
              '<div class="col-sm-10">' +
                '<label class="btn btn-primary btn-file btn-md btn-block" for="em-munge-data-input">Select</label>' +
                '<input type="file" class="form-control-file" style="display: none;" id="em-munge-data-input" disabled multiple>' +
                '<p class="help-block"><small>Tab-delimited (.txt). Each row is gene name and count</small></p>' +
              '</div>' +
            '</div>' +
            '<div class="form-group em-munge-data-results"></div>' +
          '</fieldset>' +
        '</form>' +
      '</div>',

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

    settable_map : {
      set_anchor            : true
    },
    set_anchor              : null
  },

  stateMap = {
    ocpu                    : undefined,
    anchor_map              : {},
    metadata_session        : undefined,
    metadata_file           : undefined,
    data_session            : undefined,
    data_file               : undefined
  },
  jqueryMap = {},
  setJQueryMap,
  configModule,
  toggleInput,
  reset,
  onMetaFileChange,
  processMetaFile,
  onDataFilesChange,
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
      $munge_spec_label         : $container.find('.em-munge .em-munge-species label'),
      $munge_spec_help          : $container.find('.em-munge .em-munge-species .help-block'),
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
  processMetaFile = function(file, cb){
    if(!file){
      alert('No file selected.');
      return;
    }

    stateMap.metadata_file = file;

    //perform the request
    var jqxhr = stateMap.ocpu.call('create_meta', {
      metadata_file : file
    }, function(session){
      stateMap.metadata_session = session;
      displayAsTable('Results',
        stateMap.metadata_session,
        jqueryMap.$munge_metadata_results);
    });

    jqxhr.done(function(){
      //clear any previous help messages
      jqueryMap.$munge_metadata_help.text(file.name);
      cb(true);
    });

    jqxhr.fail(function(){
      var errText = "Server error: " + jqxhr.responseText;
      console.error(errText);
      jqueryMap.$munge_metadata_help.text(errText);
      jqueryMap.$munge_metadata_results.empty();
      cb(false);
    });

    return true;
  };
  // End DOM method /processMetaFile/

  // Begin DOM method /processDataFiles/
  processDataFiles = function(files, species, cb){

    if(!files.length){
      alert('No file(s) selected.');
      return;
    }

    if(!stateMap.metadata_file){
      alert('Please load metadata.');
      return;
    }

    stateMap.data_file = files;

    // opencpu only accepts single files as arguments
    var args = {
      metadata_file   : stateMap.metadata_file,
      species         : species
    };

    // loop through files
    for (var i = 0; i < files.length; i++) {
        var file = files.item(i);
        args['file' + i] = file;
    }

    //perform the request
    var jqxhr = stateMap.ocpu.call('merge_data',
      args,
      function(session){
        stateMap.data_session = session;
        displayAsPrint('Results',
          stateMap.data_session,
          jqueryMap.$munge_data_results);
    });

    jqxhr.done(function(){
      jqueryMap.$munge_data_help.text('Files merged: ' + stateMap.data_file.length);
      cb(true);
    });

    jqxhr.fail(function(){
      var errText = "Server error: " + jqxhr.responseText;
      console.error(errText);
      jqueryMap.$munge_data_help.text(errText);
      jqueryMap.$munge_data_results.empty();
      cb(false);
    });

    return true;
  };
  // End DOM method /processDataFiles/
  // ---------- END DOM METHODS ------------------------------------------------

  // ---------- BEGIN EVENT HANDLERS -------------------------------------------
  onMetaFileChange = function(){
    var
    self = $(this),
    file = self[0].files[0];
    return processMetaFile(file, function( done ){
      if( !done || !stateMap.metadata_session ) { return false; }
      configMap.set_anchor( 'data', 'enabled' );
    });
  };

  onDataFilesChange = function(){
    var self = $(this),
    files = self[0].files,
    species = jqueryMap.$munge_spec_input.val().trim().toLowerCase() || null;
    return processDataFiles(files, species, function(done){
      if( !done ){ return false; }
      configMap.set_anchor( 'metadata', 'disabled' );
    });
  };
  // ---------- END EVENT HANDLERS ---------------------------------------------

  // ---------- BEGIN PUBLIC METHODS -------------------------------------------
  // Begin public method /toggleInput/
  /* Toggle the input availbility for a matched element
   *
   * This should only be called by onHashchange
   *
   * @param label the stateMap key to set
   * @param do_enable
   *
   * @return boolean
   */
  toggleInput = function( label, do_enable ) {
    var $handles = label === 'data' ?
      [ jqueryMap.$munge_data_label,
        jqueryMap.$munge_data_input,
        jqueryMap.$munge_spec_input,
        jqueryMap.$munge_spec_input ] :
      [ jqueryMap.$munge_metadata_label,
        jqueryMap.$munge_metadata_input ];

    $.each( $handles, function( index, value ){
      value.attr('disabled', !do_enable);
      value.attr('disabled', !do_enable);
    });

    if( do_enable ){
      if( label === 'data' && stateMap.data_session ){
        displayAsPrint('Results',
          stateMap.data_session,
          jqueryMap.$munge_data_results);
      } else if (label === 'metadata' && stateMap.metadata_session ) {
        displayAsTable('Results',
          stateMap.metadata_session,
          jqueryMap.$munge_metadata_results);
      }
    }

    return true;
  };
  // End public method /toggleInput/

  // Begin public method /reset/
  /* Return to the ground state
   *
   * @return boolean
   */
  reset = function( $container ) {
    $container.html( configMap.template );
    setJQueryMap( $container );
    //rebind listeners
    jqueryMap.$munge_metadata_input.change(onMetaFileChange);
    jqueryMap.$munge_data_input.change(onDataFilesChange);

    // must clear out stateMap references
    stateMap.metadata_session = undefined;
    stateMap.metadata_file    = undefined;
    stateMap.data_session     = undefined;
    stateMap.data_file        = undefined;

    // reset anchors
    configMap.set_anchor( 'data', 'enabled' );
    configMap.set_anchor( 'metadata', 'disabled' );
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
   * @param path (String) path
   * @param $container (Object) jQuery parent
   */
  initModule = function(ocpu, $container){
    stateMap.ocpu = ocpu;
    $container.html( configMap.template );
    setJQueryMap( $container );

    // bind file change HANDLERS
    jqueryMap.$munge_metadata_input.change(onMetaFileChange);
    jqueryMap.$munge_data_input.change(onDataFilesChange);
    configMap.set_anchor( 'data', 'disabled' );
    configMap.set_anchor( 'metadata', 'enabled' );
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule      : initModule,
    configModule    : configModule,
    toggleInput     : toggleInput,
    reset           : reset
  };

}());

module.exports = munge;
