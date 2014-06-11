var chai = require("chai");
chai.config.includeStack = true;
var assert = chai.assert;
var Container = require('./container.js');

//an example "service"
function Service(foo) {
  this.param = foo;
  this.anotherParam = null;
}

describe("Container", function() {

  it("should instantiate", function() {
    var c = new Container();
    assert(c instanceof Container);
  });
  
  it("Container.get should throw error when getting undefined params and services", function() {
    var c = new Container();
    assert.throw(function() {
      c.get('foo');
    });
  });
  
  it("Container.set should set parameters", function() {
    var c = new Container();
    c.set('foo', 4);
    assert(4 === c.get('foo'), "should receive the 'foo' parameter");
    
    c.set('bar', new Service(23));
    var s1 = c.get('bar');
    var s2 = c.get('bar');
    assert.isTrue(23 === c.get('bar').param);
    assert.isTrue(s1 === s2);
  });
  
  it("Container.share should set shared service factories", function() {
    var c = new Container();

    c.share('foo', function(c) {
      return new Service(c.get('bar'));
    });
    
    c.set('bar', 86);
    
    var foo1 = c.get('foo');
    var foo2 = c.get('foo');
    
    assert.isTrue(86 === foo1.param, "Should retrieve the 'foo' service.");
    assert.isTrue(foo1 === foo2, "References to multiple 'foo' services should be the same.");
  });
  
  it("Container.extend should throw error if extending non-existing service", function() {
    var c = new Container();
    assert.throw(function() {
      c.extend('foo', function(service, c) {
        service.param = ':(';
      });
    });
  });
  
  it("Container.extend should allow extending service definitions", function() {
    var c = new Container();
    c.share('foo', function(c) {
      return new Service(c.get('bar'));
    });
    c.set('bar', 23);
    c.set('qux', 100);
    c.extend('foo', function(service, c) {
      service.anotherParam = 500;
    });
    c.extend('foo', function(service, c) {
      service.param = c.get('qux');
    });
    
    var s = c.get('foo');

    assert.isTrue(100 === s.param);
    assert.isTrue(500 === s.anotherParam);
  });
  
  it("Container.factory should set and get new instances for factory services", function() {
    var c = new Container();
    c.factory('foo', function(c) {
      return new Service(c.get('bar'));
    });
    c.set('bar', 40);
    
    var s1 = c.get('foo');
    var s2 = c.get('foo');
    assert.isTrue(40 === s1.param);
    assert.isTrue(40 === s2.param);
    assert.isFalse(s1 === s2);
  });
  
  it("Container.protect should set and get protected functions as services", function() {
    var c = new Container();
    c.protect('sum', function(a, b) { return a+b; });
    
    var sum = c.get('sum');
    
    assert.isTrue(5 == sum(2, 3));
  });

  it("Container.get should detect circular references");
  
});
