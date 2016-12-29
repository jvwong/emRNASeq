"use strict";
var munge = require('./munge.js');

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
        '<button class="btn btn-danger pull-right em-shell-clear">Reset</button>' +
        '<div class="em-shell-munge"></div>' +
      '</div>'
  },
  stateMap = {
    ocpu                : undefined,
    anchor_map          : {}
  },
  jqueryMap = {},
  copyAnchorMap,
  setJQueryMap,
  clearInput,
  changeAnchorPart,
  onHashchange,
  setAnchor,
  initModule;
  // ---------- END MODULE SCOPE VARIABLES -------------------------------------


  // ---------- BEGIN UTILITY METHODS ------------------------------------------
  copyAnchorMap = function(){
    return $.extend(true, {}, stateMap.anchor_map);
  };
  // ---------- END UTILITY METHODS --------------------------------------------


  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function( $container ){
    jqueryMap = {
      $container              : $container,
      $shell                  : $container.find('.em-shell'),
      $shell_clear            : $container.find('.em-shell .em-shell-clear'),
      $munge_container        : $container.find('.em-shell .em-shell-munge')
    };
  };
  // End DOM method /setJQueryMap/

  // Begin DOM method /clearInput/
  /* Clears the input and resets the state to ground zero
   *
   * @return  boolean Whether the anchor portion could be updated
   */
  clearInput = function(){
    return munge.reset( jqueryMap.$munge_container );
  };
  // End DOM method /clearInput/

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

      onHashchange(); //call manually
      return bool_return;
   };
  // End DOM method /changeAnchorPart/
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

      Object.getOwnPropertyNames( configMap.anchor_schema_map )
        .forEach(function(val){
          var
          _s_x_previous = '_s_' + val,
          _s_x_proposed = '_s_' + val,
          s_x_proposed;

          _s_x_previous = anchor_map_previous[_s_x_previous];
          _s_x_proposed = anchor_map_proposed[_s_x_proposed];

          if ( ! anchor_map_previous || _s_x_previous !== _s_x_proposed){
            s_x_proposed = anchor_map_proposed[val];
            switch ( s_x_proposed ) {
              case 'enabled':
                munge.toggleInput( val, true );
              break;
              case 'disabled':
                munge.toggleInput( val, false );
              break;
              default:
                munge.toggleInput( val, false );
                delete anchor_map_proposed.data;
                $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
            }
          }
      });

      return false;
   };
   // End event handler /onHashchange/
  // ---------- END EVENT HANDLERS ---------------------------------------------

  //---------------------- BEGIN CALLBACKS ---------------------
  /* Begin callback method /setAnchor/
   *    Changes the URI anchor parameter 'data' to the requested
   *    value if possible.
   *  Example  : setAnchor( 'enabled' );
   *  Purpose  : Change the data component of the anchor
   *  @param string 'enabled' or 'disabled'
   *  @return boolean true  - requested anchor part was updated; false -
   *  requested anchor part was not updated
   **/
   setAnchor = function ( label, position_type ){
     var obj = {};
     obj[label] = position_type;
     return changeAnchorPart( obj );
   };
  // End callback method /setAnchor/
  //----------------------- END CALLBACKS ----------------------

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
    $container.html( configMap.template );
    setJQueryMap( $container );

    // configure uriAnchor to use our schema
    $.uriAnchor.configModule({ schema_map : configMap.anchor_schema_map });

    // configure and initialize feature modules
    munge.configModule({
      set_anchor     : setAnchor
     });
    munge.initModule( ocpu, jqueryMap.$munge_container );
    jqueryMap.$shell_clear.click( clearInput );

    // Handles URI anchor change events.
    // This is done /after/ all feature modules are configured and init'd,
    // otherwise they will not be ready to handle the trigger event, which is
    // used to ensure the anchor is considered on-load
    $( window )
      .bind( 'hashchange', onHashchange );
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule    : initModule
  };

}());

module.exports = shell;
