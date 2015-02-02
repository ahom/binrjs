## Main Ideas

* Represent structs as **simple functions**.
* Provide all the following **basic types from scratch** (with endianness, default: le):
  * ```[u]int[8|16|32|64]```
  * ```float[16|32|64]```
  * ```bytes(length)```
  * ```string[utf[8|16|32]](length|null-terminated)```
  * ```struct```
  * ```bool```
* A read **must** advance the position in the buffer.
* Handle very big files without issues: **Don't load the whole file into memory**!
* Provide a way for **lazy reading**: When reading a very big file, make it possible to dive into it step by step. (Keep in mind the case of very long list)

## binread API

```js
let output = binread.read(type[, array_buffer[, file]])
let output = binread.read_with_args(type[, array_buffer[, file]])(args...)

let output_lazy = binread.read_lazy(type[, array_buffer[, file]])
let output_lazy = binread.read_lazy_with_args(type[, array_buffer[, file]])(args...)

let [outputs] = binread.read_array(type, length[, array_buffer[, file]])
let [outputs] = binread.read_array_with_args(type, length[, array_buffer[, file]])(function gen_args(i, f) { return f(args...)})

let output_array_lazy = binread.read_array_lazy(type, length[, array_buffer[, file]])
let output_array_lazy = binread.read_array_lazy_with_args(type, length[, array_buffer[, file]])(function gen_args(i, f) { return f(args...)})
```

## struct signature

```js
function struct(ctx[, args...]) {
  return {
    magic: ctx.read(bytes(4)),
    major_version: ctx.read(uint16),
    minor_version: ctx.read(uint16)
  }
}
```

## context API

```js
function read(type) -> value
function read_with_args(type)(args...) -> value

function read_lazy(type) -> value_lazy
function read_lazy_with_args(type)(args...) -> value_lazy

function read_array(type, length) -> [values]
function read_array_with_args(type, length)(function gen_args(i, f) { return f(args...)}) -> [values]

function read_array_lazy(type, length) -> value_array_lazy
function read_array_lazy_with_args(type, length)(function gen_args(i, f) { return f(args...)}) -> value_array_lazy

function seek(offset)
function skip(count)
function pos() -> uint
```

## Tasks

* [x] Write API specs.
* [ ] Handle basic types for ArrayBuffer with benchmarks.
* [ ] Write context for ArrayBuffer/File abstraction (without lazy reading). Starts with reading whole file in memory.
* [ ] Write proper file handling, with lazy reading.
* [ ] Write examples.
* [ ] Write context lazy reading.
* [ ] Write more examples taking advantage of lazy reading (.tar.gz file extraction?).
* [ ] Write cli.
* [ ] Write basic webui.
* [ ] Write web hexeditor.
* [ ] ???
* [ ] Profit.
* [ ] Or NOT.
