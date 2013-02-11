
var request = require("request");
var qs = require("querystring");
var uuid = require("node-uuid");
var should = require("should");
var sinon = require("sinon");
var url = require("url");

var ua = require("../lib/index.js");
var utils = require("../lib/utils.js")
var config = require("../lib/config.js")


describe("ua", function () {

	it("should be usable as a function", function () {
		ua("foo").should.be.instanceof(ua.Visitor);
	});

	it("should be usable as a constructor", function () {
		new ua("foo").should.be.instanceof(ua.Visitor);
	});

	it("should accept arguments (tid, cid, options)", function () {
		var tid = "UA-XXXXX-XX"
		var cid = uuid.v4()
		var options = {};

		var visitor = ua(tid, cid, options)

		visitor.tid.should.equal(tid)
		visitor.cid.should.equal(cid)
		visitor.options.should.equal(options)
	});

	it("should accept arguments (tid, cid)", function () {
		var tid = "UA-XXXXX-XX"
		var cid = uuid.v4()

		var visitor = ua(tid, cid)

		visitor.tid.should.equal(tid)
		visitor.cid.should.equal(cid)
		visitor.options.should.eql({}, "An empty options hash should've been created")
	});

	it("should accept arguments (tid, options)", function () {
		var tid = Math.random().toString();
		var options = {}

		var visitor = ua(tid, options)

		visitor.tid.should.equal(tid)
		utils.isUuid(visitor.cid).should.equal(true, "A valid random UUID should have been generated")
		visitor.options.should.eql(options)

	});

	it("should accept arguments (options)", function () {
		var options = {}

		var visitor = ua(options);

		should.not.exist(visitor.tid)
		utils.isUuid(visitor.cid).should.equal(true, "A valid random UUID should have been generated")
		visitor.options.should.eql(options)
	});

	it("should accept tid and cid via the options arguments", function () {
		var options = {
			tid: "UA-XXXXX-XX",
			cid: uuid.v4()
		};

		var visitor = ua(options);

		visitor.tid.should.equal(options.tid)
		visitor.cid.should.equal(options.cid)
		visitor.options.should.equal(options)
	});


	describe("#debug", function () {

		var log;

		before(function () {
			log = sinon.stub(ua.Visitor.prototype, "_log")
		});

		after(function () {
			log.restore();
		});

		it("should enable debugging when invoked without arguments", function () {
			var visitor = ua().debug()

			visitor.options.debug.should.equal(true);

			visitor.debug().should.equal(visitor, "should return itself")

			visitor.options.debug.should.equal(true, "A second #debug call should leave debugging enabled");
		});

		it("should toggle debugging when invoked with a boolean arguments", function () {
			var visitor = ua().debug(true)

			visitor.options.debug.should.equal(true);

			visitor.debug(false).should.equal(visitor, "should return itself")

			visitor.options.debug.should.equal(false);
		});

	});



	describe("#pageview", function () {
		var _enqueue;

		beforeEach(function () {
			_enqueue = sinon.stub(ua.Visitor.prototype, "_enqueue", function () {
				if (arguments.length === 3 && typeof arguments[2] === 'function') {
					arguments[2]();
				}
				return this;
			});
		});

		afterEach(function () {
			_enqueue.restore()
		});

		it("should accept arguments (path)", function () {
			var path = "/" + Math.random()

			var visitor = ua("UA-XXXXX-XX")

			var result = visitor.pageview(path)

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			result._context.should.eql(_enqueue.args[0][1], "the pageview params should be persisted as the context of the visitor clone")

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("pageview");
			_enqueue.args[0][1].should.have.keys(["dp"]);
			_enqueue.args[0][1].dp.should.equal(path);
		});

		it("should accept arguments (params)", function () {
			var params = {
				dp: "/" + Math.random()
			};

			var visitor = ua("UA-XXXXX-XX")

			var result = visitor.pageview(params)

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			result._context.should.eql(_enqueue.args[0][1], "the pageview params should be persisted as the context of the visitor clone")

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("pageview");
			_enqueue.args[0][1].should.have.keys(["dp"]);
			_enqueue.args[0][1].dp.should.equal(params.dp);
		});

		it("should accept arguments (path, params)", function () {
			var title = Math.random().toString();

			ua("UA-XXXXX-XX").pageview("/", {
				dt: title
			})

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("pageview");
			_enqueue.args[0][1].should.have.keys(["dp", "dt"]);
			_enqueue.args[0][1].dt.should.equal(title);
		});

		it("should accept arguments (path, fn)", function () {
			var path = "/" + Math.random()
			var fn = sinon.spy()

			ua("UA-XXXXX-XX").pageview(path, fn)

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("pageview");
			_enqueue.args[0][1].should.have.keys(["dp"]);
			_enqueue.args[0][1].dp.should.equal(path);

			fn.calledOnce.should.equal(true, "callback should have been called once");
		});

		it("should accept arguments (params, fn)", function () {
			var params = {
				dp: "/" + Math.random()
			};
			var fn = sinon.spy()

			ua("UA-XXXXX-XX").pageview(params, fn)

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("pageview");
			_enqueue.args[0][1].should.have.keys(["dp"]);
			_enqueue.args[0][1].dp.should.equal(params.dp);

			fn.calledOnce.should.equal(true, "callback should have been called once");
		});

		it("should accept arguments (path, params, fn)", function () {
			var path = "/" + Math.random()
			var fn = sinon.spy();
			var title = Math.random().toString();

			ua("UA-XXXXX-XX").pageview(path, {
				dt: title
			}, fn)

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("pageview");
			_enqueue.args[0][1].should.have.keys(["dp", "dt"]);
			_enqueue.args[0][1].dp.should.equal(path);
			_enqueue.args[0][1].dt.should.equal(title);

			fn.calledOnce.should.equal(true, "callback should have been called once");
		});


		it("should allow daisy-chaining and re-using parameters", function () {
			var path = "/" + Math.random()
			var title = Math.random().toString();

			ua("UA-XXXXX-XX").pageview(path, {
				dt: title
			}).pageview()

			_enqueue.calledTwice.should.equal(true, "#_enqueue should have been called twice, once for each pageview");

			_enqueue.args[0][0].should.equal(_enqueue.args[1][0]);
			_enqueue.args[0][1].should.eql(_enqueue.args[1][1]);
		})


		it("should extend and overwrite params when daisy-chaining", function () {
			var path = "/" + Math.random()
			var path2 = "/" + Math.random()
			var title = Math.random().toString();
			var title2 = Math.random().toString();
			var foo = Math.random()

			ua("UA-XXXXX-XX").pageview(path, {
				dt: title
			}).pageview({
				dt: title2,
				dp: path2,
				foo: foo
			}).pageview(path)

			_enqueue.calledThrice.should.equal(true, "#_enqueue should have been called three times, once for each pageview");

			_enqueue.args[0][1].should.have.keys(["dp", "dt"]);
			_enqueue.args[0][1].dp.should.equal(path);
			_enqueue.args[0][1].dt.should.equal(title);

			_enqueue.args[1][1].should.have.keys(["dp", "dt", "foo"]);
			_enqueue.args[1][1].dp.should.equal(path2);
			_enqueue.args[1][1].dt.should.equal(title2);
			_enqueue.args[1][1].foo.should.equal(foo);

			_enqueue.args[2][1].should.have.keys(["dp", "dt", "foo"]);
			_enqueue.args[2][1].dp.should.equal(path);
			_enqueue.args[2][1].dt.should.equal(title2);
			_enqueue.args[2][1].foo.should.equal(foo);
		})

		it("should fail without page path", function () {
			var fn = sinon.spy()
			var visitor = ua()

			var result = visitor.pageview(null, fn);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			should.not.exist(result._context, "the transaction params should not be persisted")

			_enqueue.called.should.equal(false, "#_enqueue should have not been called once");
			fn.calledOnce.should.equal(true, "callback should have been called once");
			fn.args[0][0].should.be.instanceof(Error);
			fn.thisValues[0].should.equal(visitor);
		});

	});



	describe("#event", function () {
		var _enqueue;

		beforeEach(function () {
			_enqueue = sinon.stub(ua.Visitor.prototype, "_enqueue", function () {
				if (arguments.length === 3 && typeof arguments[2] === 'function') {
					arguments[2]();
				}
				return this;
			});
		});

		afterEach(function () {
			_enqueue.restore()
		});

		it("should accept arguments (category, action)", function () {
			var category = Math.random().toString();
			var action = Math.random().toString();

			var visitor = ua()

			var result = visitor.event(category, action);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			result._context.should.eql(_enqueue.args[0][1], "the pageview params should be persisted as the context of the visitor clone")

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("event");
			_enqueue.args[0][1].should.have.keys(["ec", "ea"]);
			_enqueue.args[0][1].ec.should.equal(category);
			_enqueue.args[0][1].ea.should.equal(action);
		});

		it("should accept arguments (category, action, fn)", function () {
			var category = Math.random().toString();
			var action = Math.random().toString();
			var fn = sinon.spy()

			ua().event(category, action, fn);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("event");
			_enqueue.args[0][1].should.have.keys(["ec", "ea"]);
			_enqueue.args[0][1].ec.should.equal(category);
			_enqueue.args[0][1].ea.should.equal(action);

			fn.calledOnce.should.equal(true, "callback should have been called once")
		});

		it("should accept arguments (category, action, label)", function () {
			var category = Math.random().toString();
			var action = Math.random().toString();
			var label = Math.random().toString();

			ua().event(category, action, label);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("event");
			_enqueue.args[0][1].should.have.keys(["ec", "ea", "el"]);
			_enqueue.args[0][1].ec.should.equal(category);
			_enqueue.args[0][1].ea.should.equal(action);
			_enqueue.args[0][1].el.should.equal(label);
		});

		it("should accept arguments (category, action, label, fn)", function () {
			var category = Math.random().toString();
			var action = Math.random().toString();
			var label = Math.random().toString();
			var fn = sinon.spy()

			ua().event(category, action, label, fn);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("event");
			_enqueue.args[0][1].should.have.keys(["ec", "ea", "el"]);
			_enqueue.args[0][1].ec.should.equal(category);
			_enqueue.args[0][1].ea.should.equal(action);
			_enqueue.args[0][1].el.should.equal(label);

			fn.calledOnce.should.equal(true, "callback should have been called once")
		});

		it("should accept arguments (category, action, label, value)", function () {
			var category = Math.random().toString();
			var action = Math.random().toString();
			var label = Math.random().toString();
			var value = Math.random();

			ua().event(category, action, label, value);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("event");
			_enqueue.args[0][1].should.have.keys(["ec", "ea", "el", "ev"]);
			_enqueue.args[0][1].ec.should.equal(category);
			_enqueue.args[0][1].ea.should.equal(action);
			_enqueue.args[0][1].el.should.equal(label);
			_enqueue.args[0][1].ev.should.equal(value);
		});

		it("should accept arguments (category, action, label, value, fn)", function () {
			var category = Math.random().toString();
			var action = Math.random().toString();
			var label = Math.random().toString();
			var value = Math.random();
			var fn = sinon.spy()

			ua().event(category, action, label, value, fn);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("event");
			_enqueue.args[0][1].should.have.keys(["ec", "ea", "el", "ev"]);
			_enqueue.args[0][1].ec.should.equal(category);
			_enqueue.args[0][1].ea.should.equal(action);
			_enqueue.args[0][1].el.should.equal(label);
			_enqueue.args[0][1].ev.should.equal(value);

			fn.calledOnce.should.equal(true, "callback should have been called once")
		});

		it("should accept arguments (category, action, label, value, params, fn)", function () {
			var category = Math.random().toString();
			var action = Math.random().toString();
			var label = Math.random().toString();
			var value = Math.random();
			var params = {"p": "/" + Math.random()}
			var fn = sinon.spy()

			ua().event(category, action, label, value, params, fn);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("event");
			_enqueue.args[0][1].should.have.keys(["ec", "ea", "el", "ev", "p"]);
			_enqueue.args[0][1].ec.should.equal(category);
			_enqueue.args[0][1].ea.should.equal(action);
			_enqueue.args[0][1].el.should.equal(label);
			_enqueue.args[0][1].ev.should.equal(value);
			_enqueue.args[0][1].p.should.equal(params.p);

			fn.calledOnce.should.equal(true, "callback should have been called once")
		});

		it("should accept arguments (params)", function () {
			var params = {
				ec: Math.random().toString(),
				ea: Math.random().toString(),
				el: Math.random().toString(),
				ev: Math.random(),
				"p": "/" + Math.random(),
				"empty": null
			}
			var json = JSON.stringify(params)

			ua().event(params);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("event");
			_enqueue.args[0][1].should.have.keys(["ec", "ea", "el", "ev", "p"]);
			_enqueue.args[0][1].ec.should.equal(params.ec);
			_enqueue.args[0][1].ea.should.equal(params.ea);
			_enqueue.args[0][1].el.should.equal(params.el);
			_enqueue.args[0][1].ev.should.equal(params.ev);
			_enqueue.args[0][1].p.should.equal(params.p);

			JSON.stringify(params).should.equal(json, "params should not have been modified")
		});

		it("should accept arguments (params, fn)", function () {
			var params = {
				ec: Math.random().toString(),
				ea: Math.random().toString(),
				el: Math.random().toString(),
				ev: Math.random(),
				"p": "/" + Math.random()
			}
			var fn = sinon.spy()

			ua().event(params, fn);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("event");
			_enqueue.args[0][1].should.have.keys(["ec", "ea", "el", "ev", "p"]);
			_enqueue.args[0][1].ec.should.equal(params.ec);
			_enqueue.args[0][1].ea.should.equal(params.ea);
			_enqueue.args[0][1].el.should.equal(params.el);
			_enqueue.args[0][1].ev.should.equal(params.ev);
			_enqueue.args[0][1].p.should.equal(params.p);

			fn.calledOnce.should.equal(true, "callback should have been called once")
		});


		it("should allow daisy-chaining and re-using parameters", function () {
			var params = {
				ec: Math.random().toString(),
				ea: Math.random().toString(),
				el: Math.random().toString(),
				ev: Math.random()
			}

			ua().event(params).event()

			_enqueue.calledTwice.should.equal(true, "#_enqueue should have been called twice, once for each event");
			_enqueue.args[0][0].should.equal(_enqueue.args[1][0]);
			_enqueue.args[0][1].ec.should.equal(_enqueue.args[1][1].ec);
			_enqueue.args[0][1].ea.should.equal(_enqueue.args[1][1].ea);
			_enqueue.args[0][1].el.should.equal(_enqueue.args[1][1].el);
			_enqueue.args[0][1].ev.should.equal(_enqueue.args[1][1].ev);
		});


		it("should extend and overwrite params when daisy-chaining", function () {
			var params = {
				ec: Math.random().toString(),
				ea: Math.random().toString(),
				el: Math.random().toString(),
				ev: Math.random()
			}
			var category = Math.random().toString();

			ua().event(params).event(category)

			_enqueue.calledTwice.should.equal(true, "#_enqueue should have been called twice, once for each event");
			_enqueue.args[0][0].should.equal(_enqueue.args[1][0]);
			_enqueue.args[0][1].ea.should.equal(_enqueue.args[1][1].ea);
			_enqueue.args[0][1].el.should.equal(_enqueue.args[1][1].el);
			_enqueue.args[0][1].ev.should.equal(_enqueue.args[1][1].ev);

			_enqueue.args[0][1].ec.should.equal(params.ec);
			_enqueue.args[1][1].ec.should.equal(category);
		});

		it("should re-use the path when daisy-chained to a pageview", function () {
			var path = "/" + Math.random()
			var params = {
				ec: Math.random().toString(),
				ea: Math.random().toString(),
				el: Math.random().toString(),
				ev: Math.random()
			}

			ua().pageview(path).event(params).event(params);

			_enqueue.calledThrice.should.equal(true, "#_enqueue should have been called twice, once for the pageview, once for the pageview");

			_enqueue.args[1][1].p.should.equal(path)
			_enqueue.args[2][1].p.should.equal(path)
		})

		it("should fail without event category", function () {
			var fn = sinon.spy()
			var action = Math.random().toString();
			var visitor = ua()

			var result = visitor.event(null, action, fn);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			should.not.exist(result._context, "the transaction params should not be persisted")

			_enqueue.called.should.equal(false, "#_enqueue should have not been called once");
			fn.calledOnce.should.equal(true, "callback should have been called once");
			fn.args[0][0].should.be.instanceof(Error);
			fn.thisValues[0].should.equal(visitor);
		});

		it("should fail without event action", function () {
			var fn = sinon.spy()
			var category = Math.random().toString();
			var visitor = ua()

			var result = visitor.event(category, null, fn);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			should.not.exist(result._context, "the transaction params should not be persisted")

			_enqueue.called.should.equal(false, "#_enqueue should have not been called once");
			fn.calledOnce.should.equal(true, "callback should have been called once");
			fn.args[0][0].should.be.instanceof(Error);
			fn.thisValues[0].should.equal(visitor);
		});
	});



	describe("#transaction", function () {
		var _enqueue;

		beforeEach(function () {
			_enqueue = sinon.stub(ua.Visitor.prototype, "_enqueue", function (type, params, fn) {
				if (fn) {
					(typeof fn).should.equal('function', "#_enqueue should receive a callback")
					fn();
				}
				return this;
			});
		});

		afterEach(function () {
			_enqueue.restore()
		});


		it("should accept arguments (transaction)", function () {
			var transaction = Math.random().toString();

			var visitor = ua()

			var result = visitor.transaction(transaction);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			result._context.should.eql(_enqueue.args[0][1], "the transaction params should be persisted as the context of the visitor clone")

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("transaction");
			_enqueue.args[0][1].should.have.keys(["ti"]);
			_enqueue.args[0][1].ti.should.equal(transaction);
		});


		it("should accept arguments (transaction, fn)", function () {
			var transaction = Math.random().toString();
			var fn = sinon.spy()

			ua().transaction(transaction, fn);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("transaction");
			_enqueue.args[0][1].should.have.keys(["ti"]);
			_enqueue.args[0][1].ti.should.equal(transaction);

			fn.calledOnce.should.equal(true, "callback should have been called once")
		});


		it("should accept arguments (transaction, revenue)", function () {
			var transaction = Math.random().toString();
			var revenue = Math.random();

			ua().transaction(transaction, revenue);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("transaction");
			_enqueue.args[0][1].should.have.keys(["ti", "tr"]);
			_enqueue.args[0][1].ti.should.equal(transaction);
			_enqueue.args[0][1].tr.should.equal(revenue);
		});


		it("should accept arguments (transaction, revenue, fn)", function () {
			var transaction = Math.random().toString();
			var revenue = Math.random();
			var fn = sinon.spy()

			ua().transaction(transaction, revenue, fn);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("transaction");
			_enqueue.args[0][1].should.have.keys(["ti", "tr"]);
			_enqueue.args[0][1].ti.should.equal(transaction);
			_enqueue.args[0][1].tr.should.equal(revenue);

			fn.calledOnce.should.equal(true, "callback should have been called once")
		});


		it("should accept arguments (transaction, revenue, shipping)", function () {
			var transaction = Math.random().toString();
			var revenue = Math.random();
			var shipping = Math.random();

			ua().transaction(transaction, revenue, shipping);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("transaction");
			_enqueue.args[0][1].should.have.keys(["ti", "tr", "ts"]);
			_enqueue.args[0][1].ti.should.equal(transaction);
			_enqueue.args[0][1].tr.should.equal(revenue);
			_enqueue.args[0][1].ts.should.equal(shipping);
		});


		it("should accept arguments (transaction, revenue, shipping, fn)", function () {
			var transaction = Math.random().toString();
			var revenue = Math.random();
			var shipping = Math.random();
			var fn = sinon.spy()

			ua().transaction(transaction, revenue, shipping, fn);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("transaction");
			_enqueue.args[0][1].should.have.keys(["ti", "tr", "ts"]);
			_enqueue.args[0][1].ti.should.equal(transaction);
			_enqueue.args[0][1].tr.should.equal(revenue);
			_enqueue.args[0][1].ts.should.equal(shipping);

			fn.calledOnce.should.equal(true, "callback should have been called once")
		});


		it("should accept arguments (transaction, revenue, shipping, tax)", function () {
			var transaction = Math.random().toString();
			var revenue = Math.random();
			var shipping = Math.random();
			var tax = Math.random();

			ua().transaction(transaction, revenue, shipping, tax);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("transaction");
			_enqueue.args[0][1].should.have.keys(["ti", "tr", "ts", "tt"]);
			_enqueue.args[0][1].ti.should.equal(transaction);
			_enqueue.args[0][1].tr.should.equal(revenue);
			_enqueue.args[0][1].ts.should.equal(shipping);
			_enqueue.args[0][1].tt.should.equal(tax);
		});


		it("should accept arguments (transaction, revenue, shipping, tax, fn)", function () {
			var transaction = Math.random().toString();
			var revenue = Math.random();
			var shipping = Math.random();
			var tax = Math.random();
			var fn = sinon.spy()

			ua().transaction(transaction, revenue, shipping, tax, fn);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("transaction");
			_enqueue.args[0][1].should.have.keys(["ti", "tr", "ts", "tt"]);
			_enqueue.args[0][1].ti.should.equal(transaction);
			_enqueue.args[0][1].tr.should.equal(revenue);
			_enqueue.args[0][1].ts.should.equal(shipping);
			_enqueue.args[0][1].tt.should.equal(tax);

			fn.calledOnce.should.equal(true, "callback should have been called once")
		});


		it("should accept arguments (transaction, revenue, shipping, tax, affiliation)", function () {
			var transaction = Math.random().toString();
			var revenue = Math.random();
			var shipping = Math.random();
			var tax = Math.random();
			var affiliation = Math.random().toString();

			ua().transaction(transaction, revenue, shipping, tax, affiliation);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("transaction");
			_enqueue.args[0][1].should.have.keys(["ti", "tr", "ts", "tt", "ta"]);
			_enqueue.args[0][1].ti.should.equal(transaction);
			_enqueue.args[0][1].tr.should.equal(revenue);
			_enqueue.args[0][1].ts.should.equal(shipping);
			_enqueue.args[0][1].tt.should.equal(tax);
			_enqueue.args[0][1].ta.should.equal(affiliation);
		});


		it("should accept arguments (transaction, revenue, shipping, tax, affiliation, fn)", function () {
			var transaction = Math.random().toString();
			var revenue = Math.random();
			var shipping = Math.random();
			var tax = Math.random();
			var affiliation = Math.random().toString();
			var fn = sinon.spy()

			ua().transaction(transaction, revenue, shipping, tax, affiliation, fn);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("transaction");
			_enqueue.args[0][1].should.have.keys(["ti", "tr", "ts", "tt", "ta"]);
			_enqueue.args[0][1].ti.should.equal(transaction);
			_enqueue.args[0][1].tr.should.equal(revenue);
			_enqueue.args[0][1].ts.should.equal(shipping);
			_enqueue.args[0][1].tt.should.equal(tax);
			_enqueue.args[0][1].ta.should.equal(affiliation);

			fn.calledOnce.should.equal(true, "callback should have been called once")
		});


		it("should accept arguments (transaction, revenue, shipping, tax, affiliation, params)", function () {
			var transaction = Math.random().toString();
			var revenue = Math.random();
			var shipping = Math.random();
			var tax = Math.random();
			var affiliation = Math.random().toString();
			var params = {p: Math.random().toString()}

			ua().transaction(transaction, revenue, shipping, tax, affiliation, params);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("transaction");
			_enqueue.args[0][1].should.have.keys(["ti", "tr", "ts", "tt", "ta", "p"]);
			_enqueue.args[0][1].ti.should.equal(transaction);
			_enqueue.args[0][1].tr.should.equal(revenue);
			_enqueue.args[0][1].ts.should.equal(shipping);
			_enqueue.args[0][1].tt.should.equal(tax);
			_enqueue.args[0][1].ta.should.equal(affiliation);
			_enqueue.args[0][1].p.should.equal(params.p);
		});


		it("should accept arguments (transaction, revenue, shipping, tax, affiliation, params, fn)", function () {
			var transaction = Math.random().toString();
			var revenue = Math.random();
			var shipping = Math.random();
			var tax = Math.random();
			var affiliation = Math.random().toString();
			var params = {p: Math.random().toString()}
			var fn = sinon.spy()

			ua().transaction(transaction, revenue, shipping, tax, affiliation, params, fn);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("transaction");
			_enqueue.args[0][1].should.have.keys(["ti", "tr", "ts", "tt", "ta", "p"]);
			_enqueue.args[0][1].ti.should.equal(transaction);
			_enqueue.args[0][1].tr.should.equal(revenue);
			_enqueue.args[0][1].ts.should.equal(shipping);
			_enqueue.args[0][1].tt.should.equal(tax);
			_enqueue.args[0][1].ta.should.equal(affiliation);
			_enqueue.args[0][1].p.should.equal(params.p);

			fn.calledOnce.should.equal(true, "callback should have been called once")
		});


		it("should accept arguments (params)", function () {
			var params = {
				ti: Math.random().toString(),
				tr: Math.random(),
				ts: Math.random(),
				tt: Math.random(),
				ta: Math.random().toString(),
				p: Math.random().toString()
			};

			var visitor = ua()

			var result = visitor.transaction(params);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			result._context.should.eql(_enqueue.args[0][1], "the transaction params should be persisted as the context of the visitor clone")

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("transaction");
			_enqueue.args[0][1].should.have.keys(["ti", "tr", "ts", "tt", "ta", "p"]);
			_enqueue.args[0][1].ti.should.equal(params.ti);
			_enqueue.args[0][1].tr.should.equal(params.tr);
			_enqueue.args[0][1].ts.should.equal(params.ts);
			_enqueue.args[0][1].tt.should.equal(params.tt);
			_enqueue.args[0][1].ta.should.equal(params.ta);
			_enqueue.args[0][1].p.should.equal(params.p);
		});


		it("should accept arguments (params, fn)", function () {
			var params = {
				ti: Math.random().toString(),
				tr: Math.random(),
				ts: Math.random(),
				tt: Math.random(),
				ta: Math.random().toString(),
				p: Math.random().toString()
			};
			var fn = sinon.spy()

			var visitor = ua()

			var result = visitor.transaction(params, fn);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			result._context.should.eql(_enqueue.args[0][1], "the transaction params should be persisted as the context of the visitor clone")

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("transaction");
			_enqueue.args[0][1].should.have.keys(["ti", "tr", "ts", "tt", "ta", "p"]);
			_enqueue.args[0][1].ti.should.equal(params.ti);
			_enqueue.args[0][1].tr.should.equal(params.tr);
			_enqueue.args[0][1].ts.should.equal(params.ts);
			_enqueue.args[0][1].tt.should.equal(params.tt);
			_enqueue.args[0][1].ta.should.equal(params.ta);
			_enqueue.args[0][1].p.should.equal(params.p);

			fn.calledOnce.should.equal(true, "callback should have been called once")
		});

		it("should fail without transaction ID", function () {
			var fn = sinon.spy()
			var visitor = ua()

			var result = visitor.transaction(null, fn);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			should.not.exist(result._context, "the transaction params should not be persisted")

			_enqueue.called.should.equal(false, "#_enqueue should have not been called once");
			fn.calledOnce.should.equal(true, "callback should have been called once");
			fn.args[0][0].should.be.instanceof(Error);
			fn.thisValues[0].should.equal(visitor);
		});

	});

	describe("#_enqueue", function () {

		var send;

		beforeEach(function () {
			send = sinon.stub(ua.Visitor.prototype, "send").callsArg(0);
		});

		afterEach(function () {
			send.restore()
		});

		it("should accept arguments (type)", function () {
			var tid = "UA-XXXXX-XX";
			var cid = uuid.v4();
			var type = Math.random().toString()

			var visitor = ua(tid, cid)._enqueue(type);

			send.called.should.equal(false, "#send should not have been called without a callback");

			visitor._queue.length.should.equal(1, "1 tracking call should have been enqueued");

			visitor._queue[0].should.have.keys(["v", "tid", "cid", "t"]);
			visitor._queue[0].tid.should.equal(tid)
			visitor._queue[0].cid.should.equal(cid)
			visitor._queue[0].t.should.equal(type)
		});

		it("should accept arguments (type, fn)", function () {
			var tid = "UA-XXXXX-XX";
			var cid = uuid.v4();
			var type = Math.random().toString()
			var fn = sinon.spy()

			var visitor = ua(tid, cid)._enqueue(type, fn);

			send.calledOnce.should.equal(true, "#send should have been called once");

			visitor._queue.length.should.equal(1, "1 tracking call should have been enqueued");

			visitor._queue[0].should.have.keys(["v", "tid", "cid", "t"]);
			visitor._queue[0].tid.should.equal(tid)
			visitor._queue[0].cid.should.equal(cid)
			visitor._queue[0].t.should.equal(type)

			fn.calledOnce.should.equal(true, "callback should have been called once")
		});

		it("should accept arguments (type, params)", function () {
			var tid = "UA-XXXXX-XX";
			var cid = uuid.v4();
			var type = Math.random().toString()
			var params = {foo: Math.random().toString()}

			var visitor = ua(tid, cid)._enqueue(type, params);

			send.called.should.equal(false, "#send should not have been called without a callback");

			visitor._queue.length.should.equal(1, "1 tracking call should have been enqueued");

			visitor._queue[0].should.have.keys(["v", "tid", "cid", "t", "foo"]);
			visitor._queue[0].tid.should.equal(tid)
			visitor._queue[0].cid.should.equal(cid)
			visitor._queue[0].foo.should.equal(params.foo);
		});

		it("should accept arguments (type, params, fn)", function () {
			var tid = "UA-XXXXX-XX";
			var cid = uuid.v4();
			var type = Math.random().toString()
			var params = {foo: Math.random().toString()}
			var fn = sinon.spy()

			var visitor = ua(tid, cid)._enqueue(type, params, fn);

			send.calledOnce.should.equal(true, "#send should have been called once");

			visitor._queue.length.should.equal(1, "1 tracking call should have been enqueued");

			visitor._queue[0].should.have.keys(["v", "tid", "cid", "t", "foo"]);
			visitor._queue[0].tid.should.equal(tid)
			visitor._queue[0].cid.should.equal(cid)
			visitor._queue[0].foo.should.equal(params.foo);

			fn.calledOnce.should.equal(true, "callback should have been called once")
		});

		it("should continue adding to the queue", function () {
			var tid = "UA-XXXXX-XX";
			var cid = uuid.v4();
			var type = Math.random().toString()

			var visitor = ua(tid, cid)

			visitor._enqueue(type);
			visitor._enqueue(type);
			visitor._enqueue(type);
			visitor._enqueue(type);

			visitor._queue.length.should.equal(4, "4 tracking calls should have been enqueued");
		})

	});

	describe("#send", function () {
		var post;

		beforeEach(function () {
			post = sinon.stub(request, "post").callsArg(1);
		});

		afterEach(function () {
			post.restore()
		});

		it("should immidiately return with an empty queue", function () {
			var visitor = ua();
			var fn = sinon.spy();

			visitor.send(fn);

			post.called.should.equal(false, "no request should have been sent")
			fn.calledOnce.should.equal(true, "callback should have been called once")
			fn.thisValues[0].should.equal(visitor, "callback should be called in the context of the visitor instance");
		});

		it("should stringify and POST each params object in the queue in order", function (done) {
			var paramSets = [
				{first: Math.random()},
				{second: Math.random()},
				{third: Math.random()}
			]

			var fn = sinon.spy(function () {
				fn.calledOnce.should.equal(true, "callback should have been called once")
				fn.thisValues[0].should.equal(visitor, "callback should be called in the context of the visitor instance");

				post.callCount.should.equal(paramSets.length, "each param set should have been POSTed");

				for (var i = 0; i < paramSets.length; i++) {
					var params = paramSets[i];
					var args = post.args[i];

					var parsedUrl = url.parse(args[0])

					Math.random(); // I have absolutely no idea why it fails unless there was some processing to be done after url.parse…

					(parsedUrl.protocol + "//" + parsedUrl.host).should.equal(config.hostname);
					parsedUrl.query.should.equal(qs.stringify(params));
				}

				done()
			});

			var visitor = ua();
			visitor._queue.push.apply(visitor._queue, paramSets)
			visitor.send(fn);
		})

	})

});










