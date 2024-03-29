/**
 * Created by 路佳 on 14-9-2.
 */
;(function (ns) {
  'use strict';

  var API = '/wp-content/themes/xline/api/index.php'
    , Collection = Backbone.Collection.extend({
      url: API
    })
    , Model = Backbone.Model.extend({
      defaults: {
        'number': 9,
        'playername': '',
        'size': 1
      },
      parse: function (response) {
        return response.data;
      },
      urlRoot: API
    });

  function updateTotal(response) {
    if ('quantity' in response) {
      $('.quantity').text(response.quantity);
    }
    if ('sub' in response) {
      $('.cart-subtotal .amount').text('¥ ' + response.sub);
    }
    if ('ship' in response) {
      $('.shipping .amount').text('¥ ' + response.ship);
    }
    if ('amount' in response) {
      $('.order-total .amount').text('¥ ' + response.amount);
    }
  }

  ns.CartList = Backbone.View.extend({
    events: {
      'click .remove-design-button': 'removeDesignButton_clickHandler',
      'click .edit': 'edit_clickHandler',
      'click .new-row-button': 'newRowButton_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler',
      'click .save-button': 'saveButton_clickHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile($('#cart-row').html());
      this.modal = new xline.popup.EditModal({
        el: '#edit-modal'
      });
      this.modal.on('save', this.modal_saveHandler, this);
      this.collection = new Collection();
      this.collection.on('add', this.collection_addHandler, this);
    },
    collection_addHandler: function (model) {
      var tr = $(this.template());
      tr.attr('id', model.cid);
      this.$('#design-' + model.get('design')).find('.member-list')
        .append(tr);
    },
    deleteButton_clickHandler: function (event) {
      var button = $(event.currentTarget)
        , tr = button.closest('tr')
        , id = tr.attr('id')
        , model = this.collection.get(id) || new Model({id: id});
      model.destroy({
        success: _.bind(this.model_destroySuccessHandler, this),
        error: _.bind(this.model_errorHandler, this)
      });
      button
        .prop('disabled', true)
        .find('i')
          .removeClass('fa-times')
          .addClass('fa-spin fa-spinner')
        .end().siblings().prop('disabled', true);
    },
    edit_clickHandler: function (event) {
      var button = $(event.currentTarget)
        , attr = _.extend({}, button.data())
        , title = button.attr('title');
      this.editTarget = button;
      attr.prop = button.attr('href').substr(1);
      attr.value = button.text();
      attr.title = title;
      this.modal.load(attr);
    },
    modal_saveHandler: function () {
      var tr = this.editTarget.closest('tr')
        , id = tr.attr('id')
        , model = this.collection.get(id) || new Model({id: id})
        , attr = this.modal.attr;
      this.editTarget.text(this.modal.getLabel());
      this.modal.hide();
      model.set(attr.prop, this.modal.getValue());
      if (!model.collection) {
        this.collection.add(model, {silent: true});
      }
    },
    model_destroySuccessHandler: function (model, response) {
      if (response) {
        updateTotal(response);
      }
      this.$('#' + (model.has('id') ? model.id : model.cid)).fadeOut(function () {
        $(this).remove();
      });
    },
    model_errorHandler: function (model) {
      var tr = this.$('#' + (model.has('id') ? model.id : model.cid));
      tr.find('button').prop('disabled', false)
        .find('.fa-spin').removeClass('fa-spin fa-spinner')
        .addClass(function () {
          return $(this).parent().is('.save-button') ? 'fa-check' : 'fa-times';
        });
      tr.find('.msg').remove();
      tr.children().last().append('<span class="msg text-danger">操作失败</span>');
    },
    model_saveSuccessHandler: function (model, response) {
      var tr = this.$('#' + (model.has('id') ? model.id : model.cid))
        , button = tr.find('.save-button.processing')
        , others = button.siblings();
      button.remove();
      others.prop('disabled', false);
      tr.find('.msg').remove();
      tr.children().last().append('<span class="msg text-success">保存成功</span>');

      updateTotal(response);
      if ('group' in model.changed) {
        tr.data('group', model.get('group'));
      }
    },
    newRowButton_clickHandler: function (event) {
      var button = $(event.currentTarget)
        , design = button.closest('.design')
        , id = Number(design.attr('id').match(/design\-(\d+)/)[1])
        , keys = design.data('keys');
      this.collection.add({
        design: id,
        keys: keys
      });
    },
    removeDesignButton_clickHandler: function (event) {
      if (confirm('这将会把该设计所有服装从购物车中移除，您确定么？')) {
        var button = $(event.currentTarget)
          , href = button.attr('href')
          , url = href.substr(0, href.indexOf('?'))
          , params = href.substr(href.indexOf('?') + 1)
          , arr = params.split('&')
          , data = {
            action: 'line_remove_design'
          };
        for (var i = 0, len = arr.length; i < len; i++) {
          var kv = arr[i].split('=');
          data[kv[0]] = kv[1];
        }
        $.ajax(url, {
          data: data,
          dataType: 'json',
          type: 'post',
          context: this,
          success: this.removeDesign_successHandler,
          error: this.removeDesign_errorHandler
        });
      }
      event.preventDefault();
    },
    saveButton_clickHandler: function (event) {
      var button = $(event.currentTarget)
        , tr = button.closest('tr')
        , id = tr.attr('id')
        , group = tr.data('group')
        , model = this.collection.get(id);
      if (model) {
        if (!model.has(group)) {
          model.set('group', group);
        }
        model.save(null, {
          patch: true,
          success: _.bind(this.model_saveSuccessHandler, this),
          error: _.bind(this.model_errorHandler, this)
        });
        button.addClass('processing')
          .find('i').removeClass('fa-check')
          .addClass('fa-spin fa-spinner');
        button.add(button.siblings()).prop('disabled', true);
      }
    },
    removeDesign_successHandler: function (response) {
      this.$('#desgin-' + response.design).fadeOut(function () {
        $(this).remove();
      });
    },
    removeDesign_errorHandler: function () {
      alert('移除失败');
    }
  });
}(xline.component));