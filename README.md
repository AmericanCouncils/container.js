# Container.js #

A simple DI container.  Mainly inspired by [Pimple](https://github.com/fabpot/Pimple), 
though not a direct port.

## Parameters ##

Anything declared via `set` is returned directly via `get`.

```js
var container = new Container();

container.set('foo', 23);
container.set('bar', {param: 'bar'});

container.get('foo');     // 23
container.get('bar');     // {param: "bar"}
```

> Don't register functions via `set`, functions can be registered in several ways
> described below.

## Sharing instances of services ##

Services are instances of objects that are returned by the container.  When declaring a service, you
define a function that creates the service instance.  Service definition functions all receive the
instance of the container as an argument, which allows you to recursively initialize any dependencies.

You can share the same instance of a service by declaring a shared service:

```js
container.share('foo', function(c) {
  return new Service(c.get('bar'));
});

var s1 = container.get('foo');
var s2 = container.get('foo');

//s1 and s2 are the same instance
```

> Note that if you manually instantiate some "service", and then set it in the container 
> via `set`, that is effectively the same as declaring a shared service - minus the ability 
> to let other parts of your system register extensions.  Extensions are described below.

## Service factories ##

You may want to create a new instance of a service every time it is called, you can do this
via the `factory` method:

```js
container.factory('foo', function(c) {
  return new Service();
});

var s1 = container.get('foo');
var s2 = container.get('foo');

//s1 and s2 are different instances
```

## Extending a service definition ##

Sometimes a service should have additional logic or setup run before it is returned from `get`.
You can do this via the `extend` method:

```js
container.share('foo', function(c) {
  return new Service();
});

container.extend('foo', function(service, c) {
  service.callSomeMethod(c.get('some.dependency'));
  
  return service; //make sure to return the service that you've modified
});
```

## Protect ##

Occaisionally, you may want to define raw logic as a retrievable function in the container, you 
can do this via the `protect` method:

```js
container.protect('sum', function(a, b) {
  return a + b;
});

var sum = container.get('sum');

sum(2,3);   //5
```

## Inject ##

You may want to pass along a function that will be injected with the proper dependencies when called.  For 
example, this may be an event listener or callback for an asyncronous operation.  There are two ways to 
inject a function:

1. By passing an array listing the dependency names, with the function to wrap as the last argument:

```js
var callbackWithDependencies = container.inject(['service1','service2', function(dep1, dep2) {
  //... do stuff
}]);

someSubsystem.doSomethingAsync(callbackWithDependencies);
```

2. Providing a function with an `$inject` annotation:

```js
var callbackWithDependencies = function(dep1, dep2) {
  //...do stuff
};
callbackWithDependencies.$inject = ['service1','service2'];

someSubsystem.doSomethingAsync(container.inject(callbackWithDependencies));
```

