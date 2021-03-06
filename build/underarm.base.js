(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'
var util = require(23),
    merge = util.objectMerge,
    isArray = util.isArray,
    isFunction = util.isFunction

var _r = function(obj, transform) {
  if (_r.as(obj)){
    if(transform === void 0){
      return obj
    }
    var wrappedFns = obj._wrappedFns.slice()
    wrappedFns.push(transform)
    var copy = new _r(obj._wrapped, wrappedFns)
    copy._opts = merge({}, obj._opts)
    return copy
  }

  if (!(_r.as(this))) return new _r(obj, transform)

  if(_r.as(transform)){
    this._opts = merge({}, transform._opts)
    transform = transform._wrappedFns
  } else {
    this._opts = {}
  }

  if(isFunction(transform)){
    this._wrappedFns = [transform]
  } else if(isArray(transform)){
    this._wrappedFns = transform
  } else {
    this._wrappedFns = []
  }

  this._wrapped = _r.wrap.call(this, obj)
}

_r.VERSION = '0.7.0'

// Export for browser or Common-JS
// Save the previous value of the `_r` variable.
var previous_r, root
if(typeof window !== 'undefined'){
  /*global window*/
  var root = window
  previous_r = root._r
  root._r = _r
  _r._ = root._
} else {
  root = {}
}
module.exports = _r

// Returns the value if it is a chained transformation, else null
_r.as = function(value){
  return value instanceof _r ? value : null
}

// Run Underscore.js in *noConflict* mode, returning the `_` variable to its
// previous owner. Returns a reference to the Underscore object.
_r.noConflict = function() {
  root._r = previous_r
  return this
}

// Returns a new chained instance using current transformation, but
// wrapping the given source
_r.prototype.withSource = function(obj){
  return _r(obj, this)
}

// Add your own custom transducers to the Underscore.transducer object.
_r.mixin = function(obj) {
  var name, fn
  for(name in obj){
    fn = obj[name]
    if(typeof fn === 'function'){
      _r[name] = fn
      _r.prototype[name] = _method(fn)
    }
  }
}

function _method(func){
  return function() {
    var method = func.apply(this, arguments)
    return _r(this, method)
  }
}

},{"23":23}],2:[function(require,module,exports){
'use strict'
var dispatcher = require(6)

module.exports = function(_r){
  var _ = _r._,
      as = _r.as,
      // sentinel to ignore wrapped objects (maintain only last item)
      IGNORE = _r.IGNORE = {}

  // Transducer Functions
  // --------------------
  var value = _r.value = dispatcher(),
      wrap = _r.wrap = dispatcher(),
      unwrap = _r.unwrap = dispatcher(),
      empty = _r.empty = dispatcher(),
      append = _r.append = dispatcher(),
      reduce = _r.reduce = dispatcher(),
      _reduce = require(17),
      _unreduced = require(22),
      transduce = _r.transduce = dispatcher(),
      _transduce = require(19),
      into = _r.into = dispatcher(),
      transducer = _r.transducer = dispatcher(),
      iterator = _r.iterator = dispatcher(),
      _iterable = require(15),
      _protocols = require(16),
      toArray = _r.toArray = dispatcher(),
      _toArray = require(13)([]),
      _util = require(23),
      iteratee = _r.iteratee = dispatcher()
  _r.resolveSingleValue = resolveSingleValue
  _r.resolveMultipleValues = resolveMultipleValues
  _r.reduced = require(18)
  _r.isReduced = require(14)
  _r.foldl = reduce
  _r.inject = reduce
  _r.deref = unwrap
  _r.conj = append
  _r.conjoin = append
  _r.dispatch = dispatch

  var compose = _r.compose = require(12)
  _r.transformer = require(21)
  _r.iterable = _iterable
  _r.protocols = _protocols
  _r.isFunction = _util.isFunction
  var isArray = _r.isArray = _util.isArray
  var isString = _r.isString = _util.isString
  _r.isRegExp = _util.isRegExp
  _r.isNumber = _util.isNumber
  _r.isUndefined = _util.isUndefined
  _r.arrayPush = _util.arrayPush
  _r.objectMerge = _util.objectMerge
  _r.stringAppend = _util.stringAppend
  var identity = _r.identity = _util.identity


  // Dispatchers
  // -----------

  // Resolves the value of the wrapped object, similar to underscore.
  // Returns an array, or single value (to match underscore API)
  // depending on whether the chained transformation resolves to single value.
  value.register(function(self){
    if(!self._opts.resolveSingleValue){
      return self.into()
    }

    var ret =  self.into(IGNORE)
    return ret === IGNORE ? void 0 : ret
  })

  _r.prototype.value = function(){
    return value(this)
  }

  // Helper to mark transducer to expect single value when
  // resolving. Only valid when chaining, but this should be passed
  // when called as a function
  function resolveSingleValue(self){
    _resolveSingleValue(self, true)
  }

  // Helper to mark transducer to expect multiple values when
  // resolving. Only valid when chaining, but this should be passed
  // when called as a function.
  function resolveMultipleValues(self){
    _resolveSingleValue(self, false)
  }

  function _resolveSingleValue(self, single){
    if(as(self)){
      self._opts.resolveSingleValue = single
    }
  }

  // Composes and returns the underlying wrapped functions for give chained object
  transducer.register(function(self){
    var fns = self._wrappedFns
    return fns.length ? compose.apply(null, fns) : identity
  })

  _r.prototype.transducer = _r.prototype.compose = function() {
    return transducer(this)
  }

  reduce.register(function(xf, init, coll) {
    if(as(xf)){
      xf = transducer(xf)
    }

    if (coll === null || coll === void 0) coll = empty(coll)
    return _reduce(xf, init, coll)
  })

  // Calls transduce using the chained transformation if function not passed
  _r.prototype.reduce = function(init, coll){
    if(coll === void 0){
      coll = this._wrapped
    }
    return reduce(this, init, coll)
  }

  transduce.register(function(xf, f, init, coll){
    if(as(xf)){
      xf = transducer(xf)
    }

    return unwrap(_transduce(xf, f, init, coll))
  })

  // Calls transduce using the chained transformation
  _r.prototype.transduce = function(f, init, coll){
    if(coll === void 0){
      coll = this._wrapped
    }
    return transduce(this, f, init, coll)
  }


  // Returns a new coll consisting of to-coll with all of the items of
  // from-coll conjoined. A transducer (step function) may be supplied.
  into.register(function(to, xf, from){
    if(from === void 0){
      from = xf
      xf = void 0
    }

    if(from === void 0){
      from = empty()
    }

    if(as(xf)){
      xf = transducer(xf)
    }

    if(to === void 0){
      to = empty(from)
    }

    if(xf === void 0){
      return reduce(append, to, from)
    }

    return transduce(xf, append, to, from)
  })

  // Calls into using the chained transformation
  _r.prototype.into = function(to, from){
    if(from === void 0){
      from = this._wrapped
    }
    return into(to, this, from)
  }

  // Returns a new collection of the empty value of the from collection
  toArray.register(function(xf, from){
    if(as(xf)){
      xf = transducer(xf)
    }
    if(arguments.length === 1){
      return _toArray(xf)
    }
    return _toArray(xf, from)
  })

  // calls toArray with chained transformation and optional wrapped object
  _r.prototype.toArray = function(from){
    if(from === void 0){
      from = this._wrapped
    }
    return toArray(this, from)
  }

  // Wraps a value used as source for use during chained transformation. 
  //
  // Default returns value, or _r.empty() if undefined.
  //
  // Dispatch function. To support different types,
  // call _r.unwrap.register
  wrap.register(function(value){
    if(isString(value)){
      value = [value]
    } else if(value === null || value === void 0){
      value = empty()
    }
    return value
  })

  // Unwraps (deref) a possibly wrapped value
  // Default unwraps values created with _r.reduced,
  // or calls value() on chained _r transformations,
  // otherwise returns parameter.
  //
  // Dispatch function. To support different types,
  // call _r.unwrap.register
  unwrap.register(function(value){
    if(as(value)){
      return value.value()
    }
    return _unreduced(value)
  })

  // Returns an iterator that has next function
  // and returns {value, done}. Default looks for
  // object with iterator Symbol (or '@@iterator').
  // This is available with _r.iterator.Symbol
  //
  // Dispatch function. To support different types
  // call _r.iterator.register and supply function that returns
  // an iterator after checking the input using appropriate
  // predicates. Return undefined if not supported, so other
  // dispatched functions can be checked
  iterator.register(function(value){
    return _iterable(value)[_protocols.iterator]()
  })

  // Mostly internal function that generates a callback from the given value.
  // For use with generating callbacks for map, filter, find, etc.
  //
  // Default returns _.iteratee.
  //
  // Dispatch function. To support different types
  // call _r.iteratee.register and supply function that returns
  // a callback after checking the input using appropriate
  // predicates. Return undefined if not supported, so other
  // dispatched functions can be checked
  iteratee.register(function(value){
    if(as(value)){
      return _riteratee(value)
    }
    return _.iteratee(value)
  })

  function _riteratee(value){
    return function(item){
      return value.withSource(item).value()
    }
  }

  // Returns empty object of the same type as argument.
  // Default returns [] if isArray or undefined, {} if _.isObject
  // and an internal sentinel to ignore otherwise
  //
  // Dispatch function. To support different types
  // call _r.empty.register and supply function that returns
  // an empty object after checking the input using appropriate
  // predicates. Return undefined if not supported, so other
  // dispatched functions can be checked
  empty.register(function(obj){
    if(obj === void 0 || isArray(obj) || iterator(obj)){
      return [] // array if not specified or from array
    } else if(_.isObject(obj)){
      return {} // object if from object
    }

    // ignore by default. Default append just maintains last item.
    return IGNORE
  })

  // Appends (conjoins) the item to the collection, and returns collection
  //
  // Dispatch function. To support different types
  // call _r.append.register and supply function that append to the object
  // (first param) with the item and optional key after checking the input
  // using appropriate predicates.
  //
  // Return undefined if not supported, so other dispatched functions can be checked
  append.register(function(obj, item){
    if(isArray(obj)){
      obj.push(item)
      return obj
    }

    // just maintain last item
    return item
  })

  // Reducer that dispatches to empty, unwrap and append
  function Dispatch(){}
  Dispatch.prototype.init = empty
  Dispatch.prototype.result = unwrap
  Dispatch.prototype.step = append

  function dispatch(){
    return new Dispatch()
  }
}

},{"12":12,"13":13,"14":14,"15":15,"16":16,"17":17,"18":18,"19":19,"21":21,"22":22,"23":23,"6":6}],3:[function(require,module,exports){
'use strict'
module.exports = function(libs, _r){
  var i = 0, len = libs.length, lib
  if(_r === void 0){
    _r = require(1)
  }

  for(; i < len; i++){
    lib = libs[i]
    // only import if included in build
    if(typeof lib === 'function'){
      lib(_r)
    }
  }

  return _r
}

},{"1":1}],4:[function(require,module,exports){
'use strict'
var slice = Array.prototype.slice

module.exports = function(_r){
  // Base Transducers
  // ----------------
  _r.mixin({
    map: map,
    collect: map,
    filter: filter,
    select: filter,
    remove: remove,
    reject: remove,
    take: take,
    first: take,
    head: take,
    takeWhile: takeWhile,
    drop: drop,
    rest: drop,
    tail: drop,
    dropWhile: dropWhile,
    cat: cat,
    mapcat: mapcat,
    partitionAll: partitionAll,
    chunkAll: partitionAll,
    partitionBy: partitionBy,
    compact: compact,
    invoke: invoke,
    pluck: pluck,
    where: where
  })

  var iteratee = _r.iteratee,
      _ = _r._,
      util = require(23),
      isFunction = util.isFunction,
      identity = util.identity

  // Return the results of applying the iteratee to each element.
  var _map = require(28)
  function map(f) {
    return _map(iteratee(f))
  }

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  var _filter = require(27)
  function filter(predicate) {
    return _filter(iteratee(predicate))
  }

  // Return all the elements for which a truth test fails.
  var _remove = require(32)
  function remove(predicate) {
    return _remove(iteratee(predicate))
  }

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`.
  var _take = require(33)
  function take(n) {
     if(n === void 0){
       /*jshint validthis:true*/
       _r.resolveSingleValue(this)
       n = 1
     } else {
       n = (n > 0) ? n : 0
     }
     return _take(n)
  }

  // takes items until predicate returns false
  var _takeWhile = require(34)
  function takeWhile(predicate) {
     return _takeWhile(iteratee(predicate))
  }

  // Returns everything but the first entry. Aliased as `tail` and `drop`.
  // Passing an **n** will return the rest N values.
  var _drop = require(25)
  function drop(n) {
    n = (n === void 0) ? 1 : (n > 0) ? n : 0
    return _drop(n)
  }

  // Drops items while the predicate returns true
  var _dropWhile = require(26)
  function dropWhile(predicate) {
     return _dropWhile(iteratee(predicate))
  }

  // Concatenating transducer.
  // NOTE: unlike libraries, cat should be called as a function to use.
  // _r.cat() not _r.cat
  var _cat = require(24)
  function cat(){
    return _cat
  }

  // mapcat.
  // Composition of _r.map(f) and _r.cat()
  var _mapcat = require(29)
  function mapcat(f){
    return _mapcat(iteratee(f))
  }

  // Partitions the source into arrays of size n
  // When transformer completes, the array will be stepped with any remaining items.
  // Alias chunkAll
  var _partitionAll = require(30)
  function partitionAll(n){
    return _partitionAll(n)
  }

  // Partitions the source into sub arrays while the value of the function
  // changes equality.
  var _partitionBy = require(31)
  function partitionBy(f){
    return _partitionBy(iteratee(f))
  }
  

  // Trim out all falsy values from an array.
  function compact() {
    return filter(identity)
  }

  // Invoke a method (with arguments) on every item in a collection.
  function invoke(method) {
    var args = slice.call(arguments, 2),
        isFunc = isFunction(method)
    return map(function(value) {
      return (isFunc ? method : value[method]).apply(value, args)
    })
  }

  // Convenience version of a common use case of `map`: fetching a property.
  function pluck(key) {
    return map(_.property(key))
  }

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  function where(attrs) {
    return filter(_.matches(attrs))
  }
}

},{"23":23,"24":24,"25":25,"26":26,"27":27,"28":28,"29":29,"30":30,"31":31,"32":32,"33":33,"34":34}],5:[function(require,module,exports){
'use strict'
// Based on Underscore.js 1.7.0
// http://underscorejs.org
//
// Which is distributed under MIT License:
// Underscore.js > (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Underscore.js > Underscore may be freely distributed under the MIT license.

var util = require(23),
    isFunction = util.isFunction,
    isArray = util.isArray,
    isString = util.isString,
    isNumber = util.isNumber,
    identity = util.identity

module.exports = function(_r){
  var _ = _r._ || {}
  _r._ = _
  _.iteratee = iteratee
  _.matches = matches
  _.property = property
}

function iteratee(value){
  var f
  if(isNull(value)){
    f = identity
  } else if(isFunction(value)){
    f = value
  } else if(isKey(value)){
    f = property(value)
  } else {
    f = matches(value)
  }
  return f
}

function property(key){
  return function(value){
    return value[key]
  }
}

function matches(attrs){
  var ps = pairs(attrs),
      len = ps.length
  return function(value){
    if(isNull(value)){
      return len === 0
    }
    var i = 0, p, k, v
    for(; i < len; i++){
      p = ps[i]
      k = p[0]
      v = p[1]
      if(v !== value[k] || !(k in value)){
        return false
      }
    }
    return true
  }
}

function isNull(value){
  return value === void 0 || value === null
}

function isKey(value){
  return isString(value) || isNumber(value)
}

function pairs(value){
  var key, ps = []
  for(key in value){
    if(value.hasOwnProperty(key)){
      ps.push([key, value[key]])
    }
  }
  return ps
}

},{"23":23}],6:[function(require,module,exports){
"use strict";
var undef;

module.exports = redispatch;

function redispatch(ctx){
  var fns = [],
      d = dispatch(fns, ctx);

  d.register = register(fns);
  d.unregister = unregister(fns);

  return d;
}

function register(fns){
  return function(fn){
    fns.push(fn);
  };
}

function unregister(fns){
  return function(fn){
    var idx = fns.indexOf(fn);
    if(idx > -1){
      fns.splice(idx, 1);
    }
  };
}

function dispatch(fns, ctx){
  return function(){
    var args = arguments,
        self = ctx !== undef ? ctx : this,
        i = fns.length,
        result;
    for(; i-- ;){
      result = fns[i].apply(self, args);
      if(result !== undef){
        return result;
      }
    }
  };
}

},{}],7:[function(require,module,exports){
'use strict'
var isReduced = require(14),
    unreduced = require(22),
    iterable = require(15),
    protocols = require(16),
    tp = protocols.transducer,
    util = require(23),
    isArray = util.isArray,
    isFunction = util.isFunction

module.exports = {
  transduce: transduce,
  reduce: reduce
}

function transduce(t, xf, init, coll) {
  return reduce(t(xf), init, coll)
}

function reduce(xf, init, coll){
  if(isArray(coll)){
    return arrayReduce(xf, init, coll)
  }

  if(isFunction(coll.reduce)){
    return methodReduce(xf, init, coll)
  }

  return iteratorReduce(xf, init, coll)
}

function arrayReduce(xf, init, arr){
  var value = init,
      i = 0,
      len = arr.length
  for(; i < len; i++){
    value = xf[tp.step](value, arr[i])
    if(isReduced(value)){
      value = unreduced(value)
      break
    }
  }
  return xf[tp.result](value)
}

function methodReduce(xf, init, coll){
  var result = coll.reduce(function(result, value){
    return xf[tp.step](result, value)
  }, init)
  return xf[tp.result](result)
}

function iteratorReduce(xf, init, iter){
  var value = init, next
  iter = iterable(iter)[protocols.iterator]()
  while(true){
    next = iter.next()
    if(next.done){
      break
    }

    value = xf[tp.step](value, next.value)
    if(isReduced(value)){
      value = unreduced(value)
      break
    }
  }
  return xf[tp.result](value)
}

},{"14":14,"15":15,"16":16,"22":22,"23":23}],8:[function(require,module,exports){
'use strict'
var transformer = require(21),
    isFunction = require(23).isFunction,
    tp = require(16).transducer

module.exports = function(core){
  var reduce = core.reduce,
      transduce = core.transduce

  return function into(init, t, coll){
    var xf = transformer(init),
        len = arguments.length

    if(len === 1){
      return intoCurryXf(xf)
    }

    if(len === 2){
      if(isFunction(t)){
        return intoCurryXfT(xf, t)
      }
      coll = t
      return reduce(xf, init, coll)
    }
    return transduce(t, xf, init, coll)
  }

  function intoCurryXf(xf){
    return function intoXf(t, coll){
      if(arguments.length === 1){
        if(isFunction(t)){
          return intoCurryXfT(xf, t)
        }
        coll = t
        return reduce(xf, xf[tp.init](), coll)
      }
      return transduce(t, xf, xf[tp.init](), coll)
    }
  }

  function intoCurryXfT(xf, t){
    return function intoXfT(coll){
      return transduce(t, xf, xf[tp.init](), coll)
    }
  }
}

},{"16":16,"21":21,"23":23}],9:[function(require,module,exports){
'use strict'
var completing = require(11),
    util = require(23),
    isFunction = util.isFunction,
    tp = require(16).transducer

module.exports = function(core){
  return function reduce(xf, init, coll){
    if(isFunction(xf)){
      xf = completing(xf)
    }

    if (arguments.length === 2) {
      coll = init
      init = xf[tp.init]()
    }
    return core.reduce(xf, init, coll)
  }
}

},{"11":11,"16":16,"23":23}],10:[function(require,module,exports){
'use strict'
var completing = require(11),
    util = require(23),
    isFunction = util.isFunction,
    tp = require(16).transducer

module.exports = function(core){
  return function transduce(t, xf, init, coll) {
    if(isFunction(xf)){
      xf = completing(xf)
    }
    xf = t(xf)
    if (arguments.length === 3) {
      coll = init
      init = xf[tp.init]()
    }
    return core.reduce(xf, init, coll)
  }
}

},{"11":11,"16":16,"23":23}],11:[function(require,module,exports){
'use strict'
var identity = require(23).identity,
    tp = require(16).transducer

module.exports =
// Turns a step function into a transfomer with init, step, result
// If init not provided, calls `step()`.  If result not provided, calls `idenity`
function completing(rf, result){
  return new Completing(rf, result)
}
function Completing(rf, result){
  this[tp.init] = rf
  this[tp.step] = rf
  this[tp.result] = result || identity
}

},{"16":16,"23":23}],12:[function(require,module,exports){
'use strict'

module.exports =
function compose(){
  var fns = arguments
  return function(xf){
    var i = fns.length
    while(i--){
      xf = fns[i](xf)
    }
    return xf
  }
}

},{}],13:[function(require,module,exports){
'use strict'
module.exports = require(8)(require(7))

},{"7":7,"8":8}],14:[function(require,module,exports){
'use strict'

var tp = require(16).transducer

module.exports =
function isReduced(value){
  return !!(value && value[tp.reduced])
}

},{"16":16}],15:[function(require,module,exports){
'use strict'
var symbol = require(16).iterator,
    util = require(23),
    isArray = util.isArray,
    isFunction = util.isFunction,
    isString = util.isString,
    has = {}.hasOwnProperty,
    keys = Object.keys || _keys

module.exports =
function iterable(value){
  var it
  if(value[symbol] !== void 0){
    it = value
  } else if(isArray(value) || isString(value)){
    it = new ArrayIterable(value)
  } else if(isFunction(value)){
    it = new FunctionIterable(value)
  } else if(isFunction(value.next)){
    it = new FunctionIterable(callNext(value))
  } else {
    it = new ObjectIterable(value)
  }
  return it
}

function callNext(value){
  return function(){
    return value.next()
  }
}

// Wrap an Array into an iterable
function ArrayIterable(arr){
  this.arr = arr
}
ArrayIterable.prototype[symbol] = function(){
  var arr = this.arr,
      idx = 0
  return {
    next: function(){
      if(idx >= arr.length){
        return {done: true}
      }

      return {done: false, value: arr[idx++]}
    }
  }
}

// Wrap an function into an iterable that calls function on every next
function FunctionIterable(fn){
  this.fn = fn
}
FunctionIterable.prototype[symbol] = function(){
  var fn = this.fn
  return {
    next: function(){
      return {done: false, value: fn()}
    }
  }
}

// Wrap an Object into an iterable. iterates [key, val]
function ObjectIterable(obj){
  this.obj = obj
  this.keys = keys(obj)
}
ObjectIterable.prototype[symbol] = function(){
  var obj = this.obj,
      keys = this.keys,
      idx = 0
  return {
    next: function(){
      if(idx >= keys.length){
        return {done: true}
      }
      var key = keys[idx++]
      return {done: false, value: [key, obj[key]]}
    }
  }
}

function _keys(obj){
  var prop, keys = []
  for(prop in obj){
    if(has.call(obj, prop)){
      keys.push(prop)
    }
  }
  return keys
}

},{"16":16,"23":23}],16:[function(require,module,exports){
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined',
    iterator = symbolExists ? Symbol.iterator : '@@iterator'

module.exports = {
  iterator: iterator,
  transducer: {
    init: '@@transducer/init',
    step: '@@transducer/step',
    result: '@@transducer/result',
    reduced: '@@transducer/reduced',
    value: '@@transducer/value'
  }
}

},{}],17:[function(require,module,exports){
'use strict'
module.exports = require(9)(require(7))

},{"7":7,"9":9}],18:[function(require,module,exports){
'use strict'

var isReduced = require(14),
    tp = require(16).transducer

module.exports =
function reduced(value, force){
  if(force || !isReduced(value)){
    value = new Reduced(value)
  }
  return value
}

function Reduced(value){
  this[tp.value] = value
  this[tp.reduced] = true
}

},{"14":14,"16":16}],19:[function(require,module,exports){
'use strict'
module.exports = require(10)(require(7))

},{"10":10,"7":7}],20:[function(require,module,exports){
'use strict'
var tp = require(16).transducer

module.exports =
function transducer(step, result, init) {
  return function(xf){
    return new Transducer(xf, step, result, init)
  }
}
function Transducer(xf, step, result, init) {
  this.xf = xf

  this.init = init
  this.step = step
  this.result = result

  this.context = {
    init: bindXf(xf, tp.init),
    step: bindXf(xf, tp.step),
    result: bindXf(xf, tp.result)
  }
}
Transducer.prototype[tp.init] = function(){
  var that = this.context
  return this.init ? this.init.call(that, that.init) : that.init()
}
Transducer.prototype[tp.step] = function(value, input){
  var that = this.context
  return this.step ? this.step.call(that, that.step, value, input) : that.step(value, input)
}
Transducer.prototype[tp.result] = function(value){
  var that = this.context
  return this.result ? this.result.call(that, that.result, value) : that.result(value)
}
function bindXf(xf, p){
  return function(){
    return xf[p].apply(xf, arguments)
  }
}

},{"16":16}],21:[function(require,module,exports){
'use strict'
var tp = require(16).transducer,
    completing = require(11),
    util = require(23),
    identity = util.identity,
    isArray = util.isArray,
    isFunction = util.isFunction,
    isString = util.isString,
    objectMerge = util.objectMerge,
    arrayPush = util.arrayPush,
    stringAppend = util.stringAppend,
    slice = Array.prototype.slice,
    lastValue = {}

lastValue[tp.init] = function(){}
lastValue[tp.step] = function(result, input){return input}
lastValue[tp.result] = identity

module.exports =
function transformer(value){
  var xf
  if(value === void 0 || value === null){
    xf = lastValue
  } else if(isFunction(value[tp.step])){
    xf = value
  } else if(isFunction(value)){
    xf = completing(value)
  } else if(isArray(value)){
    xf = new ArrayTransformer(value)
  } else if(isString(value)){
    xf = new StringTransformer(value)
  } else {
    xf = new ObjectTransformer(value)
  }
  return xf
}

// Pushes value on array, using optional constructor arg as default, or [] if not provided
// init will clone the default
// step will push input onto array and return result
// result is identity
function ArrayTransformer(defaultValue){
  this.defaultValue = defaultValue === void 0 ? [] : defaultValue
}
ArrayTransformer.prototype[tp.init] = function(){
  return slice.call(this.defaultValue)
}
ArrayTransformer.prototype[tp.step] = arrayPush
ArrayTransformer.prototype[tp.result] = identity


// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
function StringTransformer(str){
  this.strDefault = str === void 0 ? '' : str
}
StringTransformer.prototype[tp.init] = function(){
  return this.strDefault
}
StringTransformer.prototype[tp.step] = stringAppend
StringTransformer.prototype[tp.result] = identity

// Merges value into object, using optional constructor arg as default, or {} if undefined
// init will clone the default
// step will merge input into object and return result
// result is identity
function ObjectTransformer(obj){
  this.objDefault = obj === void 0 ? {} : objectMerge({}, obj)
}
ObjectTransformer.prototype[tp.init] = function(){
  return objectMerge({}, this.objDefault)
}
ObjectTransformer.prototype[tp.step] = objectMerge
ObjectTransformer.prototype[tp.result] = identity

},{"11":11,"16":16,"23":23}],22:[function(require,module,exports){
'use strict'

var isReduced = require(14),
    tp = require(16).transducer

module.exports =
function unreduced(value){
  if(isReduced(value)){
    value = value[tp.value]
  }
  return value
}

},{"14":14,"16":16}],23:[function(require,module,exports){
'use strict'
var toString = Object.prototype.toString,
    isArray = (Array.isArray || predicateToString('Array')),
    has = {}.hasOwnProperty

module.exports = {
  isArray: isArray,
  isFunction: isFunction,
  isNumber: predicateToString('Number'),
  isRegExp: predicateToString('RegExp'),
  isString: predicateToString('String'),
  isUndefined: isUndefined,
  identity: identity,
  arrayPush: arrayPush,
  stringAppend: stringAppend,
  objectMerge: objectMerge
}

function isFunction(value){
  return typeof value === 'function'
}

function isUndefined(value){
  return value === void 0
}

function predicateToString(type){
  var str = '[object '+type+']'
  return function(value){
    return toString.call(value) === str
  }
}

function identity(result){
  return result
}

function arrayPush(result, input){
  result.push(input)
  return result
}

function stringAppend(result, input){
  return result + input
}

function objectMerge(result, input){
  if(isArray(input) && input.length === 2){
    result[input[0]] = input[1]
  } else {
    var prop
    for(prop in input){
      if(has.call(input, prop)){
        result[prop] = input[prop]
      }
    }
  }
  return result
}

},{}],24:[function(require,module,exports){
'use strict'
var reduced = require(18),
    isReduced = require(14),
    reduce = require(17),
    transducer = require(20),
    transducerReduce = transducer(reduce),
    preserveReduced = transducer(function(step, value, input){
      value = step(value, input)
      return isReduced(value) ? reduced(value, true) : value
    })

module.exports =
function cat(xf){
  return transducerReduce(preserveReduced(xf))
}

},{"14":14,"17":17,"18":18,"20":20}],25:[function(require,module,exports){
'use strict'
var transducer = require(20)

module.exports =
function drop(n){
  return transducer(function(step, value, item){
    if(this.n === void 0) this.n = n
    return (--this.n < 0) ? step(value, item) : value
  })
}

},{"20":20}],26:[function(require,module,exports){
'use strict'
var transducer = require(20)

module.exports =
function dropWhile(p){
  return transducer(function(step, value, input){
    if(!this.found){
      if(p(input)){
        return value
      }
      this.found = true
    }
    return step(value, input)
  })
}

},{"20":20}],27:[function(require,module,exports){
'use strict'
var transducer = require(20)

module.exports =
function filter(predicate) {
  return transducer(function(step, value, input) {
    return predicate(input) ? step(value, input) : value
  })
}

},{"20":20}],28:[function(require,module,exports){
'use strict'
var transducer = require(20)

module.exports =
function map(callback) {
  return transducer(function(step, value, input) {
    return step(value, callback(input))
  })
}

},{"20":20}],29:[function(require,module,exports){
'use strict'
var compose = require(12),
    map = require(28),
    cat = require(24)

module.exports =
function mapcat(callback) {
  return compose(map(callback), cat)
}

},{"12":12,"24":24,"28":28}],30:[function(require,module,exports){
'use strict'
var transducer = require(20)

module.exports =
function partitionAll(n) {
  return transducer(
    function(step, value, input){
      if(this.inputs === void 0){
        this.inputs = []
      }
      var ins = this.inputs
      ins.push(input)
      if(n === ins.length){
        this.inputs = []
        value = step(value, ins)
      }
      return value
    },
    function(result, value){
      var ins = this.inputs
      if(ins && ins.length){
        this.inputs = []
        value = this.step(value, ins)
      }
      return result(value)
    })
}

},{"20":20}],31:[function(require,module,exports){
'use strict'
var transducer = require(20),
    isReduced = require(14)

module.exports =
function partitionBy(f) {
  return transducer(
    function(step, value, input){
      var ins = this.inputs,
          curr = f(input),
          prev = this.prev
      this.prev = curr
      if(ins === void 0){
        this.inputs = [input]
      } else if(prev === curr){
        ins.push(input)
      } else {
        this.inputs = []
        value = step(value, ins)
        if(!isReduced(value)){
          this.inputs.push(input)
        }
      }
      return value
    },
    function(result, value){
      var ins = this.inputs
      if(ins && ins.length){
        this.inputs = []
        value = this.step(value, ins)
      }
      return result(value)
    })
}

},{"14":14,"20":20}],32:[function(require,module,exports){
'use strict'
var filter = require(27)

module.exports = remove
function remove(p){
  return filter(function(x){
    return !p(x)
  })
}


},{"27":27}],33:[function(require,module,exports){
'use strict'
var transducer = require(20),
    reduced = require(18)

module.exports =
function take(n){
  return transducer(function(step, value, item){
    if(this.n === void 0){
      this.n = n
    }
    if(this.n-- > 0){
      value = step(value, item)
    }
    if(this.n <= 0){
      value = reduced(value)
    }
    return value
  })
}

},{"18":18,"20":20}],34:[function(require,module,exports){
'use strict'
var transducer = require(20),
    reduced = require(18)

module.exports =
function takeWhile(p){
  return transducer(function(step, value, input){
    return p(input) ? step(value, input) : reduced(value)
  })
}

},{"18":18,"20":20}],35:[function(require,module,exports){
module.exports = require(3)([
  require(5),
  require(2),
  require(4)])

},{"2":2,"3":3,"4":4,"5":5}]},{},[35]);
