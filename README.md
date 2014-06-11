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
container.get('qux');     // {param: "bar"}
```

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

```
container.share('foo', function(c) {
  return new Service();
});

container.extend('foo', function(service, c) {
  service.callSomeMethod(c.get('some.dependency'));
});
```

Extensions are called when a service is created, meaning that for a shared service, any given
extension will only run once when the service is initialized.  If you extend a factory service,
the extensions will run each time a new instance created.

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
