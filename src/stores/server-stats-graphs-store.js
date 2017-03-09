const Reflux = require('reflux');
const Actions = require('../actions');

// const debug = require('debug')('mongodb-compass:server-stats:graphs-store');

const ServerStatsStore = Reflux.createStore({

  init: function() {
    this.restart();
    this.listenTo(Actions.pollServerStats, this.serverStats);
    this.listenTo(Actions.restart, this.restart);
    this.listenTo(Actions.pause, this.pause);
  },

  dataServiceConnected: function(error, dataService) {
    if (!error) {
      this.isMongos = dataService.isMongos();
      this.isWritable = dataService.isWritable();
    }
  },

  restart: function() {
    this.isPaused = false;
  },

  serverStats: function() {
    global.dataService.serverstats((error, doc) => {
      if (error === null && this.error !== null) { // Trigger error removal
        Actions.dbError({'op': 'serverStatus', 'error': null });
      } else if (error !== null) {
        Actions.dbError({'op': 'serverStatus', 'error': error });
      }
      this.trigger(error, doc, this.isPaused);
    });
  },

  pause: function() {
    this.isPaused = !this.isPaused;
  }
});

module.exports = ServerStatsStore;
