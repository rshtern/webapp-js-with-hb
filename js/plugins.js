'use strict';
// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }

}());

// Place any jQuery/helper plugins in here.

/**
 * JS Library v0
 */

var UTILS = (function () {

    return {
        /**
         * Check if a given value is a plain Object
         *
         * @param  {*}       o Any value to be checked
         * @return {Boolean}   true if it's an Object
         */
        isObject: function (o) {
            var toString = Object.prototype.toString;
            return (toString.call(o) === toString.call({}));
        }, //end of isObject
        
        /**
         * Cross browser event handler
         *
         * @param {Object}   elm     elm on which the event will be bound
         * @param {string}   type    Event type or types (e.g. 'click', 'click input')
         * @param {Function} handler Callback function to run when event is fired
         */
        addEvent: function (elm, type, handler) {
            var types = type.split(' '),
                ieHandler;

            // Recurse if multiple event types were given
            if (types.length > 1) {
                // On each iteration, remove the first value in the array
                while (types.length) {
                    UTILS.addEvent(elm, types.shift(), handler);
                }

                return;
            }

            // Modern browsers and IE9+
            if (window.addEventListener) {
                elm.addEventListener(type, handler, false);
            // IE8
            } else if (window.attachEvent) {
                // Required for normalizing the "event" object,
                // to have the same API as addEventListener
                ieHandler = function (e) {
                    e.target = e.target || e.srcelm;
                    e.currentTarget = e.currentTarget || elm;

                    e.stopPropagation = e.stopPropagation || function () {
                        e.cancelBubble = true;
                    };

                    e.preventDefault = e.preventDefault || function () {
                        e.returnValue = false;
                    };

                    return handler.call(elm, e);
                };

                // Save a reference to the handler function with a unique key
                elm[type + handler] = ieHandler;

                // Support triggering custom events
                // Save event handlers in a special property on elm
                elm._events = elm._events || {};
                // Init event handlers array for the specific type, if doesn't exist
                if (!elm._events[type]) {
                    elm._events[type] = [handler];
                // Add another handler, unless it already exists
                } else if (elm._events[type].toString().indexOf(handler) < 0) {
                    elm._events[type].push(handler);
                }

                // Bind the event, the IE way
                elm.attachEvent('on' + type, ieHandler);
            }
        }, // end of addEvent

        /**
         * Check if Event constructors are supported
         *
         * @return {Boolean}
         */
        isModernEvent: function () {
            try {
                if (new Event('submit', {bubbles: false}).bubbles !== false) {
                    return false;
                } else if (new Event('submit', {bubbles: true}).bubbles !== true) {
                    return false;
                } else {
                    return true;
                }
            } catch (e) {
                return false;
            }
        }, // end of isModernEvent

        /**
         * Trigger an event on a specific elm
         *
         * Note:
         * - bubbles/cancelable - `false` by default (not supported in IE8)
         *
         * @param  {Object} elm      DOM Node
         * @param  {string} type     Event type (e.g. 'click', 'customEvent')
         * @param  {Object} options  Options object (e.g. bubbles, cancelable)
         */
        emitEvent: function (elm, type, options) {
            var evt,
                bubbles,
                cancelable,
                // Will be used as a fallback event object for IE8
                eFallback;

            // Support Event options
            options = options || {};
            bubbles = options.bubbles !== undefined ? options.bubbles : false;
            cancelable = options.cancelable !== undefined ? options.cancelable : false;

            // Create an event object
            // Modern browsers (except IE Any)
            if (UTILS.isModernEvent()) {
                evt = new Event(type, {
                    bubbles: bubbles,
                    cancelable: cancelable
                });
            // IE 9+
            } else if (document.createEvent) {
                evt = document.createEvent('Event');
                evt.initEvent(type, bubbles, cancelable);
            // IE 8
            } else {
                evt = document.createEventObject();
            }

            // Trigger the event
            // Modern browsers and IE9+
            if (elm.dispatchEvent) {
                elm.dispatchEvent(evt);
            // IE8
            } else if (elm.fireEvent) {
                // `fireEvent` will fail on non real events (i.e. custom events)
                try {
                    elm.fireEvent('on' + type, evt);
                } catch (e) {
                    // If we have any event handlers saved during `addEvent`
                    if (elm._events && elm._events[type]) {
                        // Support minimal Event properties
                        eFallback = {
                            target: elm,
                            currentTarget: elm
                        };

                        // Trigger all event handlers for this event type
                        for (var i = 0; i < elm._events[type].length; i++) {
                            elm._events[type][i].call(elm, eFallback);
                        }
                    }
                }
            }
        }, // end of emitEvent

        /**
         * Cross browser event removal
         *
         * @param {Object}   elm     elm on which the event should be unbound
         * @param {string}   type    Event type to unbind
         * @param {Function} handler Reference to the original callback function
         */
        removeEvent: function (elm, type, handler) {
            var handlerRef;

            if (window.removeEventListener) {
                // Modern browsers
                elm.removeEventListener(type, handler, false);
            } else if (window.detachEvent) {
                // IE8 and below
                handlerRef = elm[type + handler];

                // Make sure the handler key exists
                if (handlerRef) {
                    elm.detachEvent('on' + type, handlerRef);
                    // Remove the key from the object, prevent memory leaks
                    delete elm[type + handler];
                }
            }
        }, // end of removeEvent
        /**
         * AJAX helper function (similar to jQuery, but far from it!)
         *
         * @param {string} url     URL for the ajax request
         * @param {Object} options AJAX settings
         */
        ajax: function (url, options) {
            var xhr = new XMLHttpRequest(),
                method = 'GET',
                options = UTILS.isObject(options) ? options : {};

            // Check if "method" was supplied
            if (options.method) {
                method = options.method;
            }

            // Setup the request
            xhr.open(method.toUpperCase(), url);

            xhr.onreadystatechange = function () {
                var status;

                // If request finished
                if (xhr.readyState === 4) {
                    status = xhr.status;

                    // If response is OK or fetched from cache
                    if ((status >= 200 && status < 300) || status === 304) {
                        var res = xhr.responseText,
                            contentType = xhr.getResponseHeader('Content-Type');

                        // If server sent a content type header, handle formats
                        if (contentType) {
                            // Handle JSON format
                            if (contentType === 'text/json' ||
                                contentType === 'application/json') {

                                // JSON throws an exception on invalid JSON
                                try {
                                    res = JSON.parse(res);
                                } catch (err) {
                                    // Trigger "fail" callback if set
                                    if (options.fail) {
                                        options.fail.call(xhr, err);
                                        return;
                                    }
                                }
                            // Handle XML format
                            } else if (contentType === 'text/xml' ||
                                contentType === 'application/xml') {
                                // responseXML returns a document object
                                res = xhr.responseXML;

                                // if XML was invalid, trigger fail callback
                                if (res === null && options.fail) {
                                    options.fail.call(xhr, 'Bad XML file');
                                    return;
                                }
                            }
                        }

                        // Trigger done callback with the proper response
                        if (options.done) {
                            options.done.call(xhr, res);
                        }
                    }

                }
            };

            // Fire the request
            xhr.send(null);
        },

        selectOneElem: function(string){
            return document.querySelector(string);    
        },

        selectAllElem: function(string){
            return document.querySelectorAll(string);    
        },
        resetClass: function(elm, className, classChange){
            for(var i = 0; i < elm.length; i++){
                // if li has class active remove and set the selected li to be active
                if(elm[i].classList[0] === className){
                    elm[i].setAttribute('class', classChange);
                }
            }
        }, // end of has class helper
        hasClass: function(elm, className){
            for(var i = 0; i < elm.classList.length; i++){
                if(elm.classList[i] === className){
                    // console.log('element has the class of ' + className);
                    return true;
                }
            }
        }, // end of has class helper
        addClass: function(elm, addedClass){
            elm.setAttribute('class', elm.classList + " " + addedClass);
        }, // end of add class helper
        removeClass: function(elm, removedClass){
            elm.classList.remove(removedClass);
        },
        multiAddClass: function(elm, addedClass){
            for(var i=0; i<elm.length; i++){
                elm[i].setAttribute('class', elm.classList + " " + addedClass);      
            }
        },
        multiRemoveClass: function(elm, removedClass){
            for(var i=0; i<elm.length; i++){
                elm[i].classList.remove(removedClass);      
            }
        },
        // a simple workaround to prevent hash jump by Lea Verou: 
        // http://lea.verou.me/2011/05/change-url-hash-without-page-jump/
        hashHelper : function(hashChange){
            if(history.pushState) {
                history.pushState(null, null, hashChange);
            }
            else {
                location.hash = hashChange;
            }
        }, // end of hash helper
        
        cookieHandler: (function(){
            return {
                set: function(cookieName, cookieVal, expDate){
                    var d = new Date();
                    d.setTime(d.getTime() + (expDate*24*60*60*1000));
                    var expires = 'expires=' + d.toUTCString();
                    document.cookie = cookieName + '=' + cookieVal + '; ' + expires;        
                },
                get: function(cookieName){
                    var name = cookieName + "=",
                    cookieData = document.cookie.split(';');

                    for(var i=0; i<cookieData.length; i++) {
                        var c = cookieData[i];
                        while (c.charAt(0)==' ') c = c.substring(1);
                        if (c.indexOf(name) == 0) {
                            console.log(c.substring(name.length, c.length));
                            return JSON.parse(c.substring(name.length, c.length));
                        }
                    }
                    return null;
                },
                check: function(){
                    var data = this.get('data');
                    if (data !== null) {
                        return data;
                    } else {
                        // if no data set return null
                        return null;
                    }
                }
            }
        })() // end of cookieHandler
    }; // end of return

}());