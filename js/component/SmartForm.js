/**
 * Created by Â·¼Ñ on 2015/4/6.
 */
'use strict';
(function (ns) {
  var spinner = '<i class="fa fa-spin fa-spinner"></i>'
    , SmartForm = Backbone.View.extend({
      events: {
        'submit': 'submitHandler',
        'error form': 'form_errorHandler',
        'success form': 'form_successHandler'
      },
      getParam: function (array) {
        var param = {};
        for (var i = 0, len = array.length; i < len; i++) {
          param[array[i].name] = array[i].value;
        }
        return param;
      },
      showResult: function (form, isSuccess, msg) {
        var classes = isSuccess ? 'success fa-smile-o' : 'danger fa-frown-o';
        form.data('submit').prop('disabled', false)
          .find('.spin').remove()
          .end().find('i').show();
        form.find('.alert')
          .addClass('fa ' + classes)
          .text(msg)
          .slideDown();
      },
      form_errorHandler: function (event, error) {
        var form = $(event.target);
        switch (event.namespace) {
          case 'http':
            this.showResult(form, false, error.code);
            break;

          case 'status':
            this.showResult(form, false, error);
            break;

          case 'msg':
            this.showResult(form, false, error.meg);
            break;
        }
      },
      form_successHandler: function (event, response) {
        var form = $(event.target);
        this.showResult(form, true, response);
      },
      errorHandler: function (xhr, status, error) {
        if (error) {
          return this.trigger('error.http', error);
        }
        if (status) {
          return this.trigger('error.status', status);
        }
        this.trigger('error.msg', 'responseJSON' in xhr ? xhr.responseJSON : xhr.responseText);
      },
      submitHandler: function (event) {
        var form = $(event.target)
          , options = form.data()
          , submit = options.submit;

        form.find('.alert').hide().removeClass('fa-success fa-danger fa-smile-o fa-frown-o');

        if (!submit) {
          submit = form.find('[type=submit], [type=image], button:not([type=button])').add($('[form=' + form.attr('id') + ']'));
          form.data('submit', submit);
        }

        if (form.hasClass('fake')) {
          event.preventDefault();
          return false;
        }

        if (form.hasClass('ajax')) {
          var data = this.getParam(form.serializeArray());
          _.extend(data, options.data);
          submit.prop('disabled', true)
            .find('i').hide()
            .end().append(spinner);
          $.ajax(form.attr('action'), {
            context: form,
            data: data,
            dataType: 'json',
            type: 'POST',
            success: this.successHandler,
            error: this.errorHandler
          });
          event.preventDefault();
        }
      },
      successHandler: function (response) {
        if (response.code === 0) {
          this.trigger('success', response);
        } else {
          this.trigger('error.msg', response);
        }
      }
    });

  ns.SmartForm = new SmartForm({
    el: 'body'
  });
}(xline.component));