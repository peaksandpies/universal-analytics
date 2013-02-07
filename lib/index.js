
var _ = require("underscore");
var qs = require("querystring");
var request = require("request");
var uuid = require("node-uuid");

var config = require("./config");


module.exports = init;


var Visitor = function (tid, cid, options) {
	if (typeof tid !== 'string') {
		options = tid;
		tid = cid = null;
	}

	if (typeof cid !== 'string') {
		options = cid;
		cid = null;
	}
	this.options = options || {};

	this.tid = tid || this.options.tid;
	this.cid = cid || this.options.cid || uuid.v4();
}

Visitor.prototype = {

	debug: function (debug) {
		this.debug = arguments.length === 0 ? true : debug;
		this._log("Logging enabled")
		return this;
	},


	_log: function (message) {
		this.debug && console.log("UA " + message);
	},


	pageview: function (path, params, fn) {
		if (typeof params === 'function') {
			fn = params;
			params = {};
		}
		params = params || {}
		fn = fn || function () {};

		_.extend(params, {
			dp: path
		});

		params.dt = params.dt || this.options.dt;

		this.track("pageview", params, fn);

		return this;
	},


	event: function (category, action, label, value, fn) {
		if (typeof label === 'function') {
			fn = label;
			label = value = null;
		}
		if (typeof value === 'function') {
			fn = value;
			value = 0;
		}

		this.track("event", {
			ec: category,
			ea: action,
			el: label,
			ev: value
		}, fn);

		return this;
	}


	track: function (type, params, fn) {
		fn = fn || function () {};
		params = params || {};

		_.extend(params, {
			v: "1",
			tid: this.tid,
			cid: this.cid,
			t: type
		});
		this._log(type + " (" + JSON.stringify(params) + ")");

		var path = config.endpoint.hostname + config.endpoint.path + "?" + qs.stringify(params);

		request.post(path, fn);
	}


}


function init (tid, cid, options) {
	return new Visitor(tid, cid, options);
}
















