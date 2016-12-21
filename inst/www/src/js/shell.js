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
                '<input type="file" style="display: none;" id="em-munge-data-input">' +
              '</div>' +
              '<button type="submit" class="btn btn-primary" id="em-munge-submit">Submit</button>' +
            '</form>' +
          '</div>' +

          '<hr/>' +

          '<div class="em-section">' +
            '<h2>Outputs</h2>' +
            '<div class="row" id="em-munge-results"></div>' +
          '</div>' +

        '</div>' +
      '</div>',

    table_template : String() +
     '<table class="table table-striped table-bordered em-table">' +
       '<thead>' +
         '<tr></tr>' +
       '</thead>' +
     '</table>' +
     '<hr/>'
  },
  stateMap = {
    ocpu                : undefined,
    metadata            : undefined,
    meta_session        : undefined,
    data                : undefined
  },
  jqueryMap = {},
  registerListeners,
  onMetaFileChange,
  setJQueryMap, displayTable,
  initModule;
  // ---------- END MODULE SCOPE VARIABLES -------------------------------------

  // ---------- BEGIN UTILITY METHODS ------------------------------------------
  // ---------- END UTILITY METHODS --------------------------------------------


  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function($container){
    jqueryMap = {
      $container          : $container,
      $shell              : $container.find('#em-shell'),
      $munge              : $container.find('#em-shell #em-munge'),
      $munge_meta_input   : $container.find('#em-shell #em-munge #em-munge-meta input'),
      $munge_meta_help    : $container.find('#em-shell #em-munge #em-munge-meta .help-block'),
      $munge_data_input   : $container.find('#em-shell #em-munge #em-munge-data input'),
      $munge_data_help    : $container.find('#em-shell #em-munge #em-munge-data .help-block'),
      $munge_submit       : $container.find('#em-shell #em-munge #em-munge-submit'),
      $munge_results      : $container.find('#em-shell #em-munge #em-munge-results')
    };
  };
  // End DOM method /setJQueryMap/

  // Begin DOM method /displayTable/
  displayTable = function(caption, session, $container){
    session.getObject(function(data){
      if(!data.length){ return; }

      var $table = $container.html(configMap.table_template)
                             .find('table')
                             .last();

      var keys = Object.keys(data[0]);
      var headers = keys.map(function(v){
        return '<th>' + v + '</th>';
      });
      var aoColumns = keys.map(function(v){
        return {
           "mDataProp": v
        };
      });

      $table.prepend('<caption>' + caption + '</caption>');

      if(headers.length){
        $table.find('thead tr').html($(headers.join('')));
      }

      $table.DataTable({
            "aaData": data,
            "aoColumns": aoColumns
          });
    });
  };
  // End DOM method /displayTable/
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
      displayTable(file.name,
        stateMap.meta_session,
        jqueryMap.$munge_results);
    });

    jqxhr.done(function(){
      //clear any previous help messages
      jqueryMap.$munge_meta_help.html('');
    });

    jqxhr.fail(function(){
      var errText = "Server error: " + jqxhr.responseText;
      console.error(errText);
      jqueryMap.$munge_meta_help.html(errText);
    });
  };
  // End event handler /onMetaFileChange/


  registerListeners = function(){
    jqueryMap.$munge_meta_input.change(onMetaFileChange);
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
