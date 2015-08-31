window.injectToThis = function (ctor) {
	return function () {
		for( var i=0; i<arguments.length; i++ ) {
			this[ctor.$inject[i]] = arguments[i];
		}

		var name = ctor.$name || 'global';
		this.debug = this.debug('app:' + name);
	}
};