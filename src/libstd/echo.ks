syntime func echo(...args) {
	quote {
		#[rules(ignore-error)]
		console.log(#(args))
	}
}
