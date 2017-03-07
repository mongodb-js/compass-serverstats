const d3 = require('d3');

const RealTimeEventDispatch = new function() {
  const charts = {};
  const dispatcher = d3.dispatch('mouseover', 'updatelabels', 'updateoverlay', 'mouseout');

  this.on = function(title, event, cb) {
    if (!(event in charts)) {
      charts[event] = {};
    }
    charts[event][title] = cb;

    dispatcher.on(event, function(arg) {
      for (const key in charts[event]) {
        if (charts[event].hasOwnProperty(key)) {
          charts[event][key](arg);
        }
      }
    });
  };

  this.dispatch = dispatcher;
};


module.exports = RealTimeEventDispatch;
