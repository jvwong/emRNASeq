"use strict";

var util = require('./util.js');
var munge = require('./munge.js');
var process_rseq = require('./process_rseq.js');
var emdata = require('./emdata.js');
var ocpu = require('../lib/opencpu.js/opencpu-0.5-npm.js');

//init this script when the page has loaded
var shell = (function(){

  // ---------- BEGIN MODULE SCOPE VARIABLES -----------------------------------
  var
  configMap = {
    default_path : '//localhost:8080/R',
    anchor_schema_map : {
      metadata  : { enabled: true, disabled: true },
      data      : { enabled: true, disabled: true }
    },
    template : String() +
      '<div class="container em-shell">' +
        '<div class="em-shell-munge"></div>' +
        '<div class="em-shell-process_rseq"></div>' +
        '<div class="em-shell-emdata"></div>' +
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
      $munge_container          : $container.find('.em-shell .em-shell-munge'),
      $process_rseq_container   : $container.find('.em-shell .em-shell-process_rseq'),
      $emdata_container         : $container.find('.em-shell .em-shell-emdata')
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
  initModule = function( $container, path ){
    if(!ocpu){ alert('server error'); return; }

    var jqxhr;
    path = path || configMap.default_path;
    jqxhr = ocpu.seturl( path );
    jqxhr.fail(function(){
      console.error( 'Could not set server path %s', path );
      return false;
    });

    jqxhr.done(function(){
      $container.html( configMap.template );
      setJQueryMap( $container );

      // configure and initialize feature modules
      $.gevent.subscribe(
        jqueryMap.$process_rseq_container,
        'em-munge-data',
        function ( event, msg_map ) {
          localStorage.setItem( 'em-munge-data', util.serialize(msg_map) );
          process_rseq.configModule({});
          process_rseq.initModule( jqueryMap.$process_rseq_container, msg_map  );
        }
      );
      $.gevent.subscribe(
        jqueryMap.$emdata_container,
        'em-process_rseq',
        function ( event, msg_map ) {
          localStorage.setItem( 'em-process_rseq', util.serialize(msg_map) );
          emdata.configModule({});
          emdata.initModule( jqueryMap.$emdata_container, msg_map  );
        }
      );

      munge.configModule({});
      munge.initModule( jqueryMap.$munge_container );
      // var msg_map = util.deserializeSessionData( localStorage.getItem( 'em-munge-data' ) );
      // process_rseq.configModule({});
      // process_rseq.initModule( jqueryMap.$process_rseq_container, msg_map );
      // var msg_map = util.deserializeSessionData( localStorage.getItem( 'em-process_rseq' ) );
      // emdata.configModule({});
      // emdata.initModule( jqueryMap.$emdata_container, msg_map  );
      return true;
    });

    return true;
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule    : initModule
  };

}());

module.exports = shell;
