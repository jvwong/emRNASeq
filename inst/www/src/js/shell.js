"use strict";

var util = require('./util.js');
var munge = require('./munge.js');
var process_rseq = require('./process_rseq.js');
var ocpu = require('../lib/opencpu.js/opencpu-0.5-npm.js');

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
      '<div class="container em-shell">' +
        '<button class="btn btn-danger pull-right em-shell-clear ajax-sensitive">Reset</button>' +
        '<div class="em-shell-munge"></div>' +
        '<div class="em-shell-process_rseq"></div>' +
      '</div>'
  },
  // stateMap = {},
  jqueryMap = {},
  setJQueryMap,
  clearInput,
  initModule;
  // ---------- END MODULE SCOPE VARIABLES -------------------------------------


  // ---------- BEGIN UTILITY METHODS ------------------------------------------
  // ---------- END UTILITY METHODS --------------------------------------------


  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function( $container ){
    jqueryMap = {
      $container                : $container,
      $shell                    : $container.find('.em-shell'),
      $shell_clear              : $container.find('.em-shell .em-shell-clear'),
      $munge_container          : $container.find('.em-shell .em-shell-munge'),
      $process_rseq_container   : $container.find('.em-shell .em-shell-process_rseq')
    };
  };
  // End DOM method /setJQueryMap/

  // Begin DOM method /clearInput/
  /* Clears the input and resets the state to ground zero
   *
   * @return  boolean Whether the anchor portion could be updated
   */
  clearInput = function( ){
    return munge.reset( );
  };
  // End DOM method /clearInput/
  // ---------- END DOM METHODS ------------------------------------------------

  // ---------- BEGIN EVENT HANDLERS -------------------------------------------
  // ---------- END EVENT HANDLERS ---------------------------------------------

  //---------------------- BEGIN CALLBACKS ---------------------
  //----------------------- END CALLBACKS ----------------------

  // ---------- BEGIN PUBLIC METHODS -------------------------------------------

  /* initModule
   * @param path (String) path
   * @param $container (Object) jQuery parent
   */
  initModule = function(path, $container){
    if(path){
      ocpu.seturl(path);
    }
    $container.html( configMap.template );
    setJQueryMap( $container );

    // configure and initialize feature modules
    jqueryMap.$shell_clear.click( clearInput );
    // munge.configModule({});
    // munge.initModule( jqueryMap.$munge_container );
    // $.gevent.subscribe(
    //   jqueryMap.$process_rseq_container,
    //   'em-munge-data',
    //   function ( event, msg_map ) {
    //     localStorage.setItem( 'em-munge-data', util.serialize(msg_map) );
    //     process_rseq.configModule({});
    //     process_rseq.initModule( jqueryMap.$process_rseq_container, msg_map  );
    //   }
    // );

    var msg_map = util.deserializeSessionData( localStorage.getItem( 'em-munge-data' ) );
    process_rseq.configModule({});
    process_rseq.initModule( jqueryMap.$process_rseq_container, msg_map );

    return true;
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule    : initModule
  };

}());

module.exports = shell;
