#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Join the chat at https://gitter.im/ahom/binr][gitter-image]][gitter-url] [![Dependency Status][daviddm-url]][daviddm-image]


> Reading binary files with style:

## Features
- Define your structs as **readable code**
- Read files **as big as you want**
- **Selectively** read in a **lazy** manner big arrays/objects
- **Dig** into the parsing of your structs with **stack traces**

This library is aimed at providing a **simple and extensible** way to read binary files while giving full informations about read operations and failures.

## Roadmap
- Add Int64 support
- Add step by step reading
- Write web hex editor focused on reverse enginnering

## Contributions
You want to contribute? Perfect!

Do not hesitate to create issues/pull requests or come talk on gitter!

## Install

```sh
$ npm install --save binr
```

## Requirements
The following features from ES6 are needed in order for this library to work:
- Generators
- Promises

In order to use it on node.js you need to launch it with the following command:
```sh
$ node --harmony-generators
```

## Usage

> **Include the library**

```js
var binr = require('binr');
```

> **Define your struct**

```js
var t = binr.types;
var struct = function* () {
  return {
    magic: yield this.read_with_args(t.bytes)(4),
    major: yield this.read(t.uint16),
    minor: yield this.read(t.uint16)
  };
};
```

> **Read it!**

```js
var data = [
  0x01, 0x02, 0x03, 0x04, // magic
  0x02, 0x00,             // major
  0x01, 0x00              // minor
];

binr.read(struct, data).then(function (result) {
  console.log('Yay! It worked!');
  console.log(result);
}).catch(function (error) {
  console.log('Oh noes! A boo-boo!');
  console.log(error);
});
```
```
> Yay! It worked!
{
  magic: { '0': 1, '1': 2, '2': 3, '3': 4 },
  major: 2,
  minor: 1
}
```

> **Fetch the stack trace!**

```js
binr.trace_read(struct, data).then(function (result) {
  console.log('Yay! It worked!');
  console.log(result);
}).catch(function (error) {
  console.log('Oh noes! A boo-boo!');
  console.log(error);
});
```

```
> Yay! It worked!
{ parent: null,
  type: { func: [Function], args: {} },
  offset: 0,
  value: { magic: { '0': 1, '1': 2, '2': 3, '3': 4 }, major: 2, minor: 1 },
  size: 8,
  children:
   [ { parent: [Circular],
       type: [Object],
       offset: 0,
       value: [Object],
       size: 4,
       children: [] },
     { parent: [Circular],
       type: [Object],
       offset: 4,
       value: 2,
       size: 2,
       children: [] },
     { parent: [Circular],
       type: [Object],
       offset: 6,
       value: 1,
       size: 2,
       children: [] } ] }
```

> **Create a js file to use in browsers!**

```sh
# creates a browser.js
$ npm run browser
```

## License

MIT © [Antoine Hom]()


[npm-url]: https://npmjs.org/package/binr
[npm-image]: https://badge.fury.io/js/binr.svg
[travis-url]: https://travis-ci.org/ahom/binr
[travis-image]: https://travis-ci.org/ahom/binr.svg?branch=master
[daviddm-url]: https://david-dm.org/ahom/binr.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/ahom/binr
[coveralls-url]: https://coveralls.io/r/ahom/binr?branch=master
[coveralls-image]: https://coveralls.io/repos/ahom/binr/badge.svg?branch=master
[gitter-url]: https://gitter.im/ahom/binr?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[gitter-image]: https://badges.gitter.im/Join%20Chat.svg
