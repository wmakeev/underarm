/* underarm v0.0.1 | http://kevinbeaty.net/projects/underarm | License: MIT */
"use strict";

var when = require('when')
  , through = require('through')
  , u = require('./lib/util')
  , Consumer = require('./lib/consumer')
  , Producer = require('./lib/producer')
  , Underarm = require('./lib/underarm')
  , isArray = u.isArray
  , isUndefined = u.isUndefined
  , isObject = u.isObject
  , isFunction = u.isFunction
  , isRegExp = u.isRegExp
  , _min = Math.min
  , _max = Math.max
  , _has = u.has
  , _pop = u.pop
  , _push = u.push
  , _slice = u.slice
  , _splice = u.splice
  , _shift = u.shift
  , _unshift = u.unshift
  , _concat = u.concat
  , _forEach = u.forEach
  , _forIn = u.forIn
  , _some = u.some
  , _every = u.every
  , _indexOf = u.indexOf
  , _inArray = u.inArray
  , _removeFrom = u.removeFrom
  , _sortedIndex = u.sortedIndex
  , lookupIterator = u.lookupIterator
  , errorHandler = u.errorHandler
  , _nextTick = process.nextTick
  , identity = u.identity
  , predicateEqual = u.predicateEqual
  , resolveSingleValue = Consumer.resolveSingleValue
  , resolveValue = Consumer.resolveValue
  , resolveUndefined = Consumer.resolveUndefined
  , resolveFalse = Consumer.resolveFalse
  , resolveTrue = Consumer.resolveTrue
  , resolveNegativeOne = Consumer.resolveNegativeOne
  , seqNext = Consumer.seqNext
  , seqNextResolve = Consumer.seqNextResolve
  , isProducer = Producer.isProducer
  , produce = Underarm.produce
  , produceWithIterator = Underarm.produceWithIterator
  , produceOnComplete = Underarm.produceOnComplete

var _r = Underarm._r
module.exports = _r

_r.VERSION = '0.0.2'

_r.pipe = pipe
function pipe(producer, write, options){
  var stream = through()
  stream.pipe(write, options)
  return produce(
        producer
      , null
      , function(consumer, value){
          stream.queue(value)
          consumer.next(value)
        }
      , function(consumer){
          stream.queue(null)
          consumer.complete()
        }
      , function(consumer, err){
          stream.emit('error', err)
          consumer.error(err)
        });
}

_r.seq = _r.entries = seq
function seq(producer, context){
  return produce(producer, context, seqNext)
}

_r.map = _r.collect = map
function map(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, result){
        consumer.next(result)
      })
}

_r.reduce = _r.foldl = _r.inject = reduce
function reduce(producer, iterator, mem, context){
  var initial = arguments.length > 2
    , memo = {value:mem}
  return produce(
        producer
      , context
      , function(consumer, value){
          if(!initial){
            memo.value = value
            initial = true
          } else {
            memo.value = iterator.call(context, memo.value, value)
          }
        }
      , resolveValue(memo))
}

function reduceMemoType(MemoType){
  return function(producer, func){
    return reduce(
        producer
      , function(memo, val){
          func.call(memo, val)
          return memo
        }
      , new MemoType())
  }
}
var reduceArray = reduceMemoType(Array)
var reduceObject = reduceMemoType(Object)

_r.reduceRight = _r.foldr = reduceRight
function reduceRight(producer, iterator, memo, context){
  var initial = arguments.length > 2
  return produceOnComplete(
        producer
      , context
      , function(consumer, values){
          var i = values.length - 1
          for(; i >= 0; i--){
            if(!initial){
              memo = values[i]
              initial = true
            } else {
              memo = iterator.call(context, memo, values[i])
            }
          }
          resolveSingleValue(consumer, memo)
        })
}

_r.find = _r.detect = find
function find(producer, iterator, context){
  return produceWithIterator(
        producer
      , context
      , iterator
      , function(consumer, value, found){
          if(found) resolveSingleValue(consumer, value)
        }
      , resolveUndefined)
}

_r.filter = _r.select = filter
function filter(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, keep){
        if(keep) consumer.next(value)
      })
}

_r.reject = reject
function reject(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, ignore){
        if(!ignore) consumer.next(value)
      })
}

_r.every = _r.all = every
function every(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, passes){
        if(!passes) resolveFalse(consumer)
      }
    , resolveTrue)
}

_r.any = _r.some = any
function any(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, passes){
        if(passes) resolveTrue(consumer)
      }
    , resolveFalse)
}

_r.include = _r.contains = include
function include(producer, obj, context){
  return any(producer, predicateEqual(obj), context)
}

_r.invoke = _r.call = invoke
function invoke(producer, method){
  var args = _slice.call(arguments, 2)
  return map(producer, function(value){
      return (isFunction(method) ? method : value[method]).apply(value, args)
  })
}

_r.pluck = _r.get = pluck
function pluck(producer, key){
  return map(producer, function(value){return value[key]})
}

_r.max = max
function max(producer, iterator, context){
  var mx = {computed: -Infinity}
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, computed){
        if(computed > mx.computed){
          mx.value = value
          mx.computed = computed
        }
      }
    , resolveValue(mx))
}

_r.min = min
function min(producer, iterator, context){
  var mn = {computed: Infinity}
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, computed){
        if(computed < mn.computed){
          mn.value = value
          mn.computed = computed
        }
      }
    , resolveValue(mn))
}

_r.sortBy = sortBy
function sortBy(producer, val, context){
  return seq(reduceArray(producer, function(value){
    var iterator = lookupIterator(value, val)
    _splice.call(this, _sortedIndex(this, value, iterator), 0, value)
  }))
}

_r.sort = sort
function sort(producer, context){
  return sortBy(producer, identity, context)
}

_r.groupBy = groupBy
function groupBy(producer, val, context){
  return reduceObject(producer, function(value){
      var iterator = lookupIterator(value, val)
        , key = iterator.call(context, value)
        , group = this[key]
      if(isUndefined(group)){
        group = []
        this[key] = group
      }
      _push.call(group, value)
  })
}

_r.toArray = toArray
function toArray(producer){
  return reduceArray(producer, _push)
}

_r.size = size
function size(producer){
  return reduce(producer, function(memo, val){return memo+1}, 0)
}

_r.reverse = reverse
function reverse(producer){
  return seq(reduceArray(producer, _unshift))
}

_r.slice = slice
function slice(producer, begin, end){
  return sliceWithSingleValueOption(producer, false, begin, end)
}

function sliceWithSingleValueOption(producer, singleValueOption, begin, end){
  var index = 0
    , hasEnd = !isUndefined(end)

  if(begin >= 0 && (!hasEnd || end >= 0)){
    if(singleValueOption && hasEnd && (end - begin === 1)){
      return produce(producer, null
        , function(consumer, value){resolveSingleValue(consumer, value)})
    }

    return produce(
        producer
      , null
      , function(consumer, value){
          if(index++ >= begin){
            consumer.next(value)
          }

          if(hasEnd && index === end){
            consumer.complete()
          }
        })
  }

  return produceOnComplete(
        producer
      , null
      , function(consumer, results){
          var i = 0
            , len = results.length

          begin = begin < 0 ? len + begin : begin
          end = !hasEnd ? len : (end < 0 ? len + end : end)

          if(singleValueOption && (!hasEnd && begin === len - 1)
              || (hasEnd && (end - begin === 1))){
            resolveSingleValue(consumer, results[begin])
          } else {
            for(i = _max(0, begin); i < _min(len, end); i++){
              consumer.next(results[i])
            }
            consumer.complete()
          }
        })
}

_r.first = _r.head = first
function first(producer, n){
  var hasN = isUndefined(n)
  return sliceWithSingleValueOption(producer, hasN, 0, hasN ? 1 : n)
}

_r.initial = initial
function initial(producer, n){
  return slice(producer, 0, isUndefined(n) ? -1 : -n)
}

_r.last = last
function last(producer, n){
  var hasN = isUndefined(n)
  return sliceWithSingleValueOption(producer, hasN, hasN ? -1 : -n)
}

_r.rest = _r.tail = rest
function rest(producer, n){
  return slice(producer, isUndefined(n) ? 1 : n)
}

_r.splice = splice
function splice(producer, index, howMany){
  var idx = 0
    , removeAll = isUndefined(howMany)
    , toAdd = _slice.call(arguments, 3)
    , addToAdd = function(consumer, next){
        if(idx === index
          || (!next && idx < index)){
          seqNext(consumer, toAdd)
        }
        if(!next){
          consumer.complete()
        }
      }
    , consumerNext = function(consumer, value){
        if(idx < index || (!removeAll && idx >= index + howMany)){
          consumer.next(value)
        }
      }

  if(index >= 0){
    return produce(
        producer
      , null
      , function(consumer, value){
          addToAdd(consumer, true)
          consumerNext(consumer, value)

          if(removeAll && idx === index){
            consumer.complete()
          }
          idx++
        }
      , addToAdd)
  }

  return produceOnComplete(
        producer
      , null
      , function(consumer, results){
          var len = results.length
          index = len + index

          for(; idx < len; idx++){
            addToAdd(consumer, true)
            consumerNext(consumer, results[idx])

            if(removeAll && idx === index){
              break
            }
          }
          consumer.complete()
        })
}

_r.pop = pop
function pop(producer){
  return splice(producer, -1, 1)
}

_r.push = push
function push(producer){
  var toPush = _slice.call(arguments, 1)
  return produce(producer, null, null, seqNextResolve(toPush))
}

_r.shift = shift
function shift(producer){
  return splice(producer, 0, 1)
}

_r.unshift = unshift
function unshift(producer){
  /*jshint validthis:true */
  return splice.apply(this
    , _concat.call([producer, 0, 0], _slice.call(arguments, 1)))
}

_r.join = join
function join(producer, separator){
  separator = isUndefined(separator) ? ',' : separator += ''
  return reduce(producer, function(memo, val){return memo+separator+val})
}

_r.indexOf = indexOf
function indexOf(producer, value){
  var idx = 0
  return produceWithIterator(
        producer
      , null
      , predicateEqual(value)
      , function(consumer, value, found){
          if(found) resolveSingleValue(consumer, idx)
          idx++
        }
      , resolveNegativeOne)
}

_r.lastIndexOf = lastIndexOf
function lastIndexOf(producer, value){
  var idx = 0
    , lastIdx = {value: -1}
  return produceWithIterator(
        producer
      , null
      , predicateEqual(value)
      , function(consumer, value, found){
          if(found) lastIdx.value = idx
          idx++
        }
      , resolveValue(lastIdx))
}

_r.concat = concat
function concat(producer){
  var toConcat = _slice.call(arguments, 1)
    , i = 0
    , len = toConcat.length
    , countdown = function(consumer){
        if(i < len){
          produce(toConcat[i++], null, null, countdown)
            .subscribe(consumer)
        }
        if(i === len){
          consumer.complete()
        }
      }

  return produce(producer, null, null, countdown)
}

_r.compact = compact
function compact(producer){
  return filter(producer, function(val){return !!val})
}

_r.flatten = flatten
function flatten(producer, shallow){
  return produceWithIterator(
      producer
    , null
    , function(val){
        if(isArray(val) || isProducer(val)){
          if(shallow){
            return concat(val)
          }
          return flatten(val)
        }
        return val
      }
    , function(consumer, value, result){
        seqNext(consumer, result)
      })
}

_r.without = without
function without(producer){
  var values = _slice.call(arguments, 1)
  return reject(producer, function(val){return _inArray(values, val)})
}

_r.uniq = _r.unique = unique
function unique(producer, isSorted, iterator, context){
  var last = []
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, result){
        if(!_inArray(last, result)){
          consumer.next(result)
        }
        if(isSorted){
          last[0] = result
        } else {
          _push.call(last, result)
        }
      })
}

_r.union = union
function union(){
  return unique(flatten(_slice.call(arguments), true))
}

_r.intersection = intersection
function intersection(producer){
  var intersected = []
  var toIntersect = _slice.call(arguments, 1)
    , i = 0
    , len = toIntersect.length
    , countdown = function(consumer){
        if(i < len){
          produceOnComplete(
              toIntersect[i++]
            , null
            , function(consumer, values){
                _removeFrom(intersected, function(val){return !_inArray(values, val)})
                if(!intersected.length){
                  consumer.complete()
                } else {
                  countdown(consumer)
                }
              })
            .subscribe(consumer)
        }
        if(i === len){
          seqNext(consumer, intersected)
          consumer.complete()
        }
      }

  return produce(
      producer
    , null
    , function(consumer, value){
        if(!_inArray(intersected, value)){
          _push.call(intersected, value)
        }
      }
    , countdown)
}

_r.difference = difference
function difference(producer){
  var toSubtract = _slice.call(arguments, 1)
    , i = 0
    , len = toSubtract.length
    , diffed
    , countdown = function(consumer, result){
        if(result) diffed = result

        if(i < len){
          produce(
              toSubtract[i++]
            , null
            , function(consumer, value){
                _removeFrom(diffed, value)
                if(!diffed.length) consumer.complete()
              }
            , countdown)
          .subscribe(diffed)
        }
        if(i === len){
          seqNext(consumer, diffed)
          consumer.complete()
        }
      }
  return produceOnComplete(producer, null, countdown)
}

_r.zip = zip
function zip(){
  var producer = new Producer()
    , toZips = _slice.call(arguments)

  producer.onSubscribe = function(consumer){
    var delegates = []
      , completeDepth = Infinity
      , checkComplete = function(){
          var readyForComplete = delegates.length === toZips.length
            && _every.call(delegates, function(other){
                  return other.depth >= completeDepth
                })
          if(readyForComplete){
            consumer.complete()
          }
        }
      , next = function(delegate, val){
          _push.call(delegate.values, val)
          delegate.depth++

          var readyForNext = delegates.length === toZips.length
            && _every.call(delegates, function(other){
                  return other.values.length
                })

          if(readyForNext){
            var zipped = []
            _forEach.call(delegates, function(delegate){
              _push.call(zipped, _shift.call(delegate.values))
            })
            consumer.next(zipped)
          }
          checkComplete()
        }
      , complete = function(delegate){
          if(delegate.depth < completeDepth){
            completeDepth = delegate.depth
          }
          checkComplete()
        }

    _forEach.call(toZips, function(toZip, i){
      var delegate = delegates[i] = {
            producer: Producer.wrap(toZip)
          , values: []
          , depth: 0
          }
      delegate.producer.subscribe(
          function(val){next(delegate, val)}
        , function(){complete(delegate)}
        , function(err){consumer.error(err)}
        )
    })
  }
  return producer
}

_r.zipObjectBy = zipObjectBy
function zipObjectBy(producer, val, context){
  return reduceObject(producer, function(value){
      var iterator = lookupIterator(value, val)
        , entry = iterator.call(context, value)
      if(isArray(entry)){
        if(entry.length === 2){
          this[entry[0]] = entry[1]
        } else {
          this[entry[0]] = _slice.call(entry, 1)
        }
      } else {
        this[entry] = value
      }
  })
}

_r.zipObject = zipObject
function zipObject(producer, context){
  return zipObjectBy(producer, identity, context)
}

_r.keys = keys
function keys(producer){
  return pluck(seq(producer), 0)
}

_r.values = values
function values(producer){
  return pluck(seq(producer), 1)
}

_r.extend = extend
function extend(producer){
  var sources = _slice.call(arguments, 1)
  return produce(
      producer
    , null
    , function(consumer, obj){
        _forEach.call(sources, function(source){
          var key
          for(key in source){
            obj[key] = source[key]
          }
        })
        consumer.next(obj)
      })
}

_r.pick = pick
function pick(producer){
  var args = _slice.call(arguments, 1)
    , keys = []

   _forEach.call(args, function(arg){
     _forEach.call(isArray(arg) ? arg : [arg], function(key){
       _push.call(keys, key)
     })
   })

  return produce(
      producer
    , null
    , function(consumer, obj){
        var result = {}
        _forEach.call(keys, function(key){
          if(key in obj) result[key] = obj[key]
        })
        consumer.next(result)
      })
}

_r.defaults = defaults
function defaults(producer){
  var sources = _slice.call(arguments, 1)
  return produce(
      producer
    , null
    , function(consumer, obj){
        _forEach.call(sources, function(source){
          var key
          for(key in source){
            /*jshint eqnull:true */
            if(obj[key] == null) obj[key] = source[key]
          }
        })
        consumer.next(obj)
      })
}

_r.tap = tap
function tap(producer, doNext, doComplete, doError){
  return produce(
      producer
    , null
    , function(consumer, obj){
        if(isFunction(doNext)) doNext(obj)
        consumer.next(obj)
      }
    , function(consumer){
        if(isFunction(doComplete)) doComplete()
        consumer.complete()
      }
    , function(consumer, error){
        if(isFunction(doError)) doError(error)
        consumer.error(error)
      })
}

function delayConsumer(action, delayFun, arg){
  return function(consumer, val){
    var fun = function(){
      consumer[action](val)
    }
    delayFun(fun, arg)
  }
}

function produceDelayConsumer(producer, delayFun, arg){
  var args = _slice.call(arguments, 2)
  return produce(
      producer
    , null
    , delayConsumer('next', delayFun, arg)
    , delayConsumer('complete', delayFun, arg)
    , delayConsumer('error', delayFun, arg))
}

_r.delay = delay
function delay(producer, wait){
  return produceDelayConsumer(producer, setTimeout, wait)
}

_r.defer = defer
function defer(producer){
  return produceDelayConsumer(producer, _nextTick)
}

_r.debounce = debounce
function debounce(producer, wait, immediate){
  var timeout = null
    , sendIt = identity
  return produce(
      producer
    , null
    , function(consumer, obj){
        var callNow = immediate && !timeout
        sendIt = function(){
            timeout = null
            if(!immediate) consumer.next(obj)
          }
        clearTimeout(timeout)
        timeout = setTimeout(sendIt, wait)
        if(callNow) consumer.next(obj)
      }
    , function(consumer){
        clearTimeout(timeout)
        sendIt()
        consumer.complete()
      }
    , function(consumer, error){
        clearTimeout(timeout)
        consumer.error(error)
      })
}

Underarm.mixin(_r)

_r.mixin = Underarm.mixin
_r.chain = Underarm.chain
_r.when = when
_r.identity = identity
_r.each = _r.forEach = Underarm.each

_r.defaultErrorHandler = defaultErrorHandler
function defaultErrorHandler(handler){
  errorHandler = handler
}

if(typeof window !== 'undefined'){
  (function(){
    var old_r
    /*global window*/
    old_r = window._r
    window._r = _r

    _r.noConflict = noConflict
    function noConflict(){
      window._r = old_r
      return _r
    }
  })()
}
