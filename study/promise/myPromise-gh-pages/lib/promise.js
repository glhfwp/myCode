var promiseNums = 1;

function Promise(resolver) {
	this.status = "pending";
	this.value = null;
	this.handlers = [];
	this._doPromise.call(this, resolver);
	this.promiseNums = promiseNums;
	console.log('Promise' + promiseNums + "----------------------------");
	promiseNums++;
}

Promise.prototype = {
	constructor: Promise,
	_doPromise: function(resolver) {
		var called = false,
			self = this;
		try {
			resolver(function(value) {
				!called && (called = true, self.resolve(value));
			}, function(reason) {
				!called && (called = true, self.reject(reason));
			});
		} catch (e) {
			!called && (called = true, self.reject(e));
		}
	},
	resolve: function(value) {
		try {
			if (this === value) {
				throw new TypeError("Promise connot be resolved by itself.");
			} else {
				value && value.then && this._doPromise(value.then);
			}
			console.log(this.promiseNums + 'resolve')
			this.status = "fulfilled";
			this.value = value;
			this._dequeue();
		} catch (e) {
			this.reject(e);
		}
	},
	reject: function(reason) {
		this.status = "rejected";
		this.value = reason;
		this._dequeue();
		console.log(this.promiseNums + 'reject');
	},
	_dequeue: function() {
		var handler;
		while (this.handlers.length) {
			handler = this.handlers.shift();
			this._handle(handler.thenPromise, handler.onFulfilled, handler.onRejected);
		}
	},
	_handle: function(thenPromise, onFulfilled, onRejected) {
		var self = this;
		setTimeout(function() {
			var callback = self.status == "fulfilled" ? onFulfilled : onRejected;
			if (typeof callback === 'function') {
				try {
					self.resolve.call(thenPromise, callback(self.value));
				} catch (e) {
					self.reject.call(thenPromise, e);
				}
				return;
			}
			self.status == "fulfilled" ? self.resolve.call(thenPromise, self.value) : self.reject.call(thenPromise, self.value);
		}, 1);
	},
	then: function(onFulfilled, onRejected) {
		var thenPromise = new Promise(function() {});
		console.log(this.promiseNums + "	then 	" + thenPromise.promiseNums)
		if (this.status == "pending") {
			this.handlers.push({
				thenPromise: thenPromise,
				onFulfilled: onFulfilled,
				onRejected: onRejected
			});
		} else {
			this._handle(thenPromise, onFulfilled, onRejected);
		}
		return thenPromise;
	}
};
