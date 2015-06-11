// FROM:
// https://github.com/tastejs/todomvc/blob/gh-pages/examples/backbone

'use strict';

module.exports = Backbone.Router.extend({
	routes: {
		'*filter': 'setFilter'
	},

	initialize: function () {
		Backbone.Router.prototype.initialize.apply(this, arguments);

		Backbone.history.start();
	},

	setFilter: function (param) {
		// Set the current filter to be used
		app.TodoFilter = param || '';

		// Trigger a collection filter event, causing hiding/unhiding
		// of Todo view items
		app.todos.trigger('filter');
	}
});