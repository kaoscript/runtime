module.exports = function() {
	var {Class, Type} = require("../src/runtime.js");
	var __ks_Array = {};
	Class.newClassMethod({
		class: Array,
		name: "map",
		final: __ks_Array,
		function: function(array, iterator) {
			if(array === undefined || array === null) {
				throw new Error("Missing parameter 'array'");
			}
			if(!Type.isArray(array)) {
				throw new Error("Invalid type for parameter 'array'");
			}
			if(iterator === undefined || iterator === null) {
				throw new Error("Missing parameter 'iterator'");
			}
			if(!Type.isFunction(iterator)) {
				throw new Error("Invalid type for parameter 'iterator'");
			}
			let results = [];
			for(let index = 0, __ks_0 = array.length, item; index < __ks_0; ++index) {
				item = array[index];
				results.push(iterator(item, index));
			}
			return results;
		},
		signature: {
			min: 2,
			max: 2,
			parameters: [
				{
					type: "Array",
					min: 1,
					max: 1
				},
				{
					type: "Function",
					min: 1,
					max: 1
				}
			]
		}
	});
	Class.newClassMethod({
		class: Array,
		name: "map",
		final: __ks_Array,
		function: function(array, iterator, condition) {
			if(array === undefined || array === null) {
				throw new Error("Missing parameter 'array'");
			}
			if(!Type.isArray(array)) {
				throw new Error("Invalid type for parameter 'array'");
			}
			if(iterator === undefined || iterator === null) {
				throw new Error("Missing parameter 'iterator'");
			}
			if(!Type.isFunction(iterator)) {
				throw new Error("Invalid type for parameter 'iterator'");
			}
			if(condition === undefined || condition === null) {
				throw new Error("Missing parameter 'condition'");
			}
			if(!Type.isFunction(condition)) {
				throw new Error("Invalid type for parameter 'condition'");
			}
			let results = [];
			for(let index = 0, __ks_0 = array.length, item; index < __ks_0; ++index) {
				item = array[index];
				if(condition(item, index)) {
					results.push(iterator(item, index));
				}
			}
			return results;
		},
		signature: {
			min: 3,
			max: 3,
			parameters: [
				{
					type: "Array",
					min: 1,
					max: 1
				},
				{
					type: "Function",
					min: 2,
					max: 2
				}
			]
		}
	});
	var __ks_Function = {};
	Class.newClassMethod({
		class: Function,
		name: "curry",
		final: __ks_Function,
		function: function() {
			if(arguments.length < 2) {
				throw new Error("Wrong number of arguments");
			}
			let __ks_i = -1;
			if(Type.isFunction(arguments[++__ks_i])) {
				var self = arguments[__ks_i];
			}
			else throw new Error("Invalid type for parameter 'self'")
			if(arguments.length > 2) {
				var bind = arguments[++__ks_i];
			}
			else  {
				var bind = null;
			}
			var args = arguments[++__ks_i];
			return function(...supplements) {
				return self.apply(bind, args.concat(supplements));
			};
		},
		signature: {
			min: 2,
			max: 3,
			parameters: [
				{
					type: "Function",
					min: 1,
					max: 1
				},
				{
					type: "Any",
					min: 1,
					max: 2
				}
			]
		}
	});
	Class.newClassMethod({
		class: Function,
		name: "vcurry",
		final: __ks_Function,
		function: function(self, bind = null, ...args) {
			if(self === undefined || self === null) {
				throw new Error("Missing parameter 'self'");
			}
			if(!Type.isFunction(self)) {
				throw new Error("Invalid type for parameter 'self'");
			}
			return function(...supplements) {
				return self.apply(bind, args.concat(supplements));
			};
		},
		signature: {
			min: 1,
			max: Infinity,
			parameters: [
				{
					type: "Function",
					min: 1,
					max: 1
				},
				{
					type: "Any",
					min: 0,
					max: Infinity
				}
			]
		}
	});
	var __ks_Object = {};
	Class.newClassMethod({
		class: Object,
		name: "append",
		final: __ks_Object,
		function: function(object, ...args) {
			if(object === undefined || object === null) {
				throw new Error("Missing parameter 'object'");
			}
			for(let __ks_0 = 0, __ks_1 = args.length, arg; __ks_0 < __ks_1; ++__ks_0) {
				arg = args[__ks_0];
				if(arg) {
					for(let key in arg) {
						let value = arg[key];
						object[key] = value;
					}
				}
			}
			return object;
		},
		signature: {
			min: 1,
			max: Infinity,
			parameters: [
				{
					type: "Any",
					min: 1,
					max: Infinity
				}
			]
		}
	});
	Class.newClassMethod({
		class: Object,
		name: "map",
		final: __ks_Object,
		function: function(object, iterator) {
			if(object === undefined || object === null) {
				throw new Error("Missing parameter 'object'");
			}
			if(!Type.isObject(object)) {
				throw new Error("Invalid type for parameter 'object'");
			}
			if(iterator === undefined || iterator === null) {
				throw new Error("Missing parameter 'iterator'");
			}
			if(!Type.isFunction(iterator)) {
				throw new Error("Invalid type for parameter 'iterator'");
			}
			let results = [];
			for(let item in object) {
				let index = object[item];
				results.push(iterator(item, index));
			}
			return results;
		},
		signature: {
			min: 2,
			max: 2,
			parameters: [
				{
					type: "Object",
					min: 1,
					max: 1
				},
				{
					type: "Function",
					min: 1,
					max: 1
				}
			]
		}
	});
	Class.newClassMethod({
		class: Object,
		name: "map",
		final: __ks_Object,
		function: function(object, iterator, condition) {
			if(object === undefined || object === null) {
				throw new Error("Missing parameter 'object'");
			}
			if(!Type.isObject(object)) {
				throw new Error("Invalid type for parameter 'object'");
			}
			if(iterator === undefined || iterator === null) {
				throw new Error("Missing parameter 'iterator'");
			}
			if(!Type.isFunction(iterator)) {
				throw new Error("Invalid type for parameter 'iterator'");
			}
			if(condition === undefined || condition === null) {
				throw new Error("Missing parameter 'condition'");
			}
			if(!Type.isFunction(condition)) {
				throw new Error("Invalid type for parameter 'condition'");
			}
			let results = [];
			for(let item in object) {
				let index = object[item];
				if(condition(item, index)) {
					results.push(iterator(item, index));
				}
			}
			return results;
		},
		signature: {
			min: 3,
			max: 3,
			parameters: [
				{
					type: "Object",
					min: 1,
					max: 1
				},
				{
					type: "Function",
					min: 2,
					max: 2
				}
			]
		}
	});
	return {
		Array: Array,
		Class: Class,
		Function: Function,
		Object: Object,
		Type: Type,
		__ks_Array: __ks_Array,
		__ks_Function: __ks_Function,
		__ks_Object: __ks_Object
	};
}