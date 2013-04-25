angular.module('logmod', []).service('l', function() {
    
    // adapted from https://gist.github.com/bgrins/5108712
    
    var exports = {};

    exports.log = (function() {
        var noop = function() {};

        var log;
        log = (window.console === undefined) ? noop
            : (Function.prototype.bind !== undefined) ? Function.prototype.bind.call(console.log, console)
            : function() { Function.prototype.apply.call(console.log, console, arguments); };

        return log;

    })();

    return exports;
    
});