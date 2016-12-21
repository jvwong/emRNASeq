"use strict";

//init this script when the page has loaded
var shell = (function(){

  // ---------- BEGIN MODULE SCOPE VARIABLES -----------------------------------
  var
  configMap = {
    template : String() +
      '<div class="container" id="em-shell">' +
        '<div id="em-munge">' +

          '<div class="em-section">' +
            '<h2>Inputs</h2>' +
            '<div class="row">' +
              '<p>Load in your tab-delimited (.txt) metadata file with columns for the \'id\' (filename) and \'class\' (phenotype).</p>' +
            '</div>' +
            '<form>' +
              '<div class="form-group" id="em-munge-meta">' +
                '<label class="btn btn-info btn-file" for="em-munge-meta-input">Metadata</label>' +
                '<input type="file" style="display: none;" id="em-munge-meta-input">' +
                '<p class="help-block"></p>' +
              '</div>' +
              '<div class="form-group" id="em-munge-data">' +
                '<label class="btn btn-primary btn-file" for="em-munge-data-input">Data</label>' +
                '<input type="file" style="display: none;" id="em-munge-data-input" multiple>' +
                '<p class="help-block"></p>' +
              '</div>' +
            '</form>' +
          '</div>' +

          '<hr/>' +

          '<div class="em-section">' +
            '<div class="row" id="em-munge-meta-results"></div>' +
            '<div class="row" id="em-munge-data-results"></div>' +
          '</div>' +

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
    metadata            : undefined,
    meta_session        : undefined,
    data                : undefined,
    data_session        : undefined
  },
  jqueryMap = {},
  registerListeners,
  onMetaFileChange, onDataFilesChange,
  setJQueryMap,
  displayAsTable, displayAsPrint,
  initModule;
  // ---------- END MODULE SCOPE VARIABLES -------------------------------------

  // ---------- BEGIN UTILITY METHODS ------------------------------------------
  // ---------- END UTILITY METHODS --------------------------------------------


  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function($container){
    jqueryMap = {
      $container            : $container,
      $shell                : $container.find('#em-shell'),
      $munge                : $container.find('#em-shell #em-munge'),
      $munge_meta_input     : $container.find('#em-shell #em-munge #em-munge-meta input'),
      $munge_meta_help      : $container.find('#em-shell #em-munge #em-munge-meta .help-block'),
      $munge_meta_results   : $container.find('#em-shell #em-munge #em-munge-meta-results'),
      $munge_data_input     : $container.find('#em-shell #em-munge #em-munge-data input'),
      $munge_data_help      : $container.find('#em-shell #em-munge #em-munge-data .help-block'),
      $munge_data_results   : $container.find('#em-shell #em-munge #em-munge-data-results')
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
      $container.append('<h3>' + text + '</h3>');
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
      $container.append('<h3>' + text + '</h3>');
      $container.append($code);
      $container.append('<a type="button" class="btn btn-success" href="' + session.getLoc() + 'R/.val/rds">Download (.rds)</a>');
    });
  };
  // End DOM method /displayAsPrint/
  // ---------- END DOM METHODS ------------------------------------------------

  // ---------- BEGIN EVENT HANDLERS -------------------------------------------
  // Begin event handler /onMetaFileChange/
  onMetaFileChange = function(){
    //arguments
    var file = $(this)[0].files[0];
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
      jqueryMap.$munge_meta_results.empty();
      displayAsTable('Metadata',
        stateMap.meta_session,
        jqueryMap.$munge_meta_results);
    });

    jqxhr.done(function(){
      //clear any previous help messages
      jqueryMap.$munge_meta_help.text(file.name);
    });

    jqxhr.fail(function(){
      var errText = "Server error: " + jqxhr.responseText;
      console.error(errText);
      jqueryMap.$munge_meta_help.text(errText);
    });
  };
  // End event handler /onMetaFileChange/

  // Begin event handler /onDataFilesChange/
  onDataFilesChange = function(){
    //arguments
    var files = $(this)[0].files;
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
      species     : 'mouse'
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
    });

    jqxhr.fail(function(){
      var errText = "Server error: " + jqxhr.responseText;
      console.error(errText);
      jqueryMap.$munge_data_help.text(errText);
    });
  };
  // End event handler /onDataFilesChange/


  registerListeners = function(){
    jqueryMap.$munge_meta_input.change(onMetaFileChange);
    jqueryMap.$munge_data_input.change(onDataFilesChange);
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
    registerListeners();
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule    : initModule
  };

}());

module.exports = shell;
