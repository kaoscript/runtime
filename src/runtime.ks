/**
 * runtime.ks
 * Version 0.1.0
 * September 14th, 2016
 *
 * Copyright (c) 2016 Baptiste Augrain
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 **/
import Class, Type from ./runtime.js

extern {
	final class Array
	final class Function
	final class Object
}

impl Array {
	static {
		map(array: array, iterator: func) {
			let results = []
			
			for item, index in array {
				results.push(iterator(item, index))
			}
			
			return results
		}
		
		map(array: array, iterator: func, condition: func) {
			let results = []
			
			for item, index in array {
				results.push(iterator(item, index)) if condition(item, index)
			}
			
			return results
		}
	}
}

impl Function {
	static {
		curry(self: func, bind?, args) {
			return func(...supplements) {
				return self.apply(bind, args.concat(supplements))
			}
		}
		
		vcurry(self: func, bind?, ...args) {
			return func(...supplements) {
				return self.apply(bind, args.concat(supplements))
			}
		}
	}
}

impl Object {
	static {
		append(object, ...args) {
			for arg in args when arg {
				for key, value of arg {
					object[key] = value
				}
			}
			
			return object
		}
		
		map(object: object, iterator: func) {
			let results = []
			
			for item, index of object {
				results.push(iterator(item, index))
			}
			
			return results
		}
		
		map(object: object, iterator: func, condition: func) {
			let results = []
			
			for item, index of object {
				results.push(iterator(item, index)) if condition(item, index)
			}
			
			return results
		}
	}
}

export Array, Class, Function, Object, Type