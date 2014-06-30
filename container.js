(function() {
  
  function Container() {
    this.defs = {};
    this.extensions = {};
  }
  
  Container.prototype = {
    
    /**
     * Get a parameter or service object by name.
     */
    get: function(key) {
      if (!this.defs.hasOwnProperty(key)) {
        throw new Error('Unknown service or parameter ['+ key +'] requested.');
      }

      var def = this.defs[key];
      
      return (def instanceof Function) ? def() : def;
    },
    
    /**
     * Set a parameter or a shared service instance.
     */
    set: function(key, def) {      
      this.defs[key] = def;
      
      return this;
    },
    
    /**
     * Define a shared service factory.
     */
    share: function(key, def) {
      var self = this;

      this.defs[key] = (function(def) {
        var instance;

        return function() {
          if (instance === undefined) {
            instance = def.call(self, self);
            
            if (!instance) {
              throw new Error('Service function for ['+key+'] did not return anything.  Did you forget a return statement?');
            }

            return self.__extend(key, instance);
          }
          
          return instance;
        };
      })(def);
      
      return this;
    },
    
    /**
     * Extend a service definition with additional logic.  Extensions are run
     * on services before they are returned from `get`.
     */
    extend: function(key, def) {
      if (!this.defs.hasOwnProperty(key)) {
        throw new Error('Tried extending an undefined service: "'+key+'".');
      }
      
      var originalDef = this.defs[key];
      
      if (!originalDef instanceof Function) {
        throw new Error('Tried extending a non service definition: "'+key+'".');
      }
      
      this.extensions[key] = this.extensions[key] || [];
      this.extensions[key].push(def);
      
      return this;
    },

    /**
     * Define a service that creates a new instance every time it is requested.
     */
    factory: function(key, def) {
      var self = this;
      
      this.defs[key] = function() {
        var instance = def.call(self, self);
        
        if (!instance) {
          throw new Error('Service function for ['+key+'] did not return anything.  Did you forget a return statement?');
        }
        
        return self.__extend(key, instance);
      };
      
      return this;
    },
    
    /**
     * Define a function as a service which should be returned as is from `get`.
     */
    protect: function(key, def) {
      this.defs[key] = function() { return def; };
      
      return this;
    },
    
    /**
     * Private.  Used for calling registered extensions on a service instance.
     */
    __extend: function(key, instance) {
      var extensions = this.extensions[key];
      if (extensions) {
        for(var i = 0; i < extensions.length; i++) {
          instance = extensions[i].call(this, instance, this);
          
          if (!instance) {
            throw new Error('An extension for ['+key+'] failed to return an instance.  Did you forget a return statement?');
          }
        }
      }
      
      return instance;
    }
  };
  
  if (typeof module !== 'undefined') {
    // export for node
    module.exports = Container;
  } else {
    // assign to window
    this.Container = Container;
  }
}).apply(this);
