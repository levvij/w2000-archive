Array.prototype.replace = function (from, to) {
	const a = [];
	
	for (let i = 0; i < this.length; i++) {
		if (this[i] == from) {
			a.push(to);
 		} else {
			a.push(this[i]);
		}
	}
	
	return a;
}

Array.prototype.mapAwait = async function (fx) {
	const array = [];
	
	for (let i = 0; i < this.length; i++) {
		array.push(await fx(this[i], i, this));
	}
	
	return array;
}