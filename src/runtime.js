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

var $isArray = Array.isArray || function(item) { // {{{
	return Type.typeOf(item) === 'array';
}; // }}}

var Type = {
	any: function() { // {{{
		return true;
	}, // }}}
	isArray: function(item, rest) { // {{{
		if(!$isArray(item)) {
			return false;
		}

		if(rest) {
			for(var i = 0, l = item.length; i < l; ++i) {
				if(!rest(item[i])) {
					return false
				}
			}
		}

		return true;
	}, // }}}
	isBoolean: function(item) { // {{{
		return typeof item === 'boolean' || item instanceof Boolean;
	}, // }}}
	isBigInt: function(item) { // {{{
		return typeof item === 'bigint' || item instanceof BigInt;
	}, // }}}
	isBitmask: function(item) { // {{{
		return Type.isValue(item) && item.__ks_type === 'bitmask';
	}, // }}}
	isBitmaskInstance: function(item, type) { // {{{
		if(arguments.length > 1) {
			return Type.isValue(item) && item.__ks_bitmask === type;
		}
		else {
			return Type.isValue(item) && !!item.__ks_bitmask;
		}
	}, // }}}
	isClassInstance: function(item, type) { // {{{
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
	isConstructor: function(item) { // {{{
		if(typeof item !== 'function' || !item.prototype) {
			return false;
		}

		for(var name in item.prototype) {
			return true;
		}

		return Object.getOwnPropertyNames(item.prototype).length > 1;
	}, // }}}
	isDestructurableObject: function(item) { // {{{
		var type = Type.typeOf(item);
		return type === 'struct-instance' || type === 'object';
	}, // }}}
	isDexArray: function(item, type, min, max, rest, props) { // {{{
		if(type) {
			var name = Type.typeOf(item);

			if(name !== 'array' && name !== 'tuple-instance') {
				return false;
			}
		}

		if(min && min > item.length) {
			return false;
		}
		if(max && max < item.length) {
			return false;
		}

		if(props) {
			var m = Math.min(item.length, props.length);

			for(var i = 0, l = m; i < l; ++i) {
				if(!props[i](item[i])) {
					return false
				}
			}

			if(rest) {
				for(var i = m, l = item.length; i < l; ++i) {
					if(!rest(item[i])) {
						return false;
					}
				}
			}
		}
		else if(rest) {
			for(var i = 0, l = item.length; i < l; ++i) {
				if(!rest(item[i])) {
					return false;
				}
			}
		}

		return true;
	}, // }}}
	isDexObject: function(item, type, rest, props) { // {{{
		if(type) {
			if(!Type.isObject(item)) {
				return false;
			}
		}

		if(props) {
			for(var name in props) {
				if(!props[name](item[name])) {
					return false
				}
			}

			if(rest) {
				for(var name in item) {
					if(!props[name] && !rest(item[name])) {
						return false;
					}
				}
			}
		}
		else if(rest) {
			for(var name in item) {
				if(!rest(item[name])) {
					return false;
				}
			}
		}

		return true;
	}, // }}}
	isDXArray: function(item) { // {{{
		var name = Type.typeOf(item);
		return name === 'array' || name === 'tuple-instance';
	}, // }}}
	isEnum: function(item) { // {{{
		return Type.isValue(item) && item.__ks_type === 'enum';
	}, // }}}
	isEnumInstance: function(item, type) { // {{{
		if(arguments.length > 1) {
			return Type.isValue(item) && item.__ks_enum === type;
		}
		else {
			return Type.isValue(item) && !!item.__ks_enum;
		}
	}, // }}}
	isEnumerable: function(item) { // {{{
		return item !== null && typeof item === 'object' && typeof item.length === 'number' && item.constructor.name !== 'Function';
	}, // }}}
	isFinite: function(item, assert) { // {{{
		if(assert && !(Type.isNumber(item) || Type.isBigInt(item))) {
			return false;
		}
		return item !== NaN && item !== Infinity;
	}, // }}}
	isFunction: function(item) { // {{{
		return typeof item === 'function';
	}, // }}}
	isNamespace: function(item) { // {{{
		return Type.isValue(item) && item.__ks_type === 'namespace';
	}, // }}}
	isNotEmpty: function(item, mode) { // {{{
		if(mode === 1 || (!mode && ($isArray(item) || Type.isString(item)))) {
			return item.length > 0;
		}
		if(mode === 2 || (!mode && (Type.typeOf(item) === 'object'))) {
			for(var name in item) {
				return true;
			}
		}
		return false;
	}, // }}}
	isNull: function(item) { // {{{
		return item === void 0 || item === null;
	}, // }}}
	isNumber: function(item) { // {{{
		return typeof item === 'number' || item instanceof Number;
	}, // }}}
	isNumeric: function(item) { // {{{
		return Type.isNumber(item) || Type.isBigInt(item);
	}, // }}}
	isPrimitive: function(item) { // {{{
		var type = typeof item;
		return type === 'string' || type === 'number' || type === 'boolean';
	}, // }}}
	isString: function(item) { // {{{
		return typeof item === 'string' || item instanceof String;
	}, // }}}
	isStruct: function(item) { // {{{
		return Type.isValue(item) && item.__ks_type === 'struct';
	}, // }}}
	isStructInstance: function(item, type) { // {{{
		if(arguments.length > 1) {
			return Type.isValue(item) && !!item.__ks_struct && item.__ks_struct === type;
		}
		else {
			return Type.isValue(item) && !!item.__ks_struct;
		}
	}, // }}}
	isTuple: function(item) { // {{{
		return Type.isValue(item) && item.__ks_type === 'tuple';
	}, // }}}
	isTupleInstance: function(item, type) { // {{{
		if(arguments.length > 1) {
			return Type.isValue(item) && !!item.__ks_tuple && item.__ks_tuple === type;
		}
		else {
			return Type.isValue(item) && !!item.__ks_tuple;
		}
	}, // }}}
	isValue: function(item) { // {{{
		return item !== void 0 && item !== null;
	}, // }}}
	isVarargs(args, from, to, def, test) { // {{{
		var l = to < 0 ? args.length + to : Math.min(to, args.length - 1);

		var i = from;

		if(def && i < l && !Type.isValue(args[i])) {
			++i;
		}

		while(i <= l) {
			if(!test(args[i])) {
				return false;
			}

			++i;
		}

		return true;
	} // }}}
};

if(/foo/.constructor.name === 'RegExp') {
	Type.isObject = function(item) { // {{{
		var type = typeof item;

		if(type === 'object') {
			if(item === null) {
				return false;
			}
			if (!!item.__ks_struct || !item.constructor || item instanceof OBJ) {
				return true;
			}
			if(!!item.__ks_enum || !!item.__ks_tuple || !!item.__ks_type || item.constructor.name === 'Array') {
				return false;
			}
			return true;
		}

		return false;
	}; // }}}
	Type.isRegExp = function(item) { // {{{
		return item !== null && typeof item === 'object' && !!item.constructor && item.constructor.name === 'RegExp';
	}; // }}}

	Type.typeOf = function(item) { // {{{
		var type = typeof item;

		if(type === 'object') {
			if(item === null) {
				return 'null';
			}
			else if(!!item.__ks_struct) {
				return 'struct-instance';
			}
			else if(!!item.__ks_tuple) {
				return 'tuple-instance';
			}
			else if(!item.constructor || item instanceof OBJ) {
				return 'object';
			}
			else if(item.constructor.name === 'Array') {
				return 'array';
			}
			else if(!!item.__ks_type) {
				return item.__ks_type;
			}
			else if(!!item.__ks_bitmask) {
				return 'bitmask-member';
			}
			else if(!!item.__ks_enum) {
				return 'enum-member';
			}

			return 'object';
		}
		else if(type === 'function') {
			if(Type.isConstructor(item)) {
				return 'class';
			}
			else if(!!item.__ks_type) {
				return item.__ks_type;
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
	Type.isObject = function(item) { // {{{
		var type = typeof item;

		if(type === 'object') {
			if(item === null) {
				return false;
			}
			var name = Object.prototype.toString.call(item);
			if (!!item.__ks_struct || name === '[object OBJ]') {
				return true;
			}
			if(!!item.__ks_enum || !!item.__ks_tuple || !!item.__ks_type || name === '[object Array]') {
				return false;
			}
			return true;
		}

		return false;
	}; // }}}
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
			else if(!!item.__ks_struct) {
				return 'struct-instance';
			}
			else if(!!item.__ks_tuple) {
				return 'tuple-instance';
			}
			else if(name === '[object OBJ]') {
				return 'object';
			}
			else if(name === '[object Array]') {
				return 'array';
			}
			else if(!!item.__ks_type) {
				return item.__ks_type;
			}
			else if(!!item.__ks_enum) {
				return 'enum-member';
			}
			else if(!!item.__ks_bitmask) {
				return 'bitmask-member';
			}

			return 'object';
		}
		else if(type === 'function') {
			if(Type.isConstructor(item)) {
				return 'class';
			}
			else if(!!item.__ks_type) {
				return item.__ks_type;
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
	alias: function(test) { // {{{
		var a = new OBJ();

		Object.defineProperty(a, '__ks_type', {
			value: 'alias'
		});
		Object.defineProperty(a, 'is', {
			value: test
		});

		return a
	}, // }}}
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
	assert: function(value, type, nullable, test) { // {{{
		if(test(value)) {
			return value;
		}
		if(nullable) {
			return null;
		}

		throw new TypeError('The given value isn\'t a ' + type);
	}, // }}}
	assertArray: function(item, nullable) { // {{{
		if(Type.isArray(item)) {
			return item;
		}
		if(nullable) {
			return null;
		}
		throw new TypeError('The given value isn\'t an Array');
	}, // }}}
	assertBoolean: function(item, nullable) { // {{{
		if(Type.isBoolean(item)) {
			return item;
		}
		if(nullable) {
			return null;
		}
		throw new TypeError('The given value isn\'t a Boolean');
	}, // }}}
	assertClass: function(item, nullable) { // {{{
		if(Type.isConstructor(item)) {
			return item;
		}
		if(nullable) {
			return null;
		}
		throw new TypeError('The given value isn\'t a Class');
	}, // }}}
	assertDexArray: function(item, type, min, max, rest, props) { // {{{
		if(!Type.isDexArray(item, type, min, max, rest, props)) {
			throw new TypeError('The subject of the destructuring must be an array');
		}
	}, // }}}
	assertDexObject: function(item, type, rest, props) { // {{{
		if(!Type.isDexObject(item, type, rest, props)) {
			throw new TypeError('The subject of the destructuring must be an object');
		}
	}, // }}}
	assertFunction: function(item, nullable) { // {{{
		if(Type.isFunction(item)) {
			return item;
		}
		if(nullable) {
			return null;
		}
		throw new TypeError('The given value isn\'t a Function');
	}, // }}}
	assertLoopBounds: function(kind, lowName, low, highName, high, maxHigh, stepName, step) { // {{{
		if(lowName.length > 0 && !Type.isNumeric(low)) {
			throw new TypeError('The expression "' + lowName + '" must be a number');
		}
		if(highName.length > 0 && !Type.isNumeric(high)) {
			throw new TypeError('The expression "' + highName + '" must be a number');
		}
		if(stepName.length > 0) {
			if(!Type.isNumeric(step)) {
				throw new TypeError('The expression "' + stepName + '" must be a number');
			}
			if(step === 0) {
				throw new TypeError('The expression "' + stepName + '" must not be equal to 0');
			}
		}

		if(kind) {
			return;
		}

		high = Math.min(high, maxHigh);

		if(step > 0) {
			return [low, high, step, (x) => x];
		}
		else {
			return [0, low - high, -step, (x) => low - x];
		}
	}, // }}}
	assertLoopEdge: function(name, value, kind) { // {{{
		if(!Type.isNumeric(value)) {
			throw new TypeError('The expression "' + name + '" must be a number');
		}
		if(kind === 1) {
			if(value >= 0) {
				throw new TypeError('The expression "' + name + '" must be less than 0');
			}
		}
		else if(kind === 2) {
			if(value <= 0) {
				throw new TypeError('The expression "' + name + '" must be greater than 0');
			}
		}
		else if(kind === 3) {
			if(value < 0) {
				throw new TypeError('The expression "' + name + '" must be greater than or equal to 0');
			}
		}
	}, // }}}
	assertNumber: function(item, nullable) { // {{{
		if(Type.isNumeric(item)) {
			return item;
		}
		if(nullable) {
			return null;
		}
		throw new TypeError('The given value isn\'t a Number');
	}, // }}}
	assertObject: function(item, nullable) { // {{{
		if(Type.isObject(item)) {
			return item;
		}
		if(nullable) {
			return null;
		}
		throw new TypeError('The given value isn\'t an Object');
	}, // }}}
	assertString: function(item, nullable) { // {{{
		if(Type.isString(item)) {
			return item;
		}
		if(nullable) {
			return null;
		}

		throw new TypeError('The given value isn\'t a String');
	}, // }}}
	assertSplit: function(name, value, min) { // {{{
		if(name.length > 0 && !Type.isNumeric(value)) {
			throw new TypeError('The expression "' + name + '" must be a number');
		}
		if(value <= 0) {
			throw new TypeError('The expression "' + name + '" must be greater than 0');
		}

		return Math.max(value, min)
	}, // }}}
	badArgs: function() { // {{{
		return new TypeError('Invalid arguments');
	}, // }}}
	badRequirements: function() { // {{{
		return new TypeError('Invalid requirements');
	}, // }}}
	bindAuxiliaryMethod: function(seal, name, bind, generics) { // {{{
		var fn = seal['_im_' + name];

		if(!fn['__ks_0']) {
			fn.__ks_0 = bind.constructor.prototype[name].bind(bind);

			var match = '__ks_func_' + name + '_';
			var mLength = match.length;
			var props = Object.getOwnPropertyNames(seal);

			for(var i = 0, l = props.length; i < l; ++i) {
				if(props[i].substring(0, mLength) === match) {
					var index = props[i].substring(mLength);
					if(index !== 'rt') {
						fn['__ks_' + index] = seal[props[i]].bind(bind);
					}
				}
			}
		}

		return generics ? fn.bind(bind, generics) : fn.bind(bind);
	}, // }}}
	bindMethod: function(bind, name, generics) { // {{{
		var proto = bind.constructor.prototype;
		var fn = proto[name];

		if(!fn['__ks_0']) {
			var match = '__ks_func_' + name + '_';
			var mLength = match.length;
			var props = Object.getOwnPropertyNames(proto);

			for(var i = 0, l = props.length; i < l; ++i) {
				if(props[i].substring(0, mLength) === match) {
					var index = props[i].substring(mLength);
					if(index !== 'rt') {
						fn['__ks_' + index] = proto[props[i]].bind(bind);
					}
				}
			}
		}

		return generics ? fn.bind(bind, generics) : fn.bind(bind);
	}, // }}}
	bitmask: function(master, values, aliases) { // {{{
		var b = function(value) {
			if(!Type.isValue(value)) {
				return null
			}
			if(value.__ks_bitmask === b) {
				return value;
			}
			if(b.__ks_values[value]) {
				return b.__ks_values[value];
			}
			if(!Type.isNumeric(value)) {
				return null;
			}

			var n = new master(value);

			Object.defineProperty(n, '__ks_bitmask', {
				value: b
			});
			Object.defineProperty(n, 'value', {
				value: value
			});

			return n;
		};

		Object.defineProperty(b, '__ks_type', {
			value: 'bitmask'
		});
		Object.defineProperty(b, '__ks_new_value', {
			value: function(name, value, index) {
				var n = new master(value);

				Object.defineProperty(n, '__ks_bitmask', {
					value: b
				});
				Object.defineProperty(n, 'value', {
					value: value
				});
				Object.defineProperty(n, 'name', {
					value: Type.isString(name) ? name : null
				});
				Object.defineProperty(n, 'index', {
					value: Type.isNumber(index) ? index : null
				});

				b.values.push(n);
				b.__ks_names[name] = n;
				b.__ks_values[value] = n;
				b[name] = n;
			}
		});
		Object.defineProperty(b, '__ks_new_alias', {
			value: function(name, value) {
				var n = new master(value);

				Object.defineProperty(n, '__ks_bitmask', {
					value: b
				});
				Object.defineProperty(n, 'value', {
					value: value
				});
				Object.defineProperty(n, 'name', {
					value: Type.isString(name) ? name : null
				});

				b.__ks_names[name] = n;
				b.__ks_values[value] = n;
				b[name] = n;
			}
		});
		Object.defineProperty(b, 'values', {
			value: []
		});
		Object.defineProperty(b, '__ks_names', {
			value: new OBJ()
		});
		Object.defineProperty(b, '__ks_values', {
			value: new OBJ()
		});
		Object.defineProperty(b, 'fromIndex', {
			value: function(index) {
				return b.values[index];
			}
		});
		Object.defineProperty(b, 'fromName', {
			value: function(name) {
				return b.__ks_names[name];
			}
		});
		Object.defineProperty(b, 'fromValue', {
			value: function(value) {
				return b.__ks_values[value];
			}
		});

		var index = 0;

		for(var i = 0; i < values.length; i += 2) {
			b.__ks_new_value(values[i], values[i + 1], index++);
		}

		if(aliases) {
			for(var i = 0; i < aliases.length; i += 2) {
				b.__ks_new_alias(aliases[i], aliases[i + 1]);
			}
		}

		return b;
	}, // }}}
	cast: function(value, type, nullable, transform) { // {{{
		value = transform(value);
		if(value !== null) {
			return value;
		}
		if(nullable) {
			return null;
		}

		throw new TypeError('The given value can\'t be casted as a ' + type);
	}, // }}}
	castBitmask: function(item, name, type, cast) { // {{{
		if(cast) {
			var value = type(item[name]);
			if(value === null) {
				return false;
			}
			item[name] = value;
			return true;
		}
		return Type.isBitmaskInstance(item[name], type);
	}, // }}}
	castEnum: function(item, name, type, cast) { // {{{
		if(cast) {
			var value = type(item[name]);
			if(value === null) {
				return false;
			}
			item[name] = value;
			return true;
		}
		return Type.isEnumInstance(item[name], type);
	}, // }}}
	castEnumView: function(item, name, type, cast, test) { // {{{
		if(cast) {
			var value = type(item[name]);
			if(value === null || !test(value)) {
				return false;
			}
			item[name] = value;
			return true;
		}
		return test(item[name]);
	}, // }}}
	checkArray: function(item) { // {{{
		if(Type.isArray(item)) {
			return item;
		}
		throw new TypeError('Not an array');
	}, // }}}
	checkNum: function(v) { // {{{
		if(Type.isNumeric(v)) {
			return v;
		}
		throw new TypeError('Not a number');
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

			for(var key in api.$extends) {
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
	concatArray: function(nullable) { // {{{
		var arr = [];
		var arg;

		if(nullable) {
			for(var i = 1; i < arguments.length; i++) {
				arg = arguments[i];

				if(arg === void 0 || arg === null) {
					continue;
				}
				if(!Type.isArray(arg)) {
					throw new TypeError('Not an array');
				}

				arr.push.apply(arr, arg);
			}
		}
		else {
			for(var i = 1; i < arguments.length; i++) {
				arg = arguments[i];

				if(!Type.isArray(arg)) {
					throw new TypeError('Not an array');
				}

				arr.push.apply(arr, arg);
			}
		}

		return arr;
	}, // }}}
	concatObject: function(nullable, obj) { // {{{
		var arg, keys, key, descriptor;

		if(nullable) {
			for(var i = 2; i < arguments.length; i++) {
				arg = arguments[i];

				if(arg === void 0 || arg === null) {
					continue;
				}
				if(!Type.isObject(arg)) {
					throw new TypeError('Not an object');
				}

				keys = Object.keys(Object(arg));

				for (var k = 0, l = keys.length; k < l; k++) {
					key = keys[k];
					descriptor = Object.getOwnPropertyDescriptor(arg, key);

					if(descriptor !== void 0 && descriptor.enumerable) {
						obj[key] = arg[key];
					}
				}
			}
		}
		else {
			for(var i = 2; i < arguments.length; i++) {
				arg = arguments[i];

				if(!Type.isObject(arg)) {
					throw new TypeError('Not an object');
				}

				keys = Object.keys(Object(arg));

				for (var k = 0, l = keys.length; k < l; k++) {
					key = keys[k];
					descriptor = Object.getOwnPropertyDescriptor(arg, key);

					if(descriptor !== void 0 && descriptor.enumerable) {
						obj[key] = arg[key];
					}
				}
			}
		}
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
		if(Type.isConstructor(clazz)) {
			var o = Object.create(clazz.prototype);

			clazz.apply(o, args);

			return o;
		}
		else {
			return clazz.new.apply(clazz, args);
		}
	}, // }}}
	curry: function(router) { // {{{
		var funcs = Array.prototype.slice.call(arguments);

		funcs.shift();

		var fn = function() {
			return router.apply(null, [this, funcs].concat(Array.prototype.slice.call(arguments)));
		}

		for(var i = 0; i < funcs.length; i++) {
			fn['__ks_' + i] = funcs[i];
		}

		return fn;
	}, // }}}
	default: function(value, kind, fn, test) { // {{{
		if(value === void 0) {
			return fn();
		}
		else if(value === null) {
			return kind ? fn() : null;
		}
		else if(kind === 2 && Type.isNotEmpty(value)) {
			return fn();
		}
		else {
			if(test && !test(value)) {
				throw new TypeError('Invalid value');
			}

			return value;
		}
	}, // }}}
	delete: function(obj, prop) { // {{{
		delete obj[prop]
	}, // }}}
	enum: function(master, fieldLen) { // {{{
		var e = function(value) {
			if(!Type.isValue(value)) {
				return null;
			}
			if(value.__ks_enum === e) {
				return value;
			}
			if(e.__ks_values[value]) {
				return e.__ks_values[value];
			}
			return null;
		};

		var d = 2 + fieldLen;

		Object.defineProperty(e, '__ks_type', {
			value: 'enum'
		});
		Object.defineProperty(e, '__ks_new_value', {
			value: function(name, value, index) {
				var n = new master(value);

				Object.defineProperty(n, '__ks_enum', {
					value: e
				});
				Object.defineProperty(n, 'value', {
					value: value
				});
				Object.defineProperty(n, 'name', {
					value: Type.isString(name) ? name : null
				});
				Object.defineProperty(n, 'index', {
					value: Type.isNumber(index) ? index : null
				});

				e.values.push(n);
				e.__ks_names[name] = n;
				e.__ks_values[value] = n;
				e[name] = n;

				return n;
			}
		});
		Object.defineProperty(e, 'fields', {
			value: Array.prototype.slice.call(arguments, 2, d)
		});
		Object.defineProperty(e, 'values', {
			value: []
		});
		Object.defineProperty(e, '__ks_names', {
			value: new OBJ()
		});
		Object.defineProperty(e, '__ks_values', {
			value: new OBJ()
		});
		Object.defineProperty(e, 'fromIndex', {
			value: function(index) {
				return e.values[index];
			}
		});
		Object.defineProperty(e, 'fromName', {
			value: function(name) {
				return e.__ks_names[name];
			}
		});
		Object.defineProperty(e, 'fromValue', {
			value: function(value) {
				return e.__ks_values[value];
			}
		});

		var index = 0;

		for(var i = d; i < arguments.length; i += d) {
			var n = e.__ks_new_value(arguments[i], arguments[i + 1], index++);

			for(var k = 2; k < d; k++) {
				Object.defineProperty(n, arguments[k], {
					value: arguments[i + k]
				});
			}
		}

		return e;
	}, // }}}
	equalEnum: function(type, test, value) { // {{{
		if(!Type.isValue(value)) {
			return false
		}
		if(Type.isEnumInstance(value, type)) {
			return test(value)
		}
		if(type.__ks_members[value]) {
			return test(type.__ks_members[value])
		}
		return false
	}, // }}}
	function: function(main, router, lengthy) { // {{{
		var fn = lengthy ? function(x) {
			return router.apply(null, [this, main].concat(Array.prototype.slice.call(arguments)));
		} : function() {
			return router.apply(null, [this, main].concat(Array.prototype.slice.call(arguments)));
		};

		fn.__ks_0 = main;

		return fn;
	}, // }}}
	getVarargs: function(args, start, end) { // {{{
		return Array.from(args).slice(start, end)
	}, // }}}
	getVararg: function(args, start, end) { // {{{
		if(start < end) {
			return args[start];
		}
		else {
			return void 0;
		}
	}, // }}}
	getVarargMax: function(args, min, pts, index, max) { // {{{
		// console.log(args.length, pts, min, index, max)
		// var d = args.length - pts[index] - min;
		var d = args.length - min;
		// console.log(d)
		for(var i = 0; i <= index; ++i) {
			d -= pts[i + 1] - pts[i];
		}
		// console.log(d)
		return Math.min(d, max);
	}, // }}}
	implEnum: function(e) { // {{{
		var index = 0;

		for(var i = 1; i < arguments.length; i += 2) {
			e.__ks_new_value(arguments[i], arguments[i + 1], index++);
		}
	}, // }}}
	isUsingAllArgs: function(args, pts, index) { // {{{
		return pts[index] === args.length
	}, // }}}
	isVarargs: function(args, min, max, test, pts, index) { // {{{
		var f = pts[index];
		var l = Math.min(f + max, args.length);
		var i = f;

		while(i < l && test(args[i])) {
			++i;
		}

		if(i - f >= min) {
			pts[index + 1] = i;

			return true;
		}
		else {
			pts[index + 1] = f;

			return false;
		}
	}, // }}}
	length: function(item) { // {{{
		if(item === void 0 || item === null) {
			return 0;
		}
		if(Type.typeOf(item) === 'object') {
			return Object.keys(item).length;
		}
		return item.length;
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
	mapObject: function(obj, iterator, condition) { // {{{
		var map = [];

		if(condition) {
			for(var key in obj) {
				if(condition(key, obj[key])) {
					map.push(iterator(key, obj[key]));
				}
			}
		}
		else {
			for(var key in obj) {
				map.push(iterator(key, obj[key]));
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
	memo: function(fn) { // {{{
		var p = false;
		var r;

		return function() {
			if(!p) {
				r = fn.apply(null, arguments);
				p = true;
			}

			return r
		}
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
	notNull: function(value) { // {{{
		if(Type.isValue(value)) {
			return value
		}
		else {
			throw new TypeError('The given value can\'t be null');
		}
	}, // }}}
	struct: function(creator, router, caster) { // {{{
		var s = function() {
			var v = router.call(null, creator, arguments);
			Object.defineProperty(v, '__ks_struct', {
				value: s
			});
			return v;
		};

		Object.defineProperty(s, '__ks_type', {
			value: 'struct'
		});
		Object.defineProperty(s, '__ks_new', {
			value: function() {
				return s.apply(null, arguments);
			}
		});
		Object.defineProperty(s, '__ks_create', {
			value: creator
		});
		Object.defineProperty(s, '__ks_cast', {
			value: function() {
				return caster.call(null, creator, arguments);
			}
		});

		return s;
	}, // }}}
	toArray: function(value, check) { // {{{
		if(value === void 0 || value === null) {
			return [];
		}
		if(check) {
			return Helper.checkArray(value);
		}
		return value;
	}, // }}}
	toString: function(value) { // {{{
		if(value === void 0 || value === null) {
			return '';
		}
		return '' + value;
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
	tuple: function(creator, router) { // {{{
		var s = function() {
			var v = router.call(null, creator, arguments);
			Object.defineProperty(v, '__ks_tuple', {
				value: s
			});
			return v;
		};

		Object.defineProperty(s, '__ks_type', {
			value: 'tuple'
		});
		Object.defineProperty(s, '__ks_new', {
			value: function() {
				return s.apply(null, arguments);
			}
		});
		Object.defineProperty(s, '__ks_create', {
			value: creator
		});

		return s;
	}, // }}}
	valueOf: function(value) { // {{{
		if(Type.isEnumInstance(value)) {
			return value.value;
		}
		else if(Type.isValue(value)) {
			return value.valueOf ? value.valueOf() : value;
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

function $checkNum(v, op) { // {{{
	if(Type.isNumeric(v)) {
		return v
	}

	throw new TypeError('The elements of a "' + op + '" operation must be numbers');
} // }}}

var Operator = {
	add: function() { // {{{
		for(var i = 0; i < arguments.length; i++) {
			if(Type.isString(arguments[i])) {
				return Helper.concatString.apply(null, arguments);
			}
		}

		return Operator.addNum.apply(null, arguments);
	}, // }}}
	addNum: function() { // {{{
		var result = 0;

		for(var i = 0; i < arguments.length; i++) {
			if(Type.isNull(arguments[i])) {
				return null;
			}

			result += $checkNum(arguments[i], 'addition');
		}

		return result;
	}, // }}}
	bitAnd: function() { // {{{
		var res = arguments[0];

		if(Type.isNull(res)) {
			return null;
		}

		for(var i = 1; i < arguments.length; i++) {
			if(Type.isNull(arguments[i])) {
				return null;
			}

			res &= $checkNum(arguments[i], 'and');
		}

		return res;
	}, // }}}
	bitLeft: function() { // {{{
		if(Type.isNull(arguments[0])) {
			return null;
		}

		var result = $checkNum(arguments[0], 'left-shift');

		for(var i = 1; i < arguments.length; i++) {
			if(Type.isNull(arguments[i])) {
				return null;
			}

			result <<= $checkNum(arguments[i], 'left-shift');
		}

		return result;
	}, // }}}
	bitNeg: function(value) { // {{{
		return ~$checkNum(value, 'negation')
	}, // }}}
	bitOr: function() { // {{{
		var res = arguments[0];

		if(Type.isNull(res)) {
			return null;
		}

		for(var i = 1; i < arguments.length; i++) {
			if(Type.isNull(arguments[i])) {
				return null;
			}

			res |= $checkNum(arguments[i], 'or');
		}

		return res;
	}, // }}}
	bitRight: function() { // {{{
		if(Type.isNull(arguments[0])) {
			return null;
		}

		var result = $checkNum(arguments[0], 'right-shift');

		for(var i = 1; i < arguments.length; i++) {
			if(Type.isNull(arguments[i])) {
				return null;
			}

			result >>= $checkNum(arguments[i], 'right-shift');
		}

		return result;
	}, // }}}
	bitXor: function() { // {{{
		var res = arguments[0];

		if(Type.isNull(res)) {
			return null;
		}

		for(var i = 1; i < arguments.length; i++) {
			if(Type.isNull(arguments[i])) {
				return null;
			}

			res ^= $checkNum(arguments[i], 'xor');
		}

		return res;
	}, // }}}
	division: function() { // {{{
		if(Type.isNull(arguments[0])) {
			return null;
		}

		var result = $checkNum(arguments[0], 'division');

		for(var i = 1; i < arguments.length; i++) {
			if(Type.isNull(arguments[i])) {
				return null;
			}

			result /= $checkNum(arguments[i], 'division');
		}

		return result;
	}, // }}}
	divisionEuclidean: function(cx, x, cy, y) { // {{{
		if(cx) {
			if(Type.isNull(x)) {
				return null;
			}

			x = $checkNum(x, 'euclidean-division');
		}
		if(cy) {
			if(Type.isNull(y)) {
				return null;
			}

			y = $checkNum(y, 'euclidean-division');
		}

		var q = Number.parseInt(x / y)
		var r = x % y;

		if(y < 0) {
			if(r > 0) {
				r = r + y;
			}
		}
		else {
			if(r < 0) {
				r = r + y;
			}
		}

		return [q, r];
	}, // }}}
	divisionInteger: function() { // {{{
		var x, y;

		if(arguments[0]) {
			if(Type.isNull(arguments[1])) {
				return null;
			}

			x = $checkNum(arguments[1], 'integer-division');
		}
		else {
			x = arguments[1];
		}

		for(var i = 2; i < arguments.length; i += 2) {
			if(arguments[i]) {
				if(Type.isNull(arguments[i + 1])) {
					return null;
				}

				y = $checkNum(arguments[i + 1], 'integer-division');
			}
			else {
				y = arguments[i + 1];
			}

			x = Number.parseInt(x / y);
		}

		return x;
	}, // }}}
	eq: function(x, y) { // {{{
		if(typeof x === typeof y) {
			return x === y;
		}
		else {
			return false;
		}
	}, // }}}
	gt: function(x, y) { // {{{
		return $checkNum(x, 'gt') > $checkNum(y, 'gt');
	}, // }}}
	gte: function(x, y) { // {{{
		return $checkNum(x, 'gte') >= $checkNum(y, 'gte');
	}, // }}}
	lt: function(x, y) { // {{{
		return $checkNum(x, 'lt') < $checkNum(y, 'lt');
	}, // }}}
	lte: function(x, y) { // {{{
		return $checkNum(x, 'lte') <= $checkNum(y, 'lte');
	}, // }}}
	modulus: function() { // {{{
		var x, y;

		if(arguments[0]) {
			if(Type.isNull(arguments[1])) {
				return null;
			}

			x = $checkNum(arguments[1], 'modulus');
		}
		else {
			x = arguments[1];
		}

		for(var i = 2; i < arguments.length; i += 2) {
			if(arguments[i]) {
				if(Type.isNull(arguments[i + 1])) {
					return null;
				}

				y = $checkNum(arguments[i + 1], 'modulus');
			}
			else {
				y = arguments[i + 1];
			}

			x = x % y;

			if(y < 0) {
				if(x > 0) {
					x = x + y;
				}
			}
			else {
				if(x < 0) {
					x = x + y;
				}
			}
		}

		return x;
	}, // }}}
	multiplication: function() { // {{{
		if(Type.isNull(arguments[0])) {
			return null;
		}

		var result = $checkNum(arguments[0], 'multiplication');

		for(var i = 1; i < arguments.length; i++) {
			if(Type.isNull(arguments[i])) {
				return null;
			}

			result *= $checkNum(arguments[i], 'multiplication');
		}

		return result;
	}, // }}}
	negative: function(value) { // {{{
		if(Type.isNull(value)) {
			return null;
		}

		return -$checkNum(value, 'negative');
	}, // }}}
	neq: function(x, y) { // {{{
		if(typeof x === typeof y) {
			return x !== y;
		}
		else {
			return true;
		}
	}, // }}}
	power: function() { // {{{
		if(Type.isNull(arguments[0])) {
			return null;
		}

		var result = $checkNum(arguments[0], 'multiplication');

		for(var i = 1; i < arguments.length; i++) {
			if(Type.isNull(arguments[i])) {
				return null;
			}

			result **= $checkNum(arguments[i], 'multiplication');
		}

		return result;
	}, // }}}
	remainder: function() { // {{{
		if(Type.isNull(arguments[0])) {
			return null;
		}

		var result = $checkNum(arguments[0], 'remainder');

		for(var i = 1; i < arguments.length; i++) {
			if(Type.isNull(arguments[i])) {
				return null;
			}

			result %= $checkNum(arguments[i], 'remainder');
		}

		return result;
	}, // }}}
	subtraction: function() { // {{{
		if(Type.isNull(arguments[0])) {
			return null;
		}

		var result = $checkNum(arguments[0], 'subtraction');

		for(var i = 1; i < arguments.length; i++) {
			if(Type.isNull(arguments[i])) {
				return null;
			}

			result -= $checkNum(arguments[i], 'subtraction');
		}

		return result;
	} // }}}
}

var OBJ = function() {};
OBJ.prototype = Object.create(null);

try {
	eval('class $$ {}');

	$support.class = true;

	Helper.create = eval('(function(){return function(clazz,args){return new clazz(...args)}})()')

	Type.isClassInstance = function(item, type) { // {{{
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
	Helper: Helper,
	OBJ: OBJ,
	Operator: Operator,
	Type: Type,
	initFlag: initFlag
};
