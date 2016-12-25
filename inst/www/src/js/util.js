'use strict';

//Show and hide the spinner for all ajax requests.
module.exports = (function(){

  var
    noop;

    noop = function(){};

  return { noop     : noop };
}());
