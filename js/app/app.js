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
