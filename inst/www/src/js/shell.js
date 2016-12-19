"use strict";

//init this script when the page has loaded
var shell = (function(){

  var
  configMap = {
    template : String() +
      '<b>File</b> <input type="file" id="csvfile">' +
      '<br />' +
      '<b>Header</b> <select id="header">' +
          '<option>true</option>' +
          '<option>false</option>' +
        '</select>' +
        '<br />' +
        '<button id="submitbutton" type="button">Upload CSV file!</button>' +
        '<br>' +
        '<p>Export the data frame:</p>' +
        '<ol>' +
          '<li><a target="_blank" id="rdalink">rdata</a></li>' +
          '<li><a target="_blank" id="jsonlink">json</a></li>' +
          '<li><a target="_blank" id="csvlink">csv</a></li>' +
          '<li><a target="_blank" id="tablink">tab</a></li>' +
          '<li><a target="_blank" id="printlink">print</a></li>' +
          '<li><a target="_blank" id="mdlink">markdown</a></li>' +
        '</ol>' +
        '<p>' +
        'This page demonstrates how to upload a file. It works exactly the same as calling a function. We call <code>read.csav</code> so that it will be stored on the server as a data frame.' +
        '</p>' +
        '<p>' +
          '<b>Note that HTML5 is required to upload files!</b> <br />' +
          'This means that this won\'t work in internet explorer version 9 or lower.' +
          'You need Firefox, Chrome, Safari or Internet Explorer 10+' +
        '</p>'
  },
  stateMap = {
    ocpu: undefined
  },
  jqueryMap = {},
  initListeners,
  setJQueryMap,
  init;

  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function(){
    var $container = stateMap.$container;
    jqueryMap = {
      $container: $container
    };
  };
  // End DOM method /setJQueryMap/
  // ---------- END DOM METHODS ------------------------------------------------

  initListeners = function(){
    $("#submitbutton").on("click", function(){

      //arguments
      var myheader = $("#header").val() === "true";
      var myfile = $("#csvfile")[0].files[0];

      if(!myfile){
        alert("No file selected.");
        return;
      }

      //disable the button during upload
      $("#submitbutton").attr("disabled", "disabled");

      //perform the request
      var req = stateMap.ocpu.call("readcsvnew", {
        file : myfile,
        header : myheader
      }, function(session){
        $("#printlink").attr("href", session.getLoc() + "R/.val/print");
        $("#rdalink").attr("href", session.getLoc() + "R/.val/rda");
        $("#csvlink").attr("href", session.getLoc() + "R/.val/csv");
        $("#tablink").attr("href", session.getLoc() + "R/.val/tab");
        $("#jsonlink").attr("href", session.getLoc() + "R/.val/json");
        $("#mdlink").attr("href", session.getLoc() + "R/.val/md");
      });

      //if R returns an error, alert the error message
      req.fail(function(){
        alert("Server error: " + req.responseText);
      });

      //after request complete, re-enable the button
      req.always(function(){
        $("#submitbutton").removeAttr("disabled");
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
    setJQueryMap();
    initListeners();
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    init    : init
  };

}());

module.exports = shell;
