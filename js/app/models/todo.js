// FROM:
// https://github.com/tastejs/todomvc/blob/gh-pages/examples/backbone

'use strict';

module.exports = Backbone.Model.extend({
	// Default attributes for the todo
	// and ensure that each todo created has `title` and `completed` keys.
	defaults: {
		title: '',
		completed: false
	},

	// Toggle the `completed` state of this todo item.
	toggle: function () {
		this.save({
			completed: !this.get('completed')
		});
	}
});