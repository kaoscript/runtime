/**
 * runtime.js
 * Version 0.6.1
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
	isArray: Array.isArray || function(item) { // {{{
		return Type.typeOf(item) === 'array';
	}, // }}}
	isBoolean: function(item) { // {{{
		return typeof item === 'boolean' || item instanceof Boolean;
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
	isDictionary: function(item) { // {{{
		return Type.typeOf(item) === 'dictionary';
	}, // }}}
	isEnum: function(item) { // {{{
		return Type.isValue(item) && item.__ks_type === 'enum';
	}, // }}}
	isEnumMember: function(item, type) { // {{{
		if(type) {
			return Type.isValue(item) && item.__ks_enum === type;
		}
		else {
			return Type.isValue(item) && !!item.__ks_enum;
		}
	}, // }}}
	isEnumerable: function(item) { // {{{
		return item !== null && typeof item === 'object' && typeof item.length === 'number' && item.constructor.name !== 'Function';
	}, // }}}
	isFunction: function(item) { // {{{
		return typeof item === 'function';
	}, // }}}
	isInstance: function(item, type) { // {{{
		if(!item) {
			return false;
		}

		var constructor = item.constructor;
		if(!constructor) {
			return false
		}

		do {
			if(constructor === type) {
				return true;
			}
		}
		while((constructor = constructor.super));

		return false
	}, // }}}
	isNamespace: function(item) { // {{{
		return Type.isValue(item) && item.__ks_type === 'namespace';
	}, // }}}
	isNumber: function(item) { // {{{
		return typeof item === 'number' || item instanceof Number;
	}, // }}}
	isObject: function(item) { // {{{
		return Type.typeOf(item) === 'object';
	}, // }}}
	isPrimitive: function(item) { // {{{
		var type = typeof item;
		return type === 'string' || type === 'number' || type === 'boolean';
	}, // }}}
	isString: function(item) { // {{{
		return typeof item === 'string' || item instanceof String;
	}, // }}}
	isValue: function(item) { // {{{
		return item !== void 0 && item !== null;
	} // }}}
};

if(/foo/.constructor.name === 'RegExp') {
	Type.isRegExp = function(item) { // {{{
		return item !== null && typeof item === 'object' && !!item.constructor && item.constructor.name === 'RegExp';
	}; // }}}

	Type.typeOf = function(item) { // {{{
		var type = typeof item;

		if(type === 'object') {
			if(item === null) {
				return 'null';
			}
			else if(!item.constructor || item instanceof Dictionary) {
				return 'dictionary';
			}
			else if(item.constructor.name === 'Array') {
				return 'array';
			}
			else if(item.__ks_type) {
				if(item.__ks_type === 'enum') {
					return 'enum';
				}
				else if(item.__ks_type === 'namespace') {
					return 'namespace';
				}
			}
			else if(typeof item.__ks_enum === 'function') {
				return 'enum-member';
			}

			return 'object';
		}
		else if(type === 'function') {
			if(Type.isConstructor(item)) {
				return 'constructor';
			}
			else if(item.__ks_type === 'enum') {
				return 'enum';
			}
			else {
				return 'function';
			}
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
			else if(name === '[object Dictionary]') {
				return 'dictionary';
			}
			else if(name === '[object Array]') {
				return 'array';
			}
			else if(item.__ks_type) {
				if(item.__ks_type === 'enum') {
					return 'enum';
				}
				else if(item.__ks_type === 'namespace') {
					return 'namespace';
				}
			}
			else if(typeof item.__ks_enum === 'function') {
				return 'enum-member';
			}

			return 'object';
		}
		else if(type === 'function') {
			if(Type.isConstructor(item)) {
				return 'constructor';
			}
			else if(item.__ks_type === 'enum') {
				return 'enum';
			}
			else {
				return 'function';
			}
		}
		else {
			return type;
		}
	}; // }}}
}

Type.isClass = Type.isConstructor;
Type.isRegex = Type.isRegExp;

var Helper = {
	array: function(value) { // {{{
		if(Type.isEnumerable(value)) {
			if(Type.isArray(value)) {
				return value;
			}
			else {
				return Array.prototype.slice.call(value);
			}
		}
		else {
			return [value];
		}
	}, // }}}
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
	compareString: function(a, b) { // {{{
		if(a === b) {
			return 0;
		}
		else if(a < b) {
			return -1;
		}
		else {
			return 1;
		}
	}, // }}}
	concatDictionary: function() { // {{{
		var to = new Dictionary();

		var src, keys, k, l, key, descriptor
		for(var i = 0; i < arguments.length; i++) {
			src = arguments[i];
			if(src === void 0 || src === null) {
				continue;
			}

			keys = Object.keys(Object(src));

			for (k = 0, l = keys.length; k < l; k++) {
				key = keys[k];
				descriptor = Object.getOwnPropertyDescriptor(src, key);
				if(descriptor !== void 0 && descriptor.enumerable) {
					to[key] = src[key];
				}
			}
		}

		return to;
	}, // }}}
	concatString: function() { // {{{
		var str = '';

		var arg;
		for(var i = 0; i < arguments.length; i++) {
			arg = arguments[i];

			if(arg === void 0 || arg === null) {
				continue;
			}

			str += arg
		}

		return str;
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
	enum: function(master, elements) { // {{{
		var e = function(val) {
			var n = new master(val);
			Object.defineProperty(n, '__ks_enum', {
				value: e
			});
			Object.defineProperty(n, 'value', {
				value: val
			});
			e.__ks_members[val] = n;
			return n;
		};

		Object.defineProperty(e, '__ks_type', {
			value: 'enum'
		});
		Object.defineProperty(e, '__ks_members', {
			value: {}
		});
		Object.defineProperty(e, 'from', {
			value: function(value) {
				if(!Type.isValue(value)) {
					return null
				}
				else if(Type.isEnumMember(value, e)) {
					return value;
				}
				else {
					return e.__ks_members[value] || null;
				}
			}
		});

		for(var key in elements) {
			e[key] = e(elements[key]);
		}

		return e;
	}, // }}}
	isEmptyDictionary: function(value) { // {{{
		if(Type.typeOf(value) !== 'dictionary') {
			return false;
		}

		for(var name in value) {
			return false;
		}

		return true;
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
	mapDictionary: function(dict, iterator, condition) { // {{{
		var map = [];

		if(condition) {
			for(var key in dict) {
				if(condition(key, dict[key])) {
					map.push(iterator(key, dict[key]));
				}
			}
		}
		else {
			for(var key in dict) {
				map.push(iterator(key, dict[key]));
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
	namespace: function(fn) { // {{{
		var n = fn();
		Object.defineProperty(n, '__ks_type', {
			value: 'namespace'
		});
		return n;
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
	try: function(fn, defaultValue) { // {{{
		try {
			return fn();
		}
		catch(e) {
			return defaultValue;
		}
	}, // }}}
	tryTest: function(fn) { // {{{
		try {
			fn();

			return true;
		}
		catch(e) {
			return false;
		}
	}, // }}}
	valueOf: function(value) { // {{{
		if(Type.isValue(value)) {
			return value.valueOf();
		}
		else {
			return null;
		}
	}, // }}}
	vcurry: function(self, bind) { // {{{
		var args = Array.prototype.slice.call(arguments, 2, arguments.length);
		return function() {
			return self.apply(bind, args.concat(Array.prototype.slice.call(arguments)));
		};
	} // }}}
};

function $check(v, op) { // {{{
	if(!Type.isNumber(v)) {
		throw new TypeError('The elements of a ' + op + ' must be numbers');
	}

	return v
} // }}}

var Operator = {
	addOrConcat: function() { // {{{
		var arg;
		for(var i = 0; i < arguments.length; i++) {
			arg = arguments[i];

			if(Type.isString(arg)) {
				return Helper.concatString.apply(this, arguments);
			}
		}

		return Operator.addition.apply(this, arguments);
	}, // }}}
	addition: function() { // {{{
		if(!Type.isValue(arguments[0])) {
			return null
		}

		var result = $check(arguments[0], 'addition');

		for(var i = 1; i < arguments.length; i++) {
			if(!Type.isValue(arguments[i])) {
				return null
			}

			result += $check(arguments[i], 'addition');
		}

		return result;
	}, // }}}
	bitwiseAnd: function() { // {{{
		if(!Type.isValue(arguments[0])) {
			return null
		}

		var result = $check(arguments[0], 'bitwise-and');

		for(var i = 1; i < arguments.length; i++) {
			if(!Type.isValue(arguments[i])) {
				return null
			}

			result &= $check(arguments[i], 'bitwise-and');
		}

		return result;
	}, // }}}
	bitwiseLeftShift: function() { // {{{
		if(!Type.isValue(arguments[0])) {
			return null
		}

		var result = $check(arguments[0], 'bitwise-left-shift');

		for(var i = 1; i < arguments.length; i++) {
			if(!Type.isValue(arguments[i])) {
				return null
			}

			result <<= $check(arguments[i], 'bitwise-left-shift');
		}

		return result;
	}, // }}}
	bitwiseOr: function() { // {{{
		if(!Type.isValue(arguments[0])) {
			return null
		}

		var result = $check(arguments[0], 'bitwise-or');

		for(var i = 1; i < arguments.length; i++) {
			if(!Type.isValue(arguments[i])) {
				return null
			}

			result |= $check(arguments[i], 'bitwise-or');
		}

		return result;
	}, // }}}
	bitwiseNot: function(value) { // {{{
		if(!Type.isValue(value)) {
			return null
		}

		return ~$check(value, 'bitwise-not');
	}, // }}}
	bitwiseRightShift: function() { // {{{
		if(!Type.isValue(arguments[0])) {
			return null
		}

		var result = $check(arguments[0], 'bitwise-right-shift');

		for(var i = 1; i < arguments.length; i++) {
			if(!Type.isValue(arguments[i])) {
				return null
			}

			result >>= $check(arguments[i], 'bitwise-right-shift');
		}

		return result;
	}, // }}}
	bitwiseXor: function() { // {{{
		if(!Type.isValue(arguments[0])) {
			return null
		}

		var result = $check(arguments[0], 'bitwise-xor');

		for(var i = 1; i < arguments.length; i++) {
			if(!Type.isValue(arguments[i])) {
				return null
			}

			result ^= $check(arguments[i], 'bitwise-xor');
		}

		return result;
	}, // }}}
	division: function() { // {{{
		if(!Type.isValue(arguments[0])) {
			return null
		}

		var result = $check(arguments[0], 'division');

		for(var i = 1; i < arguments.length; i++) {
			if(!Type.isValue(arguments[i])) {
				return null
			}

			result /= $check(arguments[i], 'division');
		}

		return result;
	}, // }}}
	eq: function(x, y) { // {{{
		if(typeof x === typeof y) {
			return x === y
		}
		else {
			return false
		}
	}, // }}}
	gt: function(x, y) { // {{{
		return $check(x, 'gt') > $check(y, 'gt');
	}, // }}}
	gte: function(x, y) { // {{{
		return $check(x, 'gte') >= $check(y, 'gte');
	}, // }}}
	lt: function(x, y) { // {{{
		return $check(x, 'lt') < $check(y, 'lt');
	}, // }}}
	lte: function(x, y) { // {{{
		return $check(x, 'lte') <= $check(y, 'lte');
	}, // }}}
	modulo: function() { // {{{
		if(!Type.isValue(arguments[0])) {
			return null
		}

		var result = $check(arguments[0], 'modulo');

		for(var i = 1; i < arguments.length; i++) {
			if(!Type.isValue(arguments[i])) {
				return null
			}

			result %= $check(arguments[i], 'modulo');
		}

		return result;
	}, // }}}
	multiplication: function() { // {{{
		if(!Type.isValue(arguments[0])) {
			return null
		}

		var result = $check(arguments[0], 'multiplication');

		for(var i = 1; i < arguments.length; i++) {
			if(!Type.isValue(arguments[i])) {
				return null
			}

			result *= $check(arguments[i], 'multiplication');
		}

		return result;
	}, // }}}
	negative: function(value) { // {{{
		if(!Type.isValue(value)) {
			return null
		}

		return -$check(value, 'negative');
	}, // }}}
	neq: function(x, y) { // {{{
		if(typeof x === typeof y) {
			return x !== y
		}
		else {
			return true
		}
	}, // }}}
	quotient: function() { // {{{
		if(!Type.isValue(arguments[0])) {
			return null
		}

		var result = $check(arguments[0], 'quotient');

		for(var i = 1; i < arguments.length; i++) {
			if(!Type.isValue(arguments[i])) {
				return null
			}

			result = Number.parseInt(result / $check(arguments[i], 'quotient'));
		}

		return result;
	}, // }}}
	subtraction: function() { // {{{
		if(!Type.isValue(arguments[0])) {
			return null
		}

		var result = $check(arguments[0], 'subtraction');

		for(var i = 1; i < arguments.length; i++) {
			if(!Type.isValue(arguments[i])) {
				return null
			}

			result -= $check(arguments[i], 'subtraction');
		}

		return result;
	} // }}}
}

var Dictionary = function() {};
Dictionary.prototype = Object.create(null);
Dictionary.keys = Object.keys;

try {
	eval('class $$ {}');

	$support.class = true;

	Helper.create = eval('(function(){return function(clazz,args){return new clazz(...args)}})()')

	Type.isInstance = function(item, type) { // {{{
		return item instanceof type;
	}; // }}}
}
catch(e) {}

var initFlag = '__ks_init';

try {
	initFlag = Symbol('init');
}
catch(e) {}

module.exports = {
	Dictionary: Dictionary,
	Helper: Helper,
	Operator: Operator,
	Type: Type,
	initFlag: initFlag
};