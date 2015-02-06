## Main Ideas

* Represent structs as **simple functions**.
* Provide all the following **basic types from scratch** (with endianness, default: le):
  * ```[le|be]?[u]?int[8|16|32|64]```
  * ```[le|be]?float[16|32|64]```
  * ```bytes(length)```
  * ```string[utf[8|16|32]]?(length|null-terminated)```
  * ```struct```
* A read **must** advance the position in the buffer.
* However lazy reads **do not** move the position in the buffer.
* Handle very big files without issues: **Don't load the whole file into memory**!
* Provide a way for **lazy reading**: When reading a very big file, make it possible to dive into it step by step. (Keep in mind the case of very long list)
* Use promises and generators to make writing structs easy (async code looking sync).

## binread API

> All binread APIs return promises.

```js
let output_promise = binread.read(type, data)
let output_promise = binread.read_with_args(type, data)(args...)
```

## struct signature

> All structs are generators.

```js
function* struct(args...) {
  return {
    magic: yield this.read_with_args(bytes)(4),
    major_version: yield this.read(uint16),
    minor_version: yield this.read(uint16)
  };
}
```

## context API

> All context read APIs return promises. The lazy counterparts do not.

```js
function read(type) -> promise_value
function read_with_args(type)(args...) -> promise_value

function read_array(type, length) -> promise_values
function read_array_with_args(type, length)(function apply_args(i, f) { return f(args...); }) -> promise_values

function lazy_read(type) -> value_lazy
function lazy_read_with_args(type)(args...) -> value_lazy

function lazy_read_array(type, length) -> values_lazy
function lazy_read_array_with_args(type, length)(function apply_args(i, f) { return f(args...); }) -> values_lazy

function seek(offset)
function skip(count)
function pos() -> uint
function size() -> uint
```
