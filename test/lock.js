var vows = require('vows');
var assert = require('assert');
var Lock = require('../libs/lock');

var lock_1 = null;

vows.describe('Locking').addBatch({

	'acquire and release and acquire' : {
		topic : function() {
			lock_1 = new Lock("test_lock_acquire");
			lock_1.acquire(this.callback)

		},
		'check no errors' : function(err, res) {
			assert.equal(err, null);
		},
		'check lock acquired' : function(err, res) {
			assert.ok(res);
		},
		'release' : {
			topic : function() {

				lock_1.release(this.callback)

			},
			'check no errors' : function(err, res) {
				assert.equal(err, null);
			},
			'check lock release' : function(err, res) {
				assert.ok(res);
			},
			
			'acquire again' : {
				topic : function() {
					var lock = new Lock("test_lock_acquire");
					lock.acquire(this.callback)
		
				},
				'check no errors' : function(err, res) {
					assert.equal(err, null);
				},
				'check lock acquired' : function(err, res) {
					assert.ok(res);
				},
			}
		}
	},

	'acquire and reacquire a lock' : {
		topic : function() {
			lock_2 = new Lock("test_lock_acquire_2");
			lock_2.acquire(this.callback)

		},
		'check no errors' : function(err, res) {
			assert.equal(err, null);
		},
		'check lock acquired' : function(err, res) {
			assert.ok(res);
		},
		're acquire' : {
			topic : function() {

				var lock = new Lock("test_lock_acquire_2");
				lock.acquire(this.callback)

			},
			'check no errors' : function(err, res) {
				assert.equal(err, null);
			},
			'check lock not acquired' : function(err, res) {
				assert.equal(res, false);
			}

		}
	},

	'acquire a dead lock' : {
		topic : function() {
			var lock = new Lock("test_lock_acquire_3", 1);
			lock.acquire(this.callback)

		},
		'check no errors' : function(err, res) {
			assert.equal(err, null);
		},
		'check lock acquired' : function(err, res) {
			assert.ok(res);
		},
		
		'try to acquire' : {
			topic : function() {
				setTimeout(function () {
					lock_3 = new Lock("test_lock_acquire_3");
					lock_3.acquire(this.callback)
				}.bind(this), 2000);
				

			},
			'check no errors' : function(err, res) {
				assert.equal(err, null);
			},
			'check lock is acquired' : function(err, res) {
				assert.equal(res, true);
			}

		}
	},
	
	'release a dead lock' : {
		topic : function() {
			lock_4 = new Lock("test_lock_acquire_4", 1);
			lock_4.acquire(this.callback)

		},
		'check no errors' : function(err, res) {
			assert.equal(err, null);
		},
		'check lock acquired' : function(err, res) {
			assert.ok(res);
		},
		
		'release' : {
			
			topic : function () {
				setTimeout(function () {
					lock_4.release(this.callback)
				}.bind(this), 2000);
			},
			'check no errors' : function(err, res) {
				assert.equal(err, null);
			},
			'check lock is not released' : function(err, res) {
				assert.equal(res, false);
			},
		}
	}
	
	
}).export(module);
