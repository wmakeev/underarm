describe('basic tests', function(){
  describe('_r', function(){
    it('should have methods', function(){
      expect(_r).to.be.ok()
      expect(_r.VERSION).to.be.a('string')
      expect(_r.noConflict).to.be.a('function')
      expect(_r.identity).to.be.a('function')
      expect(_r.defaultErrorHandler).to.be.a('function')
      expect(_r.promise).to.be.a('function')
      expect(_r.each).to.be.a('function')
      expect(_r.seq).to.be.a('function')
      expect(_r.map).to.be.a('function')
      expect(_r.reduce).to.be.a('function')
      expect(_r.reduceRight).to.be.a('function')
      expect(_r.find).to.be.a('function')
      expect(_r.filter).to.be.a('function')
      expect(_r.reject).to.be.a('function')
      expect(_r.every).to.be.a('function')
      expect(_r.any).to.be.a('function')
      expect(_r.contains).to.be.a('function')
      expect(_r.invoke).to.be.a('function')
      expect(_r.pluck).to.be.a('function')
      expect(_r.max).to.be.a('function')
      expect(_r.min).to.be.a('function')
      expect(_r.sortBy).to.be.a('function')
      expect(_r.sort).to.be.a('function')
      expect(_r.groupBy).to.be.a('function')
      expect(_r.toArray).to.be.a('function')
      expect(_r.size).to.be.a('function')
      expect(_r.reverse).to.be.a('function')
      expect(_r.slice).to.be.a('function')
      expect(_r.first).to.be.a('function')
      expect(_r.initial).to.be.a('function')
      expect(_r.last).to.be.a('function')
      expect(_r.rest).to.be.a('function')
      expect(_r.splice).to.be.a('function')
      expect(_r.pop).to.be.a('function')
      expect(_r.push).to.be.a('function')
      expect(_r.shift).to.be.a('function')
      expect(_r.unshift).to.be.a('function')
      expect(_r.join).to.be.a('function')
      expect(_r.indexOf).to.be.a('function')
      expect(_r.lastIndexOf).to.be.a('function')
      expect(_r.concat).to.be.a('function')
      expect(_r.compact).to.be.a('function')
      expect(_r.flatten).to.be.a('function')
      expect(_r.without).to.be.a('function')
      expect(_r.unique).to.be.a('function')
      expect(_r.union).to.be.a('function')
      expect(_r.intersection).to.be.a('function')
      expect(_r.difference).to.be.a('function')
      expect(_r.zip).to.be.a('function')
      expect(_r.zipObject).to.be.a('function')
      expect(_r.zipObjectBy).to.be.a('function')
      expect(_r.keys).to.be.a('function')
      expect(_r.values).to.be.a('function')
      expect(_r.extend).to.be.a('function')
      expect(_r.pick).to.be.a('function')
      expect(_r.defaults).to.be.a('function')
      expect(_r.tap).to.be.a('function')
    })

    it('should have aliases', function(){
      expect(_r.seq).to.be.equal(_r.entries)
      expect(_r.each).to.be.equal(_r.forEach)
      expect(_r.map).to.be.equal(_r.collect)
      expect(_r.reduce).to.be.equal(_r.foldl)
      expect(_r.reduce).to.be.equal(_r.inject)
      expect(_r.reduceRight).to.be.equal(_r.foldr)
      expect(_r.find).to.be.equal(_r.detect)
      expect(_r.filter).to.be.equal(_r.select)
      expect(_r.every).to.be.equal(_r.all)
      expect(_r.any).to.be.equal(_r.some)
      expect(_r.include).to.be.equal(_r.contains)
      expect(_r.pluck).to.be.equal(_r.get)
      expect(_r.invoke).to.be.equal(_r.call)
      expect(_r.first).to.be.equal(_r.head)
      expect(_r.rest).to.be.equal(_r.tail)
      expect(_r.unique).to.be.equal(_r.uniq)
    })

    describe('identity', function(){
      it('should return value', function(){
        expect(_r.identity(1)).to.eql(1)
        expect(_r.identity([1 , 2])).to.eql([1, 2])
      })
    })
  })
})
