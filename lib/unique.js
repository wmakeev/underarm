'use strict'
var _unique = require('transduce/transducers/unique'),
    _dedupe = require('transduce/transducers/dedupe')

module.exports = function(_r){
  // Array Functions
  // ---------------
  _r.mixin({
    unique: unique,
    uniq: unique
  })

  var _ = _r._,
      iteratee = _r.iteratee

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  function unique(isSorted, f) {
     if (isSorted !== true && isSorted !== false) {
       f = isSorted
       isSorted = false
     }
     if(isSorted){
       return _dedupe()
     }

     if (f !== void 0) f = iteratee(f)
     return _unique(f)
  }
}
