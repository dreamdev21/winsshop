;(function(){
"use strict";
    window.Util = {
        randint: function(n) {
            return ~~(Math.random()*n);
        }
    }
    
    if (!("bind" in Function)) {
        Function.prototype.bind = function(context) {
            var self = this;
            return function() { return self.apply(context, arguments); }
        }
    }
    
    var $ = Class.extend({
        init: function(id) {
            this.elem = document.getElementById(id);
        }
    });
    
    var addEvent = (function(elem, event, callback) {
        if (document.addEventListener) {
            return function(elem, type, callback) {
                elem.addEventListener(type, callback, false);
            }
        } else {
            return function(elem, type, callback) {
                elem.attachEvent("on"+type, function(e) {
                    e = e || event;
                    e.preventDefault = e.preventDefault || function() { this.returnValue = false; };
                    e.stopPropagation = e.stopPropagation || function() { this.cancelBubble = true; };
                    return callback.call(e.target || e.srcElement, e);
                });
            }
        }
    }());
    
    var events = ("mousemove mouseover mouseout mousedown mouseup click touchstart "+
                 "dblclick focus blur submit change").split(" ");

    for (var i = 0; i < events.length; i++) {
        var event = events[i];

        $.prototype[event] = function(event) {
            return function(selector, fn) {
                if (typeof(selector) == "function") {
                    addEvent(this.elem, event, selector);
                
                } else { // Event delegation
                    addEvent(this.elem, event, function(e){
                        var elem = e.target || e.srcElement;
                        if (elem.tagName.toLowerCase() == selector) {
                            e.stopPropagation();
                            fn.call(elem, e);
                        }
                    }, false);
                }
            }
        }(event);
    }
    
    Util.fullScreen = function () {
        if (document.documentElement.scrollHeight<window.outerHeight/window.devicePixelRatio) {
            document.body.style.height = (window.outerHeight/window.devicePixelRatio)+1+"px";
            setTimeout(function(){ window.scrollTo(1, 1); }, 0);
        } else {
            window.scrollTo(1, 1);
        }
    };
    
    Util.getContext = function(canvas) {
        if (!canvas.getContext && window.G_vmlCanvasManager) {
            G_vmlCanvasManager.initElement(canvas);
        }
        return canvas.getContext("2d");
    };
    
    /* merge tow objects */
    Util.extend = function(orig, obj) {
        var attr;
        for (attr in obj) {
            if (obj.hasOwnProperty(attr) && !(attr in orig)) {
                orig[attr] = obj[attr];
            }
        }
        return orig;
    };
    
    /* In How many pieces can be split a given image */
    Util.calcPieces = function(img, tmpl) {
        /* Aprox. size */
        var w = img.width,
            h = img.height,
            options = [],
            select = document.getElementById("set-parts"),
            selected = select.selectedIndex,
            option,
            size,
            cols,
            rows,
            parts;
            

        select.innerHTML = "";

        // TODO: DRY
        for (var i = 10; i <= 100; i+=10) {
            var size = ~~Math.sqrt(w * h / i),
                cols = ~~(w / size),
                rows = ~~(h / size);
            
            while (cols*rows < i) {
                size--;
                cols = ~~(w/size);
                rows = ~~(h/size);
            }
            
            if (parts != cols*rows) {
                parts = cols*rows;
                option = document.createElement("option");
                option.value = i;
                option.innerHTML = tmpl.replace("%d", parts);
                select.appendChild(option);
            }
        }
        select.selectedIndex = selected >= 0 ? selected : 0;
    };
    
    Util.addEvent = addEvent;
    
    Util.$ = function() {
        var _ = $();
        return function(id) {
            _.elem = document.getElementById(id);
            return _;
        }
    }();
}());
