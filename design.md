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
// Reads a type from where we are
function read(type) -> value
function read_with_args(type)(args...) -> value
// Lazily reads a type, will be processed later when asked
function read_lazy(type) -> value_lazy
function read_with_args(type)(args...) -> value_lazy
// Reads an array of a given type and a given length
function read_array(type, length) -> [values]
function read_array_with_args(type, length)(function enumerate(i, f) { return f(args...)}) -> [values]
// Lazily reads an array, will be processed later when asked
function read_array_lazy(type, length) -> value_array_lazy
function read_array_lazy_with_args(type, length)(function enumerate(i, f) { return f(args...)}) -> [values]

// All movement in the buffer are relative to the struct we are in
// Moves into the buffer to offset from the start
function seek(offset)
// Moves in the buffer by count
function skip(count)
// Returns position in buffer
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
