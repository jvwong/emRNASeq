"use strict";

//init this script when the page has loaded
var shell = (function(){

  var
  configMap = {
    template : String() +

      '<div class="container" id="emrnaseq-container">' +
        '<div class="section">' +
          '<h2>Munge</h2>' +
          '<div class="row">' +
            '<p>' +
              'This section demonstrates how to upload RNA-Seq expression metadata.' +
              'We call <code>create_meta</code> which is stored on the server as a data frame.' +
              'All files must be tab delimited (.txt).' +
            '</p>' +
          '</div>' +

          '<div class="row">' +
            '<b>Select metadata file</b> <input type="file" id="metadata">' +
          '</div>' +

          '<div class="row" id="meta-results"></div>' +
        '</div>' +

        '<div class="section">' +
          '<h2>Merge</h2>' +
          '<div class="row">' +
            '<p>' +
              'This page demonstrates how to upload RNA-Seq expression data.' +
              'We call <code>merge_data</code> which is stored on the server as a SummarizedExperiment.' +
              'All files must be tab delimited (.txt).' +
            '</p>' +
          '</div>' +

          '<div class="row">' +
            '<b>Select files</b> <input type="file" id="data" multiple>' +
          '</div>' +
          '<div class="row" id="data-results"></div>' +
        '</div>' +
      '</div>',

     meta_table_template : String() +
       '<table class="table table-striped table-bordered" id="meta-table">' +
         '<thead>' +
           '<tr>' +
               '<th>id</th>' +
               '<th>class</th>' +
           '</tr>' +
         '</thead>' +
       '</table>'
  },
  stateMap = {
    ocpu: undefined,
    meta_session: undefined
  },
  jqueryMap = {},
  initListeners,
  setJQueryMap, displayTable,
  init;

  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function($container){
    jqueryMap = {
      $container: $container,
      $metaresults: $container.find('#meta-results')
    };
  };
  // End DOM method /setJQueryMap/
  // ---------- END DOM METHODS ------------------------------------------------

  displayTable = function(session, $container){
    session.getObject(function(data){
      if(!data.length){ return; }
      var keys = Object.keys(data[0]);
      var aoColumns = keys.map(function(v){
        return {
           "mDataProp": v
        };
      });
      $container
        .DataTable({
            "aaData": data,
            "aoColumns": aoColumns
        });
    });
  };

  initListeners = function(){
    // $('#data').change(function(){
    //   //arguments
    //   var myfiles = $(this)[0].files;
    //
    //   if(!myfiles.length){
    //     alert("No file selected.");
    //     return;
    //   }
    //
    //   //perform the request
    //   var req = stateMap.ocpu.call('merge_data', {
    //     meta : true,
    //     species: 'mouse'
    //   }, function(session){
    //     stateMap.data_session = session;
    //     console.log('back!');
    //   });
    //   //if R returns an error, alert the error message
    //   req.fail(function(){
    //     alert("Server error: " + req.responseText);
    //   });
    // });

    $('#metadata').change(function(){
      //arguments
      var myfile = $("#metadata")[0].files[0];
      if(!myfile){
        alert("No file selected.");
        return;
      }
      //perform the request
      var req = stateMap.ocpu.call("create_meta", {
        meta_file : myfile
      }, function(session){
        stateMap.meta_session = session;
        var $table = jqueryMap.$metaresults
                              .html(configMap.meta_table_template)
                              .find('table#meta-table').last();
        displayTable(stateMap.meta_session, $table);
      });
      //if R returns an error, alert the error message
      req.fail(function(){
        alert("Server error: " + req.responseText);
      });
    });
  };

  // ---------- BEGIN PUBLIC METHODS ------------------------------------------

  /* init
   * params
   *  - ocpu: The ocpu singleton
   *  - path: The path to the library e.g. //127.0.0.1:8080/ocpu/library/emRNASeq/R
   */
  init = function(ocpu, path, $container){
    stateMap.ocpu = ocpu;
    if(path){
      stateMap.ocpu.seturl(path);
    }
    $container.html(configMap.template);
    setJQueryMap($container);
    initListeners();
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    init    : init
  };

}());

module.exports = shell;
