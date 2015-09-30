/**
 * Created by meathill on 2015/4/6.
 */
'use strict';
(function (ns) {
  var spinner = '<i class="fa fa-spin fa-spinner"></i>'
    , ERROR_HTTP = 1
    , ERROR_STATUS = 2
    , ERROR_MSG =3
    , SmartForm = Backbone.View.extend({
      events: {
        'submit': 'submitHandler',
        'error form': 'form_errorHandler',
        'success form': 'form_successHandler',
        'hide.bs.modal': 'modal_hideHandler'
      },
      getParam: function (array) {
        var param = {};
        for (var i = 0, len = array.length; i < len; i++) {
          param[array[i].name] = array[i].value;
        }
        return param;
      },
      showResult: function (form, isSuccess, msg) {
        var classes = isSuccess ? 'success' : 'danger'
          , icon = '<i class="fa fa-' + (isSuccess ? 'smile-o' : 'frown-o') + '"></i> ';
        form.data('submit').prop('disabled', false)
          .find('.fa-spin').remove()
          .end().find('i').show();
        form.find('.alert-msg')
          .addClass('alert-' + classes)
          .html(icon + msg)
          .slideDown();
        form.find('input, select, textarea').not(form.data('exclusive')).prop('disabled', false);

        if (isSuccess) {
          var modal = form.closest('.modal');
          if (modal.length) {
            var timeout = setTimeout(function () {
              modal.modal('hide');
            }, 3000);
            modal.data('timeout', timeout);
          }
        }
      },
      form_errorHandler: function (event, type, error) {
        var form = $(event.target);
        switch (type) {
          case ERROR_HTTP:
            this.showResult(form, false, error);
            break;

          case ERROR_STATUS:
            this.showResult(form, false, error);
            break;

          case ERROR_MSG:
            this.showResult(form, false, error.msg + ('error' in error ? '<br>' + error.error : ''));
            break;
        }
      },
      form_successHandler: function (event, response) {
        var form = $(event.target);
        this.showResult(form, true, response.msg);
      },
      modal_hideHandler: function (event) {
        var timeout = $(event.target).data('timeout');
        clearTimeout(timeout);
      },
      errorHandler: function (xhr, status, error) {
        if ('responseJSON' in xhr) {
          return this.trigger('error', [ERROR_MSG, xhr.responseJSON]);
        }
        if (error) {
          return this.trigger('error', [ERROR_HTTP, error]);
        }
        this.trigger('error', [ERROR_STATUS, status]);
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
            .end().prepend(spinner);
          form
            .data('exclusive', form.find(':disabled'))
            .find('input, select, textarea').prop('disabled', true);
          $.ajax(form.attr('action'), {
            context: form,
            data: data,
            dataType: 'json',
            type: form.attr('method') || 'POST',
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
          this.trigger('error', [ERROR_MSG, response]);
        }
      }
    });

  ns.SmartForm = new SmartForm({
    el: 'body'
  });
}(xline.component));