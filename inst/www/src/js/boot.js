'use strict';

//Show and hide the spinner for all ajax requests.
module.exports = (function(){
  var
    initModule;

  initModule = function(){
    $(document)
      .ajaxStart(function(){
          $('#ajax-spinner').show();
          // Hide any buttons that could unsync with ajax error handlers
          $('.ajax-sensitive').attr('disabled', true);
      })
      .ajaxStop(function(){
          $('#ajax-spinner').hide();
          $('.ajax-sensitive').attr('disabled', false);
      });
  };
  return { initModule     : initModule };
}());
