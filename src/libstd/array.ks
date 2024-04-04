extern system class Array<T>

disclose Array<T is Any?> {
	length: Number
	indexOf(searchElement: T, fromIndex: Number = 0): Number
	join(separator: String?): String
	// TODO!
	// map<R>(callback: (element: T, index: Number, array: T[]): R, thisArg?): R[]
	map(callback: Function, thisArg? = null): []
	pop(): T?
	push(...elements: T): Number
	reverse(): T[]
	shift(): T?
	slice(begin: Number = 0, end: Number = -1): T[]
	// TODO!
	// some(callback: (element: T, index: Number, array: T[]): Boolean, thisArg? = null): Boolean
	some(callback): Boolean
	splice(start: Number = 0, deleteCount: Number = 0, ...items: T): T[]
	// TODO!
	// sort(compare: (a: T, b: T): Number | Null = null): T[]
	sort(compare: Function? = null): T[]
	unshift(...elements: T): Number
}
