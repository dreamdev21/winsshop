/**
* Copyright (c) 2012 Jhonatan Salguero (http//www.novatoz.com)
*/
;(function() {
"use strict";
var $ = function(id) { return document.getElementById(id); },
    uuid = 0,
    deviceRatio = window.devicePixelRatio || 1;

jigsaw.UI = Class.extend({
    init: function(eventBus, parts) {
        var self = this;
        
        this.eventBus = eventBus;
        this.clock = $("clock");
        $("set-parts").value = parts;

        // iniciar eventos
        init_events(this, eventBus);

        eventBus.on(jigsaw.Events.JIGSAW_SHUFFLE, this.init_clock.bind(this));
        eventBus.on(jigsaw.Events.SHOW_PREVIEW, this.show_preview.bind(this));
        eventBus.on(jigsaw.Events.SHOW_HELP, this.show_help.bind(this));
        eventBus.on(jigsaw.Events.SHOW_FILEPICKER, this.show_filepicker.bind(this));
    },
    
    /* stop timer */
    stop_clock: function() { 
        uuid++;
    },
    
    /* init timer */
    init_clock: function() {
        var self = this;
        this.ini = new Date().getTime();
        this.uuid = uuid;
        /* update timer */
        ;(function F(){
            if (self.uuid == uuid) {
                self.clock.innerHTML = self.time();

                setTimeout(F, 1000);
            }
        }());
    },
    
    /* show preview */
    show_preview: function() {
        var canvas = $("image-preview");
        canvas.className = canvas.className == "show" ? "hide" : "show";
        canvas.style.marginLeft = -(canvas.width/2/deviceRatio) + "px";
    },
    
    show_time: function() {
        this.show_modal("congrat");
        $("time").innerHTML = this.clock.innerHTML;
        $("time-input").value = this.clock.innerHTML;
    },
    
    time: function() {
        var t = ~~((new Date().getTime() - this.ini)/1000),
            s = t%60,
            m = ~~(t/60),
            h = ~~(m/60);
            m %= 60;
        return (h > 9 ? h : "0" + h) + ":" +
               (m > 9 ? m : "0" + m%60) + ":" +
               (s > 9 ? s : "0" + s);
    },
    
    show_modal: function(id) {
        game.Modal.open(id);
    },
    
    show_filepicker: function() {
        this.show_modal("create-puzzle");
    },
    
    show_help: function() {
        this.show_modal("help");
    }
});

/* interface events */
function init_events(self, eventBus) {
    function handleFiles(files) {
        var file = files[0]; // use the first file
        
        // file needs to be an image
        if (!file.type.match(/image.*/)) {
            $("image-error").style.display = "block";
            return;
        }

        var reader = new FileReader();

        // on read: change image
        reader.onloadend = function(e) {
            eventBus.emit(jigsaw.Events.JIGSAW_SET_IMAGE, this.result);
            close_lightbox();
        }

        reader.readAsDataURL(file);
    }

    // if FileReader exists
    if (window.FileReader && new FileReader().onload === null) {
        // show create button
        $("create").style.display = "block";
        
        Util.$("image-input").change(function() {
            handleFiles(this.files);
        });
    
        // If drag event exists
        if ("ondragenter" in window && "ondrop" in window) {
            // show dnd message
            $("dnd").style.display = "block";
            
            document.addEventListener("dragenter", function(e){
                e.stopPropagation();
                e.preventDefault();
                return false;
            }, false);

            document.addEventListener("dragover", function(e){
                e.stopPropagation();
                e.preventDefault();
                return false;
            }, false);
                
            document.addEventListener("drop", function(e){
                e.stopPropagation();
                e.preventDefault();
              
                var dt = e.dataTransfer;
                handleFiles(dt.files);
            }, false);
        }
    }


    function close_lightbox() {
        game.Modal.close();
        return false;
    }

    Util.$("set-parts").change(function(){
        eventBus.emit(jigsaw.Events.PARTS_NUMBER_CHANGED, +this.value);
        eventBus.emit(jigsaw.Events.RENDER_REQUEST);
    });

    Util.$("game-options")[Cevent.isTouchDevice?"touchstart":"click"]("a", function(e){
        if (jigsaw.Events[this.id]){
            e.preventDefault();
            eventBus.emit(jigsaw.Events[this.id]);
        }
    });
}
}());
