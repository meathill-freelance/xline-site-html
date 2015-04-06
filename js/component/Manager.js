/**
 * Created by 路佳 on 14-9-3.
 */
;(function (ns) {
  var map = {
    '#cart-list': ns.CartList
  };

  var manager = ns.Manager = {
    init: function () {
      for (var selector in map) {
        if (!map.hasOwnProperty(selector)) {
          continue;
        }
        if ($(selector).length) {
          var component = new map[selector]({
            el: selector
          });
        }
      }
    }
  }
}(xline.component));