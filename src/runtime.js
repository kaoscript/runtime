/**
 * runtime.js
 * Version 0.4.1
 * September 14th, 2016
 *
 * Copyright (c) 2016 Baptiste Augrain
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 **/
var $typeofs = { // {{{
	Array: 'Type.isArray',
	Boolean: 'Type.isBoolean',
	Function: 'Type.isFunction',
	NaN: 'isNaN',
	Number: 'Type.isNumber',
	Object: 'Type.isObject',
	String: 'Type.isString'
}; // }}}

var $call = {
	method: function(fnName, argName, method, index) { // {{{
		if(method.min === method.max) {
			var source = 'return this.' + fnName + index + '(';
			
			for(var i = 0; i < method.min; i++) {
				if(i) {
					source += ', ';
				}
				
				source += argName + '[' + i + ']';
			}
			
			return source + ');';
		}
		else {
			return 'return this.' + fnName + index + '.apply(this, ' + argName + ')';
		}
	}, // }}}
	sealedClass: function(fnName, method, index) { // {{{
		if(method.min === method.max) {
			var source;
			if(method.sealed) {
				source = 'return this.' + fnName + index + '(';
			}
			else {
				source = 'return that.' + fnName + index + '(';
			}
				
			for(var i = 0; i < method.min; i++) {
				if(i) {
					source += ', ';
				}
				
				source += 'args[' + i + ']';
			}
			
			return source + ');';
		}
		else {
			if(method.sealed) {
				return 'return this.' + fnName + index + '.apply(null, args)';
			}
			else {
				return 'return that.' + fnName + index + '.apply(null, args)';
			}
		}
	}, // }}}
	sealedInstance: function(fnName, method, index) { // {{{
		if(method.min === method.max) {
			if(method.sealed) {
				var source = 'return this.' + fnName + index + '.call(that';
				
				for(var i = 0; i < method.min; i++) {
					source += ', args[' + i + ']';
				}
				
				return source + ');';
			}
			else {
				var source = 'return that.' + fnName + index + '(';
				
				for(var i = 0; i < method.min; i++) {
					if(i) {
						source += ', ';
					}
					
					source += 'args[' + i + ']';
				}
				
				return source + ');';
			}
		}
		else {
			if(method.sealed) {
				return 'return this.' + fnName + index + '.apply(that, args)';
			}
			else {
				return 'return that.' + fnName + index + '.apply(that, args)';
			}
		}
	} // }}}
};

var $curry = function(self) { // {{{
	var args = Array.prototype.slice.call(arguments);
	var self = args.shift();
	return function() {
		return self.apply(null, args.concat(Array.prototype.slice.call(arguments)));
	};
}; // }}}

var $helper = {
	decide: function(type, index, path, argName) { // {{{
		if($typeofs[type]) {
			return $typeofs[type] + '(' + argName + '[' + index + '])';
		}
		else {
			return 'Type.is(' + argName + '[' + index + '], ' + path + ')';
		}
	}, // }}}
	findMethod: function(method, methods) { // {{{
		var m, p, s;
		for(var i = 0; i < methods.length; i++) {
			m = methods[i];
			
			if(m.min === method.min && m.max === method.max && m.parameters.length === method.parameters.length) {
				s = true;
				
				for(var p = 0; s && p < m.parameters.length; p++) {
					s = $helper.sameParameter(m.parameters[p], method.parameters[p]);
				}
				
				if(s) {
					return m;
				}
			}
		}
		
		return null;
	}, // }}}
	methods: function(variable, name, parameters, methods, call, argName, refName, returns) { // {{{
		//var source = 'console.log("' + name + '", arguments);if(false){}';
		var source = '';
		
		var method;
		if(methods.length === 0) {
			source += 'if(' + argName + '.length !== 0) {';
			source += 'throw new Error("Wrong number of arguments")';
			source += '}';
		}
		else if(methods.length === 1) {
			method = methods[0];
			
			if(method.min === 0 && method.max >= Infinity) {
				source += call(method, 0);
			}
			else {
				if(method.min === method.max) {
					source += 'if(' + argName + '.length === ' + method.min + ') {';
					
					source += call(method, 0);
					
					if(returns) {
						source += 'throw new Error("Wrong number of arguments");';
					}
					else {
						source += '} else {throw new Error("Wrong number of arguments");}';
					}
				}
				else if(method.max < Infinity) {
					
					source += 'if(' + argName + '.length >= ' + method.min + ' && ' + argName + '.length <= ' + method.max + ') {';
					
					source += call(method, 0);
					
					if(returns) {
						source += 'throw new Error("Wrong number of arguments");';
					}
					else {
						source += '} else {throw new Error("Wrong number of arguments");}';
					}
				}
				else {
					source += call(method, 0);
				}
			}
		}
		else {
			var groups = [];
			
			var method, nf, group;
			for(var i = 0; i < methods.length; i++) {
				method = methods[i];
				method.index = i;
				
				nf = true;
				for(var g = 0; nf && g < groups.length; g++) {
					group = groups[g];
					
					if((method.min <= group.min && method.max >= group.min) || (method.min >= group.min && method.max <= group.max) || (method.min <= group.max && method.max >= group.max)) {
						nf = false;
					}
				}
				
				if(nf) {
					groups.push({
						min: method.min,
						max: method.max,
						methods: [method]
					});
				}
				else {
					group.min = Math.min(group.min, method.min);
					group.max = Math.max(group.max, method.max);
					group.methods.push(method);
				}
			}
			
			var nf = true;
			
			for(var g = 0; g < groups.length; g++) {
				group = groups[g];
				
				if(group.min === group.max) {
					if(source.length) {
						source += ' else '
					}
					
					source += 'if(' + argName + '.length === ' + group.min + ') {';
					
					if(group.methods.length === 1) {
						source += call(group.methods[0], group.methods[0].index, argName);
					}
					else {
						source += $helper.methodCheck(group, call, argName, refName, returns);
					}
					
					source += '}';
				}
				else if(group.max < Infinity) {
					if(source.length) {
						source += ' else '
					}
					
					source += 'if(' + argName + '.length >= ' + group.min + ' && arguments.length <= ' + group.max + ') {';
					
					if(group.methods.length === 1) {
						source += call(group.methods[0], group.methods[0].index);
					}
					else {
						source += $helper.methodCheck(group, call, argName, refName, returns);
					}
					
					source += '}';
				}
				else {
					nf = false;
					
					if(source.length) {
						source += ' else {'
					
						if(group.methods.length === 1) {
							source += call(group.methods[0], group.methods[0].index);
						}
						else {
							source += $helper.methodCheck(group, call, argName, refName, returns);
						}
						
						source += '}';
					}
					else {
						if(group.methods.length === 1) {
							source += call(group.methods[0], group.methods[0].index);
						}
						else {
							source += $helper.methodCheck(group, call, argName, refName, returns);
						}
					}
				}
			}
			
			if(nf) {
				if(returns) {
					source += 'throw new Error("Wrong number of arguments");';
				}
				else {
					source += ' else {throw new Error("Wrong number of arguments");}';
				}
			}
		}
		//console.log(source);
		
		if(/\bType\b/.test(source)) {
			variable[name] = eval('(function(Type){return function(' + parameters + ') {' + source + '};})').apply(null, [Type]);
		}
		else {
			variable[name] = new Function(parameters, source);
		}
	}, // }}}
	methodCheck: function(group, call, argName, refName, returns) { // {{{
		var {error, source} = $helper.methodCheckTree(group.methods, 0, call, argName, refName, returns);
		
		if(error) {
			if(returns) {
				source += 'throw new Error("Wrong type of arguments");';
			}
			else {
				source += ' else {throw new Error("Wrong type of arguments");}';
			}
		}
		
		return source;
	}, // }}}
	methodCheckTree: function(methods, index, call, argName, refName, returns) { // {{{
		var tree = [];
		var usages = [];
		
		var types, usage, k, type, nf, t, item;
		for(var i = 0; i < methods.length; i++) {
			types = $helper.methodTypes(methods[i], index);
			usage = {
				method: methods[i],
				usage: 0,
				tree: []
			};
			
			for(k = 0; k < types.length; k++) {
				type = types[k];
				
				nf = true;
				for(t = 0; nf && t < tree.length; t++) {
					if($helper.sameType(type.type, tree[t].type)) {
						tree[t].methods.push(methods[i]);
						nf = false;
					}
				}
				
				if(nf) {
					item = {
						type: type.type,
						path: 'this.constructor.__ks_reflect.' + refName + '[' + methods[i].index + '].parameters[' + type.index + ']' + type.path,
						methods: [methods[i]]
					};
					
					tree.push(item);
					usage.tree.push(item);
					
					++usage.usage;
				}
			}
			
			usages.push(usage);
		}
		
		if(tree.length === 1) {
			var item = tree[0];
			
			if(item.methods.length === 1) {
				return {
					error: false,
					source: call(item.methods[0], item.methods[0].index)
				};
			}
			else {
				return $helper.methodCheckTree(item.methods, index + 1, call, argName, refName, returns);
			}
		}
		else {
			var source = '';
			var ne = true;
			
			usages.sort(function(a, b) {
				return a.usage - b.usage;
			});
			
			var usage;
			for(var u = 0; u < usages.length; u++) {
				usage = usages[u];
				
				if(usage.tree.length === usage.usage) {
					item = usage.tree[0];
					
					if(u + 1 === usages.length) {
						if(source.length > 1) {
							source += 'else {';
							
							ne = false;
						}
					}
					else {
						if(source.length > 1) {
							source += 'else ';
						}
						
						source += 'if(';
						
						source += $helper.decide(item.type, index, item.path, argName);
						
						source += ') {';
					}
					
					if(item.methods.length === 1) {
						source += call(item.methods[0], item.methods[0].index);
					}
					else {
						source += $helper.methodCheckTree(item.methods, index + 1, call, argName, refName, returns).source;
					}
					
					source += '}'
				}
				else {
					throw new Error('Not Implemented');
				}
			}
			
			return {
				error: ne,
				source: source
			};
		}
	}, // }}}
	methodTypes: function(method, index) { // {{{
		var types = [];
		
		var k = -1;
		
		var parameter;
		for(var i = 0; k < index && i < method.parameters.length; i++) {
			parameter = method.parameters[i];
			
			if(k + parameter.max >= index) {
				if(Type.isArray(parameter.type)) {
					for(var j = 0; j < parameter.type.length; j++) {
						types.push({
							type: parameter.type[j],
							index: i,
							path: '.type[' + j + ']'
						});
					}
				}
				else {
					types.push({
						type: parameter.type,
						index: i,
						path: '.type'
					});
				}
			}
			
			k += parameter.min;
		}
		
		return types;
	}, // }}}
	sameParameter: function(a, b) { // {{{
		return $helper.sameType(a.type, b.type) && a.min === b.min && a.max === b.max
	}, // }}}
	sameType: function(s1, s2) { // {{{
		if(Type.isArray(s1)) {
			if(Type.isArray(s2) && s1.length === s2.length) {
				for(var i = 0; i < s1.length; i++) {
					if(!$helper.sameType(s1[i], s2[i])) {
						return false;
					}
				}
				
				return true;
			}
			else {
				return false;
			}
		}
		else {
			return s1 === s2;
		}
	} // }}}
};

var $parameter = {
	equals: function(a, b) { // {{{
		return a.min === b.min && a.max === b.max && a.type === b.type;
	} // }}}
};

var $signature = {
	contains: function(list, signature) { // {{{
		for(var i = 0; i < list.length; i++) {
			if($signature.equals(signature, list[i])) {
				return true;
			}
		}
		
		return false;
	}, // }}}
	equals: function(a, b) { // {{{
		if(a.min === b.min && a.max === b.max && a.sealed === b.sealed && a.parameters.length === b.parameters.length) {
			for(var i = 0, l = a.parameters.length; i < l; i++) {
				if(!$parameter.equals(a.parameters[i], b.parameters[i])) {
					return false;
				}
			}
			
			return true;
		}
		
		return false;
	} // }}}
};

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
	isRegExp: function(item) { // {{{
		return item !== null && typeof item === 'object' && item.constructor.name === 'RegExp';
	}, // }}}
	isString: function(item) { // {{{
		return typeof item === 'string';
	}, // }}}
	isValue: function(item) { // {{{
		return item != null && typeof item !== 'undefined';
	}, // }}}
	typeOf: function(item) { // {{{
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
	} // }}}
};

Type.isRegex = Type.isRegExp;

var Helper = {
	curry: function(self, bind, args = []) { // {{{
		return function(...supplements) {
			return self.apply(bind, args.concat(supplements));
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
	newClassMethod: function(options) { // {{{
		//console.log(options)
		if(options.sealed) { // {{{
			var name = options.name;
			var methods = [];
			
			if(options.class.__ks_reflect && Type.isArray(options.class.__ks_reflect.classMethods[name])) {
				methods.push.apply(methods, options.class.__ks_reflect.classMethods[name]);
			}
			
			if(!options.sealed.__ks_reflect) {
				options.sealed.__ks_reflect = {
					instanceMethods: {},
					classMethods: {}
				};
			}
			if(!Type.isArray(options.sealed.__ks_reflect.classMethods[name])) {
				options.sealed.__ks_reflect.classMethods[name] = [];
			}
			methods.push.apply(methods, options.sealed.__ks_reflect.classMethods[name]);
			
			options.signature.sealed = true;
			
			if($signature.contains(options.sealed.__ks_reflect.classMethods[name], options.signature)) {
				// already added
			}
			else {
				var index = methods.length;
				
				options.sealed.__ks_reflect.classMethods[name].push(options.signature);
				
				methods.push(options.signature);
				
				if(options.function) {
					if(options.arguments) {
						options.sealed['__ks_sttc_' + name + '_' + index] = function() {
							return options.function.apply(null, options.arguments.concat(Array.prototype.slice.call(arguments)));
						};
					}
					else {
						options.sealed['__ks_sttc_' + name + '_' + index] = options.function;
					}
				}
				
				$helper.methods(options.sealed, '_cm_' + name, '...args', methods, $curry($call.sealedClass, '__ks_sttc_' + name + '_'), 'args', 'classMethods.' + name);
			}
		} // }}}
		else { // {{{
			var name = options.name;
			var reflect = options.class.__ks_reflect;
			
			if(!Type.isArray(reflect.classMethods[name])) {
				reflect.classMethods[name] = [];
			}
			
			var method = $helper.findMethod(options.signature, reflect.classMethods[name]);
			if(!method) {
				method = options.signature;
				method.index = reflect.classMethods[name].length;
				
				reflect.classMethods[name].push(method);
			}
			
			if(options.function) {
				if(options.arguments) {
					options.class['__ks_sttc_' + name + '_' + method.index] = function() {
						return options.function.apply(this, options.arguments.concat(Array.prototype.slice.call(arguments)));
					};
				}
				else {
					options.class['__ks_sttc_' + name + '_' + method.index] = options.function;
				}
			}
			else if(options.method) {
				if(options.arguments) {
					options.class['__ks_sttc_' + name + '_' + method.index] = function() {
						return this[options.method].apply(this, options.arguments.concat(Array.prototype.slice.call(arguments)));
					};
				}
				else {
					options.class['__ks_sttc_' + name + '_' + method.index] = options.class.prototype[options.method];
				}
			}
			
			$helper.methods(options.class, name, '', reflect.classMethods[name], $curry($call.method, '__ks_sttc_' + name + '_', 'arguments'), 'arguments', 'classMethods.' + name);
		} // }}}
	}, // }}}
	newInstanceMethod: function(options) { // {{{
		if(options.sealed) { // {{{
			var name = options.name;
			var methods = [];
			
			if(options.class.__ks_reflect && Type.isArray(options.class.__ks_reflect.instanceMethods[name])) {
				methods.push.apply(methods, options.class.__ks_reflect.instanceMethods[name]);
			}
			
			if(!options.sealed.__ks_reflect) {
				options.sealed.__ks_reflect = {
					instanceMethods: {},
					classMethods: {}
				};
			}
			if(!Type.isArray(options.sealed.__ks_reflect.instanceMethods[name])) {
				options.sealed.__ks_reflect.instanceMethods[name] = [];
			}
			methods.push.apply(methods, options.sealed.__ks_reflect.instanceMethods[name]);
			
			options.signature.sealed = true;
			
			if($signature.contains(options.sealed.__ks_reflect.instanceMethods[name], options.signature)) {
				// already added
			}
			else {
				var index = methods.length;
				
				options.sealed.__ks_reflect.instanceMethods[name].push(options.signature);
				
				methods.push(options.signature);
				
				if(options.function) {
					if(options.arguments) {
						options.sealed['__ks_func_' + name + '_' + index] = function() {
							return options.function.apply(this, options.arguments.concat(Array.prototype.slice.call(arguments)));
						};
					}
					else {
						options.sealed['__ks_func_' + name + '_' + index] = options.function;
					}
				}
				else if(options.method) {
					if(options.arguments) {
						options.sealed['__ks_func_' + name + '_' + index] = function() {
							return options.class.prototype[options.method].apply(this, options.arguments.concat(Array.prototype.slice.call(arguments)));
						};
					}
					else {
						options.sealed['__ks_func_' + name + '_' + index] = options.class.prototype[options.method];
					}
				}
				
				$helper.methods(options.sealed, '_im_' + name, 'that, ...args', methods, $curry($call.sealedInstance, '__ks_func_' + name + '_'), 'args', 'instanceMethods.' + name);
			}
		} // }}}
		else { // {{{
			var name = options.name;
			var reflect = options.class.__ks_reflect;
			
			if(!Type.isArray(reflect.instanceMethods[name])) {
				reflect.instanceMethods[name] = [];
			}
			
			var method = $helper.findMethod(options.signature, reflect.instanceMethods[name]);
			if(!method) {
				method = options.signature;
				method.index = reflect.instanceMethods[name].length;
				
				reflect.instanceMethods[name].push(method);
			}
			
			if(options.function) {
				if(options.arguments) {
					options.class.prototype['__ks_func_' + name + '_' + method.index] = function() {
						return options.function.apply(this, options.arguments.concat(Array.prototype.slice.call(arguments)));
					};
				}
				else {
					options.class.prototype['__ks_func_' + name + '_' + method.index] = options.function;
				}
			}
			else if(options.method) {
				if(options.arguments) {
					options.class.prototype['__ks_func_' + name + '_' + method.index] = function() {
						return this[options.method].apply(this, options.arguments.concat(Array.prototype.slice.call(arguments)));
					};
				}
				else {
					options.class.prototype['__ks_func_' + name + '_' + method.index] = options.class.prototype[options.method];
				}
			}
			
			$helper.methods(options.class.prototype, name, '', reflect.instanceMethods[name], $curry($call.method, '__ks_func_' + name + '_', 'arguments'), 'arguments', 'instanceMethods.' + name);
		} // }}}
	}, // }}}
	vcurry: function(self, bind, ...args) { // {{{
		return function(...supplements) {
			return self.apply(bind, args.concat(supplements));
		};
	} // }}}
};

module.exports = {
	Helper: Helper,
	Type: Type
};