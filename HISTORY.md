# History

## 0.4.4 / 2016-09-14

- Fixed bug in #set() method

## 0.4.3 / 2016-09-14

- Added #set() method for persistent parameters

## 0.4.2 / 2016-07-22

- Added batch requests

## 0.3.11 / 2016-03-16

- Added requestOptions to allow custom modifications for the request call

## 0.3.10 / 2015-12-18

- Fixed typo in the error handler for events
- Translate event parameters before validation

## 0.3.9 / 2015-07-20

- Added possibility of overwrite the hostname of google analytics to HTTPS

## 0.3.7 / 2015-05-18

- Include data as application/x-www-form-urlencoded - allows 8kb of data instead of the 2kb from query string
- Fixes #25: Accepting Enhanced Ecommerce params (and newly added MP params) without warnings
- Accept document location instead of page path

## 0.3.5 / 2014-10-22

- Added parameter translation

## 0.3.4 / 2014-02-28

- Return number of requests sent to GA for send() callback

## 0.3.2 / 2014-01-09

- Fixed Travis build

## 0.3.1 / 2014-01-06

- Added option to disable strict CID enforcement

## 0.3 / 2013-09-09

- Added .middleware() and.createFromSession() methods for better session-based identification
- Allow custom http headers to be POSTed to UA

## 0.2.2 / 2013-04-16

- Updated repository URL

## 0.2.1 / 2013-04-08

- Fixed bug that caused (params, fn) signature of #exception and #timing to not work
- Updated documentation

## 0.2 / 2013-03-26

- Added Timing and Exceptions
- Fixed some invalid space characters

## 0.1 / 2013-02-11

- Initial version
