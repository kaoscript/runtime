/**
 * runtime.js
 * Version 0.6.0
 * September 14th, 2016
 *
 * Copyright (c) 2016 Baptiste Augrain
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 **/
var $support = {
	class: false
}

var Type = {
	is: function(item, clazz) { // {{{
		if(Type.isConstructor(clazz)) {
			return item instanceof clazz;
		}
		else if(Type.isObject(clazz)) {
			for(var name in clazz) {
				if(clazz[name] === item) {
					return true;
				}
			}
		}
		return false;
	}, // }}}
	isArray: Array.isArray || function(item) { // {{{
		return Type.typeOf(item) === 'array';
	}, // }}}
	isBoolean: function(item) { // {{{
		return typeof item === 'boolean';
	}, // }}}
	isConstructor: function(item) { // {{{
		if(typeof item !== 'function' || !item.prototype) {
			return false;
		}

		for(var name in item.prototype) {
			return true;
		}

		return Object.getOwnPropertyNames(item.prototype).length > 1;
	}, // }}}
	isEmptyObject: function(item) { // {{{
		if(Type.typeOf(item) !== 'object') {
			return false;
		}

		for(var name in item) {
			return false;
		}

		return true;
	}, // }}}
	isEnumerable: function(item) { // {{{
		return item !== null && typeof(item) === 'object' && typeof item.length === 'number' && item.constructor.name !== 'Function';
	}, // }}}
	isFunction: function(item) { // {{{
		return typeof item === 'function';
	}, // }}}
	isNumber: function(item) { // {{{
		return typeof item === 'number';
	}, // }}}
	isNumeric: function(item) { // {{{
		return !isNaN(parseFloat(item)) && isFinite(item);
	}, // }}}
	isObject: function(item) { // {{{
		return item !== null && typeof item === 'object' && !Type.isArray(item);
	}, // }}}
	isPrimitive: function(item) { // {{{
		var type = typeof item;
		return type === 'string' || type === 'number' || type === 'boolean';
	}, // }}}
	isString: function(item) { // {{{
		return typeof item === 'string';
	}, // }}}
	isValue: function(item) { // {{{
		return item != null && typeof item !== 'undefined';
	} // }}}
};

if(/foo/.constructor.name === 'RegExp') {
	Type.isRegExp = function(item) { // {{{
		return item !== null && typeof item === 'object' && item.constructor.name === 'RegExp';
	}; // }}}

	Type.typeOf = function(item) { // {{{
		var type = typeof item;

		if(type === 'object') {
			if(item === null) {
				return 'null';
			}
			else if(item.constructor.name === 'Date') {
				return 'date';
			}
			else if(item.constructor.name === 'RegExp') {
				return 'regex';
			}
			else if(item.nodeName) {
				if(item.nodeType === 1) {
					return 'element';
				}
				if(item.nodeType === 3) {
					return (/\S/).test(item.nodeValue) ? 'textnode' : 'whitespace';
				}
			}
			else if(typeof item.length === 'number') {
				if(item.callee) {
					return 'arguments';
				}
				else if(item['item']) {
					return 'collection';
				}
				else {
					return 'array';
				}
			}

			return 'object';
		}
		else if(type === 'function') {
			return Type.isConstructor(item) ? 'constructor' : 'function';
		}
		else {
			return type;
		}
	}; // }}}
}
else {
	Type.isRegExp = function(item) { // {{{
		return item !== null && typeof item === 'object' && Object.prototype.toString.call(item) === '[object RegExp]';
	}; // }}}

	Type.typeOf = function(item) { // {{{
		var type = typeof item;

		if(type === 'object') {
			var name = Object.prototype.toString.call(item);

			if(item === null) {
				return 'null';
			}
			else if(name === '[object Date]') {
				return 'date';
			}
			else if(name === '[object RegExp]') {
				return 'regex';
			}
			else if(item.nodeName) {
				if(item.nodeType === 1) {
					return 'element';
				}
				if(item.nodeType === 3) {
					return (/\S/).test(item.nodeValue) ? 'textnode' : 'whitespace';
				}
			}
			else if(typeof item.length === 'number') {
				if(item.callee) {
					return 'arguments';
				}
				else if(item['item']) {
					return 'collection';
				}
				else {
					return 'array';
				}
			}

			return 'object';
		}
		else if(type === 'function') {
			return Type.isConstructor(item) ? 'constructor' : 'function';
		}
		else {
			return type;
		}
	}; // }}}
}

Type.isClass = Type.isConstructor;
Type.isRegex = Type.isRegExp;

var Helper = {
	class: function(api) { // {{{
		var clazz;
		if(!!api.$extends) {
			if(!!api.$create) {
				if($support.class && api.$extends.prototype.constructor === api.$extends) {
					clazz = eval('(function(zuper){return class ' + (api.$name || '$$') + ' extends zuper {' + api.$create.toString().replace(/^(?:function(?:[\s\w-]*)|\$create\s*)\(/, '\nconstructor(').replace(/\)\s*\{/, ') {super();') + '\n};})').apply(null, [api.$extends]);
				}
				else {
					if(!!api.$name) {
						clazz = eval('(function(zuper){return ' + api.$create.toString().replace(/^(?:function(?:[\s\w-]*)|\$create\s*)\(/, 'function ' + api.$name + '(').replace(/\)\s*\{/, ') {zuper.apply(this, arguments);') + ';})').apply(null, [api.$extends]);
					}
					else {
						clazz = api.$create;
					}
				}

				delete api.$create;
			}
			else {
				if($support.class && api.$extends.prototype.constructor === api.$extends) {
					clazz = eval('(function(zuper){return class ' + (api.$name || '$$') + ' extends zuper {};})').apply(null, [api.$extends]);
				}
				else {
					if(!!api.$name) {
						clazz = eval('(function(zuper){return function ' + api.$name + '() {zuper.apply(this, arguments);};})').apply(null, [api.$extends]);
					}
					else {
						clazz = function() {
							clazz.super.apply(this, arguments);
						};
					}
				}
			}

			var zuper = function() {};
			zuper.prototype = api.$extends.prototype;
			clazz.prototype = new zuper();
			clazz.prototype.constructor = clazz;

			clazz.super = api.$extends;

			for(key in api.$extends) {
				if(!clazz[key]) {
					clazz[key] = api.$extends[key];
				}
			}

			delete api.$extends;
		}
		else {
			if(!!api.$create) {
				if(!!api.$name) {
					clazz = eval('(' + api.$create.toString().replace(/^(?:function(?:[\s\w-]*)|\$create\s*)\(/, 'function ' + api.$name + '(') + ')');
				}
				else {
					clazz = api.$create;
				}

				delete api.$create;
			}
			else {
				if(!!api.$name) {
					clazz = eval('(function ' + api.$name + '() {})');
				}
				else {
					clazz = function() {};
				}
			}
		}

		if(!!api.$static) {
			for(var key in api.$static) {
				clazz[key] = api.$static[key];
			}

			delete api.$static;
		}

		if(!!api.$name) {
			clazz.displayName = api.$name;
			delete api.$name;

			if(!!api.$version || api.$version === 0) {
				clazz.version = api.$version;
				delete api.$version;
			}
		}

		for(var key in api) {
			clazz.prototype[key] = api[key];
		}

		return clazz;
	}, // }}}
	concatObject: function() { // {{{
		var to = {};

		var src, keys, k, l, key, descriptor
		for(var i = 0; i < arguments.length; i++) {
			src = arguments[i];
			if(src === undefined || src === null) {
				continue;
			}

			keys = Object.keys(Object(src));

			for (k = 0, l = keys.length; k < l; k++) {
				key = keys[k];
				descriptor = Object.getOwnPropertyDescriptor(src, key);
				if(descriptor !== undefined && descriptor.enumerable) {
					to[key] = src[key];
				}
			}
		}

		return to;
	}, // }}}
	create: function(clazz, args) { // {{{
		var o = Object.create(clazz.prototype);

		clazz.apply(o, args);

		return o;
	}, // }}}
	curry: function(self, bind, args) { // {{{
		return function() {
			return self.apply(bind, [].concat(args, Array.prototype.slice.call(arguments)));
		};
	}, // }}}
	mapArray: function(array, iterator, condition) { // {{{
		var map = [];

		if(condition) {
			for(var i = 0, l = array.length; i < l; ++i) {
				if(condition(array[i], i)) {
					map.push(iterator(array[i], i));
				}
			}
		}
		else {
			for(var i = 0, l = array.length; i < l; ++i) {
				map.push(iterator(array[i], i));
			}
		}

		return map;
	}, // }}}
	mapObject: function(object, iterator, condition) { // {{{
		var map = [];

		if(condition) {
			for(var key in object) {
				if(condition(key, object[key])) {
					map.push(iterator(key, object[key]));
				}
			}
		}
		else {
			for(var key in object) {
				map.push(iterator(key, object[key]));
			}
		}

		return map;
	}, // }}}
	mapRange: function(start, stop, step, from, to, iterator, condition) { // {{{
		if(start <= stop) {
			if(condition) {
				var map = [];

				for(var item = from ? start : start + step, i = 0; item < stop; item += step, ++i) {
					if(condition(item, i)) {
						map.push(iterator(item, i));
					}
				}

				if(to && item === stop && condition(item, i)) {
					map.push(iterator(item, i));
				}
			}
			else if(((stop - start) / step) > 100) {
				if(from) {
					var value = start;
				}
				else {
					var value = start + step;
				}

				var length = Math.max(Math.ceil((stop - value) / step), 0);

				if(to && (stop % step === start % step)) {
					++length;
				}

				var map = Array(length);

				for(var i = 0; i < length; i++, value += step) {
					map[i] = iterator(value, i);
				}
			}
			else {
				var map = [];

				for(var item = from ? start : start + step, i = 0; item < stop; item += step, ++i) {
					map.push(iterator(item, i));
				}

				if(to && item === stop) {
					map.push(iterator(item, i));
				}
			}
		}
		else {
			if(condition) {
				var map = [];

				for(var item = from ? start : start - step, i = 0; item > stop; item -= step, ++i) {
					if(condition(item, i)) {
						map.push(iterator(item, i));
					}
				}

				if(to && item === stop && condition(item, i)) {
					map.push(iterator(item, i));
				}
			}
			else if(((start - stop) / step) > 100) {
				if(from) {
					var value = start;
				}
				else {
					var value = start - step;
				}

				var length = Math.max(Math.ceil((value - stop) / step), 0);

				if(to && (stop % step === start % step)) {
					++length;
				}

				var map = Array(length);

				for(var i = 0; i < length; i++, value -= step) {
					map[i] = iterator(value, i);
				}
			}
			else {
				var map = [];

				for(var item = from ? start : start - step, i = 0; item > stop; item -= step, ++i) {
					map.push(iterator(item, i));
				}

				if(to && item === stop) {
					map.push(iterator(item, i));
				}
			}
		}

		return map;
	}, // }}}
	newArrayRange: function(start, stop, step, from, to) { // {{{
		if(start <= stop) {
			if(((stop - start) / step) > 100) {
				if(from) {
					var value = start;
				}
				else {
					var value = start + step;
				}

				var length = Math.max(Math.ceil((stop - value) / step), 0);

				if(to && (stop % step === start % step)) {
					++length;
				}

				var map = Array(length);

				for(var i = 0; i < length; i++, value += step) {
					map[i] = value;
				}
			}
			else {
				var map = [];

				for(var i = from ? start : start + step; i < stop; i += step) {
					map.push(i);
				}

				if(to && i === stop) {
					map.push(i);
				}
			}
		}
		else {
			if(((start - stop) / step) > 100) {
				if(from) {
					var value = start;
				}
				else {
					var value = start - step;
				}

				var length = Math.max(Math.ceil((value - stop) / step), 0);

				if(to && (stop % step === start % step)) {
					++length;
				}

				var map = Array(length);

				for(var i = 0; i < length; i++, value -= step) {
					map[i] = value;
				}
			}
			else {
				var map = [];

				for(var i = from ? start : start - step; i > stop; i -= step) {
					map.push(i);
				}

				if(to && i === stop) {
					map.push(i);
				}
			}
		}

		return map;
	}, // }}}
	vcurry: function(self, bind) { // {{{
		var args = Array.prototype.slice.call(arguments, 2, arguments.length);
		return function() {
			return self.apply(bind, args.concat(Array.prototype.slice.call(arguments)));
		};
	} // }}}
};

try {
	eval('class $$ {}');

	$support.class = true;

	Helper.create = eval('(function(){return function(clazz,args){return new clazz(...args)}})()')
}
catch(e) {}

module.exports = {
	Helper: Helper,
	Type: Type
};