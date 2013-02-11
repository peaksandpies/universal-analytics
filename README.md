universal-analytics
=======

A node module for Google's [Universal Analytics](http://support.google.com/analytics/bin/answer.py?hl=en&hlrm=de&answer=2790010) tracking via the [Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/v1/).

The new Measurement Protocol allows for tracking to be sent to Google Analytics from anywhere. Not just the browser or a mobile app using the SDK. Any script or program that can send of HTTP requests can track data using Google Analytics. This offers much better opportunities to track a wide variety of data that does not happen while the users interacts with the website or the app. Examples include e-commerce companies that want to track return shipments to improve their existing e-commerce data in Google Analytics. Or a tracking user interaction in an environment where existing Google Analytics does not work for technical reasons.

`universal-analytics` currently supports the following tracking features:

* Pageviews
* Events
* E-Commerce with transactions and items

## Getting started

universal-analytics is installed and included like any other module:

```
npm install universal-analytics
```

```javascript
var ua = require('universal-analytics');
```

Initialization expects at least your Google Analytics account ID:

```javascript
var visitor = ua('UA-XXXX-XX');
```

This will create a universal-analytics Visitor instance that you can use and keep around to track a specific user. Since no user UUID was specified in the constructor's arguments, a random UUID is generated. In case you have a user UUID at hand, you can use that to create the visitor:

```javascript
var visitor = ua('UA-XXXX-XX', '6a14abda-6b12-4578-bf66-43c754eaeda9');
```

Starting with Universal Analytics, a UUID v4 is the preferred user ID format. It is therefor necessary to provide a UUID of such type.

Tracking a pageview without much else is very simple:

```javascript
var visitor = ua('UA-XXXX-XX');
visitor.pageview("/").send()
```

The first argument for the pageview method is the path of the page to be tracked. Simply calling #pageview will not initiate any tracking request. In order to send off tracking to the Google Analytics servers you have two options:

1. As seen above, append a #send call to after the call to #pageview. Since the tracking request is sent asynchronously, you will not receive any confirmation when and if it was successful. In most cases that shouldn't matter.
2. Alternatively, you can provide a callback function to #pageview as a second argument. This callback will be invoked once the tracking request has finished. Any error that occured during the request will be provided to said callback.

Here's an example of the callback usage:

```javascript
var visitor = ua('UA-XXXX-XX');
visitor.pageview("/", function (err) {
  // Handle the error if necessary.
  // In case no error is provided you can be sure
  // the request was successfully sent off to Google.
});
```


## Pageview tracking

As we have seen above, the first argument for the pageview tracking call is the page path. Pageview tracking can be improved with a few additional parameters:

```javascript
visitor.pageview("/", {dh: "http://joergtillmann.com", dt: "Welcome"}).send();
```

The parameters `dh` and `dt` are accepted by Google's Measurement Protocol to provide a hostname (`dh`) and a page title (`dt`) associated with the page you are tracking.

Depending on how you integrate tracking into your app, you might be more comfortable with providing all the tracking data via a params object to the #pageview method:

```javascript
visitor.pageview({dp: "/", dh: "http://joergtillmann.com", dt: "Welcome"}).send();
```

This code has the exact same effect as the one above. `dp` is the name of the page path parameter used by the Measurement Protocol. When the path is provided as the first argument to #pageview like in the first example, all `universal-analytics` does is add it to the params object with the name `dp` like the second example did.

The page path (or `dp`) is actually mandatory. Google Analytics can not track a pageview without a path. To avoid such erronous request, `universal-analytics` will actually deny any #pageview tracking if you forgot to add a path or left it blank.

```javascript
var pagePath = null;

visitor.pageview(pagePath, function (err) {
  // This callback will receive an error
});
```

The following method signatures are available for #pageview:

* `Visitor#pageview(path)
* `Visitor#pageview(path, callback)
* `Visitor#pageview(params)
* `Visitor#pageview(params, callback)
* `Visitor#pageview(path, params)
* `Visitor#pageview(path, params, callback)


## Event tracking


Tracking events with `universal-analytics` works just like pageview tracking, you just have to provide different arguments:

```javascript
visitor.event("Event Category", "Event Action").send()
```

This is the most straight-forward way to track an event. The additional label and value for the event are optional and can be provided if necessary:

```javascript
visitor.event("Event Category", "Event Action", "…and a label", 42).send()
```

Just like pageview tracking, event tracking supports a callback as the last argument to be notified when the tracking is finished and if it was successful:

```javascript
visitor.event("Event Category", "Event Action", "…and a label", 42, function (err) {
  // …
})
```

An additional information for events is the path of the page they happened on and should be associated with in Google Analytics. You can provide this path via an additional params object, similar to the pageview tracking above:

```javascript
visitor.event("Event Category", "Event Action", "…and a label", 42, {p: "/contact"}, function (err) {
  // …
})
```

Notice: The page path attribute for the event is called `p` which differs from the `dp` attribute used in the pageview tracking example. This is a choice Google made with the Measurment Protocol. Be careful to use the correct attribute.

In case this argument list is getting a little long, #event also accepts a params object like #pageview:

```javascript
var eventParams = {
  ec: "Event Category",
  ea: "Event Action",
  el: "…and a label",
  ev: 42,
  d: "/contact"
}

visitor.event(eventParams).send();
```

The following method signatures are available for #event:

* `Visitor#event(category, action)`
* `Visitor#event(category, action, callback)`
* `Visitor#event(category, action, label)`
* `Visitor#event(category, action, label, callback)`
* `Visitor#event(category, action, label, value)`
* `Visitor#event(category, action, label, value, callback)`
* `Visitor#event(category, action, label, value, params, callback)`
* `Visitor#event(params)`
* `Visitor#event(params, callback)`



### Daisy-chaining tracking calls

We have seen basic daisy-chaining above when calling #send right after a #pageview or a #event call:

```javascript
visitor.pageview("/").send()
```

Every call of a tracking method returns a visitor instance you can instantly re-use.

```javascript
visitor.pageview("/").pageview("/contact").send()
```

Granted, the change of this example actually happening in practice might be rather low. However, `universal-analytics` is smart when it comes to daisy-chaining certain calls. In many cases, a #pageview call is instantly followed by an #event call to track some additional information about the current page. `universal-analytics` makes creating the connection between the two easy:

```javascript
visitor.pageview("/").event("Testing", "Button color", "Blue").send()
```

Daisy-chaining is context-aware and in this case placing the #event call right after the #pageview call results in the event being associated with the page path tracking in the #pageview call. (Even thought the attributes, `dp` and `p` are actually different internally.)

It also works when using a callback since the `this` context inside the callback will be the `universal-analytics` instance:

```javascript
visitor.pageview("/", function (err) {
  if (!err) {
    // Only initiate the associated event if the pageview succeeded
    this.event("Testing", "Button color", "Blue").send()
  }
});
```

More generally, the context keeps all parameters from the previous call around. This means in a situation where a few similar tracking calls are necessary, the tracking is simplified:

visitor.event({ec: "Mail Server", ea: "Invitation sent"}).event({ea: "New Team Member Notification sent"}).send();

In this example the event category ("Mail Server") is not repeated in the second tracking call. It is re-used from the first one.


### E-commerce tracking

E-commerce tracking in general is a bit more complex as it requires more than one tracking call. It is a combination of one call to the #transaction method and one or more calls to the #item method.

```javascript
visitor.transaction("trans-12345", 500)   // Create transaction trans-12345 worth 500 total.
  .item(300, 1, "item-54321")        // Add 1 unit the item item-54321 worth 300.
  .item(200, 2, "item-41325")        // Add 2 units the item item-41325 worth 200.
  .send()
```

Once again, daisy-chaining simplifies associating the items with the transaction. Officially, nothing but the transaction ID is a requirement for both the transaction and the items. However, providing a minimum set of information (revenue for the transaction, price, quantity and ID for the items) is recommended.

It is also possible to provide the params as an object to both methods:

```javascript
visitor.transaction({ti: "trans-12345", tr: 500, ts: 50, tt: 100, ta: "Partner 13"})
  .item({ip: 300, iq: 1, ic: "item-54321", in: "Item 54321", iv: "Blue"})
  .item({ip: 200, iq: 2, ic: "item-41325", in: "Item 41325", iv: "XXL"})
  .send()
```

In case an additional item has to be added later one or daisy-chaining is not available for another reason, each item can be given an assoicated transaction ID via the params object as well:

visitor.item({ip: 100, iq: 1, ic: "item-41325", in: "Item 41325", iv: "XL", ti: "trans-12345"}).send()


The following method signatures are available for #transaction:

* `Visitor#transaction(id)
* `Visitor#transaction(id, callback)
* `Visitor#transaction(id, revenue)
* `Visitor#transaction(id, revenue, callback)
* `Visitor#transaction(id, revenue, shipping)
* `Visitor#transaction(id, revenue, shipping, callback)
* `Visitor#transaction(id, revenue, shipping, tax)
* `Visitor#transaction(id, revenue, shipping, tax, callback)
* `Visitor#transaction(id, revenue, shipping, tax, affiliation)
* `Visitor#transaction(id, revenue, shipping, tax, affiliation, callback)
* `Visitor#transaction(params)
* `Visitor#transaction(params, callback)

The following method signatures are available for #item:

* `Visitor#item(price)`
* `Visitor#item(price, fn)`
* `Visitor#item(price, quantity)`
* `Visitor#item(price, quantity, fn)`
* `Visitor#item(price, quantity, sku)`
* `Visitor#item(price, quantity, sku, fn)`
* `Visitor#item(price, quantity, sku, name)`
* `Visitor#item(price, quantity, sku, name, fn)`
* `Visitor#item(price, quantity, sku, name, variation)`
* `Visitor#item(price, quantity, sku, name, variation, fn)`
* `Visitor#item(price, quantity, sku, name, variation, params)`
* `Visitor#item(price, quantity, sku, name, variation, params, fn)`
* `Visitor#item(price, quantity, sku, name, variation, params, fn)`
* `Visitor#item(params, fn)`
* `Visitor#item(params, fn)`


## Debug mode

`universal-analytics` can be instructed to output useful information during tracking by enabling the debug mode:

```javascript
var visitor = ua("UA-XXXX-XX").debug()
// … and so forth.
```


## Shortcuts

The tracking methods have shortcuts to shorten the code:

* `Visitor#pv` as an alias for `Visitor#pageview`
* `Visitor#e` as an alias for `Visitor#event`
* `Visitor#t` as an alias for `Visitor#transaction`
* `Visitor#i` as an alias for `Visitor#item`


## License

(The MIT License)

Copyright (c) 2013 Jörg Tillmann &lt;universal-analytics@joergtillmann.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.























