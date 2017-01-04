'use strict';
var ocpu = require('../lib/opencpu.js/opencpu-0.5-npm.js');

//Show and hide the spinner for all ajax requests.
module.exports = (function(){

  var makeError, setConfigMap,
   serialize,
   deserializeSessionData,
   displayAsPrint,
   graphicR,
   unique;

  /* Begin Public method /serialize/
   * A convenience wrapper to create a serialized version of data
   *
   * @param object a serializeable object
   *
   * @return string representation data
   * @throws JavaScript error object and stack trace on unacceptable arguments
   */
  serialize = function ( data ) {
    var serialized;
    try {
        serialized = JSON.stringify( data );
    } catch( e ) {
        console.error(e);
    }
    return serialized;
  };
  // End Public method /serialize/

  /* Begin Public method /deserializeSessionData/
   * A convenience wrapper to create a Sessions from serialized
   * data. Each object value must be a Session
   *
   * @param string a serialized representation
   *
   * @return an object with Session values restored
   * @throws JavaScript error object and stack trace on unacceptable arguments
   */
  deserializeSessionData = function ( data ) {
    var deserialized = {};
    try {
      var raw = JSON.parse( data );
      Object.getOwnPropertyNames( raw )
            .forEach(function( key ) {
            deserialized[ key ] = new ocpu.Session( raw[key].loc, raw[key].key, raw[key].txt );
      });
    } catch( e ) {
        console.error(e);
    }
    return deserialized;
  };
  // End Public method /deserializeSessionData/

  // Begin Public constructor /makeError/
  // Purpose: a convenience wrapper to create an error object
  // Arguments:
  //   * name_text - the error name
  //   * msg_text  - long error message
  //   * data      - optional data attached to error object
  // Returns  : newly constructed error object
  // Throws   : none
  //
  makeError = function ( name_text, msg_text, data ) {
    var error     = new Error();
    error.name    = name_text;
    error.message = msg_text;

    if ( data ){ error.data = data; }

    return error;
  };
  // End Public constructor /makeError/

  // Begin Public method /setConfigMap/
  // Purpose: Common code to set configs in feature modules
  // Arguments:
  //   * input_map    - map of key-values to set in config
  //   * settable_map - map of allowable keys to set
  //   * config_map   - map to apply settings to
  // Returns: true
  // Throws : Exception if input key not allowed
  //
  setConfigMap = function ( arg_map ){
    var
      input_map    = arg_map.input_map,
      settable_map = arg_map.settable_map,
      config_map   = arg_map.config_map,
      key_name, error;

    for ( key_name in input_map ){
      if ( input_map.hasOwnProperty( key_name ) ){
        if ( settable_map.hasOwnProperty( key_name ) ){
          config_map[key_name] = input_map[key_name];
        }
        else {
          error = makeError( 'Bad Input',
            'Setting config key |' + key_name + '| is not supported'
          );
          throw error;
        }
      }
    }
  };
  // End Public method /setConfigMap/

  // Begin DOM method /displayAsPrint/
  /* Begin Public method /displayAsPrint/
   * A convenience wrapper to display the R object text description in a
   * Bootstrap panel. Also provides link to download object as .rds file.
   *
   * @param text some descriptive text for the header
   * @param session The ocpu Session
   * @param $container jQuery object to place panel inside with text
   */
  displayAsPrint = function(text, session, $container){
    var url = session.getLoc() + 'R/.val/print';

    $.get(url, function(data){
      // DOM manipulations
      var $code = $('<pre class="em-code"></pre>');
      $code.html(data);
      var $panel = $('<div class="panel panel-success">' +
                       '<div class="panel-heading">' +
                         '<h3 class="panel-title"></h3>' +
                       '</div>' +
                       '<div class="panel-body fixed-panel"></div>' +
                       '<div class="panel-footer"></div>' +
                     '</div>');
      $panel.find('.panel-title').text(text);
      $panel.find('.panel-body').append($code);
      $panel.find('.panel-footer').append('<a type="button" class="btn btn-default" href="' +
       session.getLoc() + 'R/.val/rds">Download (.rds)</a>');
      $container.empty();
      $container.append($panel);
    });
  };
  // End DOM method /displayAsPrint/

  /* Begin Public method /unique/
   * A convenience wrapper to reduce an array to unique elements
   *
   * @param array an array
   *
   * @return an array of unique elements
   */
  unique = function( array ) {
  	var n = [];
  	for(var i = 0; i < array.length; i++) {
  		if (n.indexOf(array[i]) === -1){
        n.push(array[i]);
      }
  	}
  	return n;
  };
  // End Public method /unique/

  /* Begin Public method /graphicR/
   * A convenience wrapper for formatting a graphic
   *
   * @param title string for the panel
   * @param func string the function to call
   * @param args object of function parameters
   * @param $container the jquery object to insert the image
   * @param cb the optional callback
   *
   * @return an array of unique elements
   */
  graphicR = function( title, func, args, $container, cb ){

    var
    jqxhr,
    onfail,
    onDone,
    cb = cb instanceof Function ? cb : function(){};

    onDone = function( ){
      cb ( null );
    };

    onfail = function( jqXHR ){
      var errText = "Server error: " + jqXHR.responseText;
      console.error(errText);
      cb( true );
    };

    // filter
    jqxhr = ocpu.call(func, args, function( session ){
      var $panel = $('<div class="panel panel-success">' +
                    '<div class="panel-heading">' +
                       '<h3 class="panel-title">' + title + '</h3>' +
                    '</div>' +
                    '<div class="panel-body">' +
                      '<img src="" class="img-responsive" alt="Responsive image">' +
                    '</div>' +
                    '<div class="panel-footer">' +
                      '<div class="btn-group dropup">' +
                        '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'  +
                          'Downloads <span class="caret"></span>' +
                        '</button>' +
                        '<ul class="dropdown-menu">' +
                          '<li><a href="' + session.getLoc() + 'graphics/1/png' + '" download>PNG</a></li>' +
                          '<li><a href="' + session.getLoc() + 'graphics/1/svg' + '" download>SVG</a></li>' +
                          '<li><a href="' + session.getLoc() + 'graphics/1/pdf' + '" download>PDF</a></li>' +
                          '<li role="separator" class="divider"></li>' +
                          '<li><a href="' + session.getLoc() + 'R/.val/rds" download>RDS</a></li>' +
                        '</ul>' +
                      '</div>' +
                    '</div>' +
                   '</div>');
      var $img = $panel.find('.img-responsive');
          $img.attr('src', session.getLoc() + 'graphics/1/png' );
      $container.append($panel);
    })
    .done( onDone )
    .fail( onfail );
  };
  // End DOM method /plotR/

  return {
    makeError               : makeError,
    setConfigMap            : setConfigMap,
    serialize               : serialize,
    deserializeSessionData  : deserializeSessionData,
    displayAsPrint          : displayAsPrint,
    unique                  : unique,
    graphicR                : graphicR
  };
}());
