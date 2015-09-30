/**
 * Created by meathill on 2015/4/7.
 */
'use strict';
(function (ns) {
  var TopBar = Backbone.View.extend({
    events: {
      'success form': 'form_successHandler'
    },
    form_successHandler: function (event) {
      if (event.target.id === 'login-form' || event.target.id === 'register-form') {
        $('#me .login').remove();
        $('#me .profile').removeClass('hide');
      }
    }
  });

  ns.TopBar = new TopBar({
    el: 'body'
  });
}(xline.view));