(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Router = require('./router'),
	AppView = require('./views/app.js'),
	TodoView = require('./views/todo.js'),
	TodosCollection = require('./collections/todos');

window.app = {};
window.app.TodoView =  TodoView,
window.app.todos = new TodosCollection;
window.app.router = new Router;

new AppView;

},{"./collections/todos":2,"./router":4,"./views/app.js":5,"./views/todo.js":6}],2:[function(require,module,exports){
// FROM:
// https://github.com/tastejs/todomvc/blob/gh-pages/examples/backbone

'use strict';

module.exports = Backbone.Collection.extend({
	// Reference to this collection's model.
	model: require('../models/todo.js'),

	// Save all of the todo items under the `"todos"` namespace.
	localStorage: new Backbone.LocalStorage('todos-backbone'),

	// Filter down the list of all todo items that are finished.
	completed: function () {
		return this.where({completed: true});
	},

	// Filter down the list to only todo items that are still not finished.
	remaining: function () {
		return this.where({completed: false});
	},

	// We keep the Todos in sequential order, despite being saved by unordered
	// GUID in the database. This generates the next order number for new items.
	nextOrder: function () {
		return this.length ? this.last().get('order') + 1 : 1;
	},

	// Todos are sorted by their original insertion order.
	comparator: 'order'
});

},{"../models/todo.js":3}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
// FROM:
// https://github.com/tastejs/todomvc/blob/gh-pages/examples/backbone

'use strict';

module.exports = Backbone.View.extend({
	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.
	el: '#todoapp',

	// Our template for the line of statistics at the bottom of the app.
	statsTemplate: _.template($('#stats-template').html()),

	// Delegated events for creating new items, and clearing completed ones.
	events: {
		'keypress #new-todo': 'createOnEnter',
		'click #clear-completed': 'clearCompleted',
		'click #toggle-all': 'toggleAllComplete'
	},

	// At initialization we bind to the relevant events on the `Todos`
	// collection, when items are added or changed. Kick things off by
	// loading any preexisting todos that might be saved in *localStorage*.
	initialize: function () {
		this.allCheckbox = this.$('#toggle-all')[0];
		this.$input = this.$('#new-todo');
		this.$footer = this.$('#footer');
		this.$main = this.$('#main');
		this.$list = $('#todo-list');

		this.listenTo(app.todos, 'add', this.addOne);
		this.listenTo(app.todos, 'reset', this.addAll);
		this.listenTo(app.todos, 'change:completed', this.filterOne);
		this.listenTo(app.todos, 'filter', this.filterAll);
		this.listenTo(app.todos, 'all', _.debounce(this.render, 0));

		// Suppresses 'add' events with {reset: true} and prevents the app view
		// from being re-rendered for every model. Only renders when the 'reset'
		// event is triggered at the end of the fetch.
		app.todos.fetch({reset: true});
	},

	// Re-rendering the App just means refreshing the statistics -- the rest
	// of the app doesn't change.
	render: function () {
		var completed = app.todos.completed().length;
		var remaining = app.todos.remaining().length;

		if (app.todos.length) {
			this.$main.show();
			this.$footer.show();

			this.$footer.html(this.statsTemplate({
				completed: completed,
				remaining: remaining
			}));

			this.$('#filters li a')
				.removeClass('selected')
				.filter('[href="#/' + (app.TodoFilter || '') + '"]')
				.addClass('selected');
		} else {
			this.$main.hide();
			this.$footer.hide();
		}

		this.allCheckbox.checked = !remaining;
	},

	// Add a single todo item to the list by creating a view for it, and
	// appending its element to the `<ul>`.
	addOne: function (todo) {
		var view = new app.TodoView({ model: todo });
		this.$list.append(view.render().el);
	},

	// Add all items in the **Todos** collection at once.
	addAll: function () {
		this.$list.html('');
		app.todos.each(this.addOne, this);
	},

	filterOne: function (todo) {
		todo.trigger('visible');
	},

	filterAll: function () {
		app.todos.each(this.filterOne, this);
	},

	// Generate the attributes for a new Todo item.
	newAttributes: function () {
		return {
			title: this.$input.val().trim(),
			order: app.todos.nextOrder(),
			completed: false
		};
	},

	// If you hit return in the main input field, create new **Todo** model,
	// persisting it to *localStorage*.
	createOnEnter: function (e) {
		if (e.which === 13 && this.$input.val().trim()) {
			app.todos.create(this.newAttributes());
			this.$input.val('');
		}
	},

	// Clear all completed todo items, destroying their models.
	clearCompleted: function () {
		_.invoke(app.todos.completed(), 'destroy');
		return false;
	},

	toggleAllComplete: function () {
		var completed = this.allCheckbox.checked;

		app.todos.each(function (todo) {
			todo.save({
				completed: completed
			});
		});
	}
});
},{}],6:[function(require,module,exports){
// FROM:
// https://github.com/tastejs/todomvc/blob/gh-pages/examples/backbone

'use strict';

module.exports = Backbone.View.extend({
	//... is a list tag.
	tagName:  'li',

	// Cache the template function for a single item.
	template: _.template($('#item-template').html()),

	// The DOM events specific to an item.
	events: {
		'click .toggle': 'toggleCompleted',
		'dblclick label': 'edit',
		'click .destroy': 'clear',
		'keypress .edit': 'updateOnEnter',
		'keydown .edit': 'revertOnEscape',
		'blur .edit': 'close'
	},

	// The TodoView listens for changes to its model, re-rendering. Since
	// there's a one-to-one correspondence between a **Todo** and a
	// **TodoView** in this app, we set a direct reference on the model for
	// convenience.
	initialize: function () {
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model, 'visible', this.toggleVisible);
	},

	// Re-render the titles of the todo item.
	render: function () {
		// Backbone LocalStorage is adding `id` attribute instantly after
		// creating a model.  This causes our TodoView to render twice. Once
		// after creating a model and once on `id` change.  We want to
		// filter out the second redundant render, which is caused by this
		// `id` change.  It's known Backbone LocalStorage bug, therefore
		// we've to create a workaround.
		// https://github.com/tastejs/todomvc/issues/469
		if (this.model.changed.id !== undefined) {
			return;
		}

		this.$el.html(this.template(this.model.toJSON()));
		this.$el.toggleClass('completed', this.model.get('completed'));
		this.toggleVisible();
		this.$input = this.$('.edit');
		return this;
	},

	toggleVisible: function () {
		this.$el.toggleClass('hidden', this.isHidden());
	},

	isHidden: function () {
		return this.model.get('completed') ?
			app.TodoFilter === 'active' :
			app.TodoFilter === 'completed';
	},

	// Toggle the `"completed"` state of the model.
	toggleCompleted: function () {
		this.model.toggle();
	},

	// Switch this view into `"editing"` mode, displaying the input field.
	edit: function () {
		this.$el.addClass('editing');
		this.$input.focus();
	},

	// Close the `"editing"` mode, saving changes to the todo.
	close: function () {
		var value = this.$input.val();
		var trimmedValue = value.trim();

		// We don't want to handle blur events from an item that is no
		// longer being edited. Relying on the CSS class here has the
		// benefit of us not having to maintain state in the DOM and the
		// JavaScript logic.
		if (!this.$el.hasClass('editing')) {
			return;
		}

		if (trimmedValue) {
			this.model.save({ title: trimmedValue });

			if (value !== trimmedValue) {
				// Model values changes consisting of whitespaces only are
				// not causing change to be triggered Therefore we've to
				// compare untrimmed version with a trimmed one to check
				// whether anything changed
				// And if yes, we've to trigger change event ourselves
				this.model.trigger('change');
			}
		} else {
			this.clear();
		}

		this.$el.removeClass('editing');
	},

	// If you hit `enter`, we're through editing the item.
	updateOnEnter: function (e) {
		if (e.which === ENTER_KEY) {
			this.close();
		}
	},

	// If you're pressing `escape` we revert your change by simply leaving
	// the `editing` state.
	revertOnEscape: function (e) {
		if (e.which === ESC_KEY) {
			this.$el.removeClass('editing');
			// Also reset the hidden input back to the original value.
			this.$input.val(this.model.get('title'));
		}
	},

	// Remove the item, destroy the model from *localStorage* and delete its view.
	clear: function () {
		this.model.destroy();
	}
});
},{}]},{},[1]);
