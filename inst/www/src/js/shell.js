"use strict";

//init this script when the page has loaded
var shell = (function(){

  // ---------- BEGIN MODULE SCOPE VARIABLES -----------------------------------
  var
  configMap = {
    anchor_schema_map : {
      metadata  : { enabled: true, disabled: true },
      data      : { enabled: true, disabled: true }
    },
    template : String() +
      '<div class="container" id="em-shell">' +
        '<div id="em-munge">' +
          '<div class="em-section">' +
            '<h2>Data Munge <small>Upload RNA sequencing (meta)data</small></h2>' +
            '<hr/>' +

            '<form>' +
              '<div class="form-group" id="em-munge-species">' +
                '<label for="em-munge-species-input">Species</label>' +
                '<input type="text" class="form-control" id="em-munge-species-input" placeholder="Optional">' +
                '<p class="help-block"></p>' +
              '</div>' +
              '<div class="form-group" id="em-munge-meta">' +
                '<h3>Metadata</h3>' +
                '<label class="btn btn-info btn-file btn-lg btn-block" for="em-munge-meta-input">Metadata</label>' +
                '<input type="file" class="form-control" style="display: none;" id="em-munge-meta-input">' +
                '<p class="help-block"><small>Tab-delimited (.txt). Headers for \'id\' (filenames) and \'class\'</small></p>' +
                '<div class="form-group" id="em-munge-meta-results"></div>' +
              '</div>' +
              '<div class="form-group" id="em-munge-data">' +
                '<h3>Data</h3>' +
                '<label class="btn btn-primary btn-file btn-lg btn-block" for="em-munge-data-input">Data</label>' +
                '<input type="file" class="form-control" style="display: none;" id="em-munge-data-input" multiple>' +
                '<p class="help-block"><small>Tab-delimited (.txt). Each row is gene name and count</small></p>' +
                '<div class="form-group" id="em-munge-data-results"></div>' +
              '</div>' +
            '</form>' +

          '</div>' +
          '<hr/>' +
        '</div>' +
      '</div>',

    table_template : String() +
     '<table class="table table-striped table-bordered em-table">' +
       '<thead>' +
         '<tr></tr>' +
       '</thead>' +
     '</table>',

     code_template : String() +
      '<pre class="em-code"></pre>'
  },
  stateMap = {
    ocpu                : undefined,
    anchor_map          : {},
    metadata            : undefined,
    meta_session        : undefined,
    data                : undefined,
    data_session        : undefined
  },
  jqueryMap = {},
  copyAnchorMap, changeAnchorPart, onHashchange,
  setJQueryMap,
  toggleInput,
  onMetaFileChange, processMetaFile, onDataFilesChange, processDataFiles,
  displayAsTable, displayAsPrint,
  initModule;
  // ---------- END MODULE SCOPE VARIABLES -------------------------------------


  // ---------- BEGIN UTILITY METHODS ------------------------------------------
  copyAnchorMap = function(){
    return $.extend(true, {}, stateMap.anchor_map);
  };
  // ---------- END UTILITY METHODS --------------------------------------------


  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function($container){
    jqueryMap = {
      $container            : $container,
      $shell                : $container.find('#em-shell'),
      $munge                : $container.find('#em-shell #em-munge'),
      $munge_metadata_input     : $container.find('#em-shell #em-munge #em-munge-meta input'),
      $munge_metadata_label     : $container.find('#em-shell #em-munge #em-munge-meta label'),
      $munge_metadata_help      : $container.find('#em-shell #em-munge #em-munge-meta .help-block'),
      $munge_metadata_results   : $container.find('#em-shell #em-munge #em-munge-meta-results'),
      $munge_spec_input     : $container.find('#em-shell #em-munge #em-munge-species input'),
      $munge_spec_label     : $container.find('#em-shell #em-munge #em-munge-species label'),
      $munge_spec_help      : $container.find('#em-shell #em-munge #em-munge-species .help-block'),
      $munge_data_input     : $container.find('#em-shell #em-munge #em-munge-data input'),
      $munge_data_label     : $container.find('#em-shell #em-munge #em-munge-data label'),
      $munge_data_help      : $container.find('#em-shell #em-munge #em-munge-data .help-block'),
      $munge_data_results   : $container.find('#em-shell #em-munge #em-munge-data-results')
    };
  };
  // End DOM method /setJQueryMap/

  // Being DOM method /toggleInput/
  /* Toggle the input availbility for a matched element
   *
   * This should only be called by onHashchange
   *
   * @param do_enable
   * @param $handles an array of jQuery objects to enable/disable
   * @param stateMap_handle the stateMap key to set
   *
   * @return boolean
   */
  toggleInput = function( do_enable, $handles ) {
    if ( do_enable ) {

      $.each( $handles, function( index, value ){
        value.attr('disabled', false);
        value.attr('disabled', false);
      });
      return true;
    }

    $.each( $handles, function( index, value ){
      value.attr('disabled', true);
      value.attr('disabled', true);
    });
    return true;
  };
  // End DOM method /toggleInput/

  // Begin DOM method /changeAnchorPart/
  /* Changes part of the URI anchor component
   *
   * This method copies the map using copyAnchorMap(); modifies the key-value using arg_map;
   * manages the distinction between indpendent and dependent values; attempts to change the anchor
   * and returns true on success and false on failure.
   *
   * @param arg_map The map describing what part of the URI anchor we wanted changed
   *
   * @return  boolean Whether the anchor portion could be updated
   */
   changeAnchorPart = function( arg_map ){
     var anchor_map_revise = copyAnchorMap(),
      bool_return = true,
      key_name, key_name_dep;

      //Begin merge changes into anchor map
      KEYVAL:
      for ( key_name in arg_map ){
        if ( arg_map.hasOwnProperty( key_name ) ){
          //skip dependent keys during iteration
          if( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }

          //update independent key value
          anchor_map_revise[key_name] = arg_map[key_name];

          //update matching dependent key
          key_name_dep = '_' + key_name;
          if( arg_map[key_name_dep] ){
            anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
          } else {
            delete anchor_map_revise[key_name_dep];
            delete anchor_map_revise['_s' + key_name_dep];
          }
        }
      }
      // End merge changes into anchor map

      // Begin attempt to update URI; revert if not successful
      try {
        $.uriAnchor.setAnchor( anchor_map_revise );
      } catch ( error ) {
        // replace URI with existing state
        alert( error );
        $.uriAnchor.setAnchor( stateMap.anchor_map, null, true);
        bool_return = false;
      }

      return bool_return;
   };
  // End DOM method /changeAnchorPart/

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
      $container.append('<h4>' + text + '</h4>');
      $container.append($table);
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
      $container.append('<h4>' + text + '</h4>');
      $container.append($code);
      $container.append('<a type="button" class="btn btn-success" href="' +
       session.getLoc() + 'R/.val/rds">Download (.rds)</a>');
    });
  };
  // End DOM method /displayAsPrint/

  // Begin DOM method /processMetaFile/
  processMetaFile = function(file, cb){
    if(!file){
      alert('No file selected.');
      return;
    }

    //cache the file in the stateMap
    stateMap.metadata = file;

    //perform the request
    var jqxhr = stateMap.ocpu.call('create_meta', {
      meta_file : file
    }, function(session){
      stateMap.meta_session = session;
      jqueryMap.$munge_metadata_results.empty();
      displayAsTable('Metadata details',
        stateMap.meta_session,
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

    if(!stateMap.metadata){
      alert('Please load metadata.');
      return;
    }

    //cache the files in the stateMap
    stateMap.data = files;

    // opencpu only accepts single files as arguments
    var args = {
      meta_file   : stateMap.metadata,
      species     : species
    };

    // loop through files
    for (var i = 0; i < files.length; i++) {
        var file = files.item(i);
        args['file' + i] = file;
    }

    //perform the request
    var jqxhr = stateMap.ocpu.call('merge_data', args, function(session){
      stateMap.data_session = session;
      displayAsPrint('Data details',
        stateMap.data_session,
        jqueryMap.$munge_data_results);
    });

    jqxhr.done(function(){
      jqueryMap.$munge_data_help.text('Files merged: ' + stateMap.data.length);
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
  // Begin event handler /onHashchange/
  /* Purpose: Handles the hashchange event
   *
   * Parses the URI anchor; compares the porposed application state with current;
   * adjust the application only where proposed state differs from existing
   * @param event jQuery event object
   *
   * @return boolean
   */
   onHashchange = function( ){
     var
      anchor_map_previous = copyAnchorMap(),
      anchor_map_proposed;

      //attempt to parse anchor
      try {
        anchor_map_proposed = $.uriAnchor.makeAnchorMap();
      } catch ( error ) {
        $.uriAnchor.setAnchor( anchor_map_previous, null, true );
        return false;
      }
      stateMap.anchor_map = anchor_map_proposed;


      //*** Begin adjust data component
      var
      _s_data_previous,
      _s_data_proposed,
      s_data_proposed;
      _s_data_previous = anchor_map_previous._s_data;
      _s_data_proposed = anchor_map_proposed._s_data;
      if ( ! anchor_map_previous || _s_data_previous !== _s_data_proposed){
        s_data_proposed = anchor_map_proposed.data;
        switch ( s_data_proposed ) {
          case 'enabled':
            toggleInput( true,
              [jqueryMap.$munge_data_label, jqueryMap.$munge_data_input] );
          break;
          case 'disabled':
            toggleInput( false,
              [jqueryMap.$munge_data_label, jqueryMap.$munge_data_input] );
          break;
          default:
            toggleInput( false,
              [jqueryMap.$munge_data_label, jqueryMap.$munge_data_input] );
            delete anchor_map_proposed.data;
            $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
        }
      }
      //End adjust data component

      //*** Begin adjust metadata component
      var
      _s_metadata_previous,
      _s_metadata_proposed,
      s_metadata_proposed;
      _s_metadata_previous = anchor_map_previous._s_metadata;
      _s_metadata_proposed = anchor_map_proposed._s_metadata;
      if ( ! anchor_map_previous || _s_metadata_previous !== _s_metadata_proposed){
        s_metadata_proposed = anchor_map_proposed.metadata;
        switch ( s_metadata_proposed ) {
          case 'enabled':
            toggleInput( true,
              [jqueryMap.$munge_metadata_label, jqueryMap.$munge_metadata_input] );
          break;
          case 'disabled':
            toggleInput( false,
              [jqueryMap.$munge_metadata_label, jqueryMap.$munge_metadata_input] );
          break;
          default:
            toggleInput( false,
              [jqueryMap.$munge_metadata_label, jqueryMap.$munge_metadata_input] );
            delete anchor_map_proposed.metadata;
            $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
        }
      }
      //End adjust metadata component

      return false;
   };
   // End event handler /onHashchange/

  onMetaFileChange = function(){
    var file = $(this)[0].files[0];
    return processMetaFile(file, function(done){
      changeAnchorPart({
        data: ( done ? 'enabled' : 'disabled' )
      });
    });
  };

  onDataFilesChange = function(){
    var files = $(this)[0].files,
    species = jqueryMap.$munge_spec_input.val() || null;
    return processDataFiles(files, species, function(done){
      changeAnchorPart({
        metadata: ( done ? 'disabled' : 'enabled' )
      });
    });
  };
  // ---------- END EVENT HANDLERS ---------------------------------------------

  // ---------- BEGIN PUBLIC METHODS -------------------------------------------

  /* initModule
   * @param ocpu (Object) ocpu singleton
   * @param path (String) path
   * @param $container (Object) jQuery parent
   */
  initModule = function(ocpu, path, $container){
    stateMap.ocpu = ocpu;
    if(path){
      stateMap.ocpu.seturl(path);
    }
    $container.html(configMap.template);
    setJQueryMap($container);

    // bind file change HANDLERS
    jqueryMap.$munge_metadata_input.change(onMetaFileChange);
    jqueryMap.$munge_data_input.change(onDataFilesChange);

    // configure uriAnchor to use our schema
    $.uriAnchor.configModule({
      schema_map : configMap.anchor_schema_map
    });


    // Handles URI anchor change events.
    // This is done /after/ all feature modules are configured and init'd,
    // otherwise they will not be ready to handle the trigger event, which is
    // used to ensure the anchor is considered on-load
    $(window)
      .bind( 'hashchange', onHashchange )
      .trigger( 'hashchange' );
    changeAnchorPart({ metadata: 'enabled', data: 'disabled' });
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule    : initModule
  };

}());

module.exports = shell;
