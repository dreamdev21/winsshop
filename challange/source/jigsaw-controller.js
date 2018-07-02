/**
* Copyright (c) 2012 Jhonatan Salguero (http://www.novatoz.com)
*/
;(function() {
"use strict";
    var IN = "inside",
        OUT = "outside",
        NONE = null,
        DEFAULT_IMAGE,
        EDGES = [IN, OUT],
        uuid = 0,
        default_opts = {
            spread: .7,
            offsetTop: 0,
            maxWidth: 705,
            maxHeight: 470,
            defaultImage: "images/puzzle/scottwills_meercats.jpg",
            piecesNumberTmpl: "%d Pieces",
            redirect: "",
            border: true,
            defaultPieces: 10,
            shuffled: false,
            rotatePieces: true
        },
    
    TOOLBAR_HEIGHT = 45,
    docElement = document.documentElement,
    pixelRatio = window.devicePixelRatio || 1;

    function random_edge() { return EDGES[Util.randint(2)]; }
    
    function $(id) { return document.getElementById(id); }
    
    /* Namespace */
    window.jigsaw = {};
  
jigsaw.Jigsaw = Class.extend({
    
    init: function(opts) {
        var eventBus = new EventEmitter(),
            self = this;
        
        this.opts = opts = Util.extend(opts || {}, default_opts);
        this.max_width = opts.maxWidth;
        this.max_height = opts.maxHeight;
        $("redirect-form").action = opts.redirect;
        
        DEFAULT_IMAGE = opts.defaultImage;

        // Instance attrib
        this.eventBus = eventBus;
        this.ce = new Cevent("canvas");
        this.ui = new jigsaw.UI(eventBus, opts.defaultPieces || 10);
        this.tmp_img = document.createElement("img");

        this.img = document.getElementById("image");
        this.ctx = Util.getContext(this.img);
        this.preview = document.getElementById("image-preview");
        this.previewCtx = Util.getContext(this.preview);
        this.parts = opts.defaultPieces || 10;
        
        /* Render jigsaw */
        this.tmp_img.onload = function() {
            self.original = this;
            self.max_width = this.width;
            self.max_height = this.height;
            self.draw_image(this);
            Util.calcPieces(self.img, self.opts.piecesNumberTmpl, self.parts);
            self.render();
        }
        
        /* Render jigsaw */
        this.tmp_img.onerror = function() {
            if (DEFAULT_IMAGE) { self.set_image(DEFAULT_IMAGE); }
        }
        
        jigsaw_events(this.ce, eventBus, this.opts.rotatePieces);
        
        eventBus.on(jigsaw.Events.JIGSAW_COMPLETE, function(){
            self.ui.stop_clock();
            // redirect an send time
            if (opts.redirect) {
                self.redirect();
            // just show time
            } else {
                self.ui.show_time();
            }
        });

        // Event handlers
        if (opts.shuffled) {
            eventBus.on(jigsaw.Events.RENDER_FINISH, this.shuffle.bind(this));
        }
        eventBus.on(jigsaw.Events.PARTS_NUMBER_CHANGED, this.set_parts.bind(this));
        
        eventBus.on(jigsaw.Events.RENDER_REQUEST, this.render.bind(this));
        
        eventBus.on(jigsaw.Events.JIGSAW_SHUFFLE, this.shuffle.bind(this));
        
        eventBus.on(jigsaw.Events.JIGSAW_SET_IMAGE, this.set_image.bind(this));
        
        eventBus.on(jigsaw.Events.SHOW_EDGE, function(){
            self.ce.find("#middle").attr("hide", true);
            self.ce.find("#edge").attr("hide", false);
            self.ce.redraw();
        });
        
        eventBus.on(jigsaw.Events.SHOW_MIDDLE, function(){
            self.ce.find("#middle").attr("hide", false);
            self.ce.find("#edge").attr("hide", true);
            self.ce.redraw();
        });
        
        eventBus.on(jigsaw.Events.SHOW_ALL, function(){
            self.ce.find("*").attr("hide", false);
            self.ce.redraw();
        });

        Util.addEvent(window, "resize", this.resize.bind(this));
        
        this.resize();
        this.set_image();
    },
    
    resize: function resizeView() {
        var canvas = this.ce.cv,
            maxWidth = docElement.clientWidth,
            maxHeight= docElement.clientHeight - TOOLBAR_HEIGHT;

        canvas.width  = maxWidth * pixelRatio;
        canvas.height = maxHeight * pixelRatio;
        canvas.style.width  = maxWidth  + "px";
        canvas.style.height = maxHeight + "px";
        this.ce.redraw();

        if (Cevent.isTouchDevice) {
            Util.fullScreen();
        }
    },
    
    redirect: function() {
        $("t").value = this.ui.time();
        $("p").value = this.parts;
        $("redirect-form").submit();
    },
    
    /* number of puzzle pieces */
    set_parts: function(n) {
        this.parts = n;
    },
    
    /* change image src */
    set_image: function(src) {
        this.ce.cv.className = "loading";
        this.tmp_img.src = src || DEFAULT_IMAGE;
    },
    
    /* scale image if need */
    draw_image: function(img, w, h) {
        var max_w = w || this.max_width * pixelRatio,
            max_h = h || this.max_height * pixelRatio,
            width, height, ctx = this.ctx;
            
        if (max_w > window.innerWidth || max_h > window.innerHeight-50)
        {
            var ratio = Math.min(window.innerWidth/max_w, (window.innerHeight-50)/max_h);
            max_w *= ratio;
            max_h *= ratio;
        }
        
        /* scale image */
        if (img.width > max_w || img.height > max_h) {
            var rate = Math.min(max_w / img.width, max_h / img.height);
            width = ~~(img.width*rate) * pixelRatio;
            height = ~~(img.height*rate) * pixelRatio;
            ctx.canvas.width = width;
            ctx.canvas.height = height;
            
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
        } else {
            ctx.canvas.width = img.width * pixelRatio;
            ctx.canvas.height = img.height * pixelRatio;
            ctx.drawImage(img, 0, 0);
        }
    },
    
    /* clear all pieces */
    clear: function() { this.ce._shapes = []; },
    
    /* put pieces at random positions */
    shuffle: function() {
        var T = this.ce.getAll("piece");
        if (!this.__pieces) {
            return;
        } else {
            this.ce._shapes = T = this.__pieces.slice(0);
        }
        var i, l = T.length, F, s = T[0].size,
            ratio = this.opts.spread,
            width = document.documentElement.clientWidth * pixelRatio,
            height = (document.documentElement.clientHeight - 50) * pixelRatio,
            
            w = document.documentElement.clientWidth * ratio,
            h = (document.documentElement.clientHeight - 50) * ratio,
            
            padx = ~~((width-w)/2),
            pady = ~~((height-h)/2);

        for (i = 0; i < l; i++) {
            F = T[i];
            F.tx = Util.randint(w) + (F.tx%1) + padx;
            F.ty = Util.randint(h) + (F.tx%1) + pady;
            if (this.opts.rotatePieces) {
                F.rotation = Util.randint(4) * 90;
            }
        }
        //*/
        // fin de carga
        if (this.opts.shuffled) {
            this.ce.cv.className = "";
            this.ui.init_clock();
        } // already load
        this.ce.shuffled = true;
        this.ce.redraw();
    },
    
    render: function() {
        // carga hasta que se halla desarmado
        if (this.opts.shuffled) {
           this.ce.cv.className = "loading";
           this.ce.clear();
           this.ui.stop_clock();
        } else {
           this.ce.cv.className = ""; // already load
        }

        this.ce.shuffled = false;
        var top, right, bottom, left,
            current_right = [],
            last_right = [],
            w = this.img.width,
            h = this.img.height,
            
            /* Aprox. size */
            size = ~~(Math.sqrt(w * h / this.parts)),
            cols = ~~(w / size),
            rows = ~~(h / size),
            i = 0, j = 0, flag = ++uuid,
            offset;

        this.flag = flag;
        
        while (cols*rows < this.parts) {
            size--;
            cols = ~~(w/size);
            rows = ~~(h/size);
        }
        
        var width = ~~(w/cols);
        var height = ~~(h/rows);
        
        width = width % 2 ? width : width-1;
        height = height % 2 ? height : height-1;

        offset = ~~((document.documentElement.clientWidth/2) * pixelRatio - (width*cols/2));
        this.clear();
        
        var ox = ~~((w - (cols * width))/2),
            oy = ~~((h - (rows * height))/2);
            ox = ox >= 0 ? ox : 0;
            oy = oy >= 0 ? oy : 0;
           
           
        window.a=this;
        // draw preview
        this.preview.style.marginTop = this.opts.offsetTop + "px";
        this.preview.width = width*cols;
        this.preview.height = height*rows;
        this.preview.style.width = (this.preview.width/pixelRatio) + "px";
        this.preview.style.height = (this.preview.height/pixelRatio) + "px";
        this.previewCtx.drawImage(this.img, ox, oy, width*cols, height*rows, 0, 0, width*cols, height*rows);

        /* avoid blocking the browser using setTimeout */
        ;(function F() {
            if (i < cols && flag == this.flag) {
                if (j < rows) {
                    /* if side in edge is plane */
                    top = j == 0 ? NONE : bottom == IN ? OUT : IN;
                    right = i == cols - 1 ? NONE : random_edge();
                    bottom = j == rows - 1 ? NONE : random_edge();
                    left = i == 0 ? 0 : last_right[j] == IN ? OUT : IN;
                    
                    /* Create piece */
                    this.ce.piece(width * i, // x
                                  height * j + this.opts.offsetTop, // y
                                  window.G_vmlCanvasManager ? this.tmp_img : this.img, // image
                                  width,  // size
                                  height,
                                  [top, right, bottom, left] // sides
                                  )
                    .attr({col: i, row: j, offset: offset, stroke: this.opts.border ? "black" : ""})
                    .get(-1).render(ox, oy-this.opts.offsetTop);
                    
                    if (!this.opts.shuffled) { this.ce.redraw(); }
                    /* */
                    if (j == 0 || i == 0 || i == cols-1 || j == rows-1) {
                        this.ce.addId("edge");
                    } else {
                        this.ce.addId("middle");
                    }

                    // Remember right side for next iteration
                    current_right.push(right);
                    
                    // next row
                    j++;
                } else {
                    // next col
                    i++;
                    j = 0;
                    last_right = current_right;
                    current_right = [];
                }

                setTimeout(F.bind(this), 20);
                return;
            } else if (this.flag == flag) {
                this.__pieces = this.ce.get().slice(0);
                this.ce.redraw();
                this.eventBus.emit(jigsaw.Events.RENDER_FINISH);
            }
        }).bind(this)();
    }
});


// piece events
function jigsaw_events(ce, eventBus, rotate) {
    /* Drag everything */
    ce.drag("*", {
        start: function(c, e) {
            c.cv.style.cursor = "move";
            c.lastX *= pixelRatio;
            c.lastY *= pixelRatio;
            this.handleX = (c.lastX - this.tx);
            this.handleY = (c.lastY - this.ty);
        },

        move: function(c, e) {
            c.x *= pixelRatio;
            c.y *= pixelRatio;

            c.x += (c.lastX - this.tx) - this.handleX;
            c.y += (c.lastY - this.ty) - this.handleY;

            var deltaX = c.x - c.lastX,
                deltaY = c.y - c.lastY,
                newX, newY,
                pieces = this.pieces || [this],
                piece,
                width = c.cv.width,
                height = c.cv.height,
                size = pieces[0].size;
            
            for (var i = 0; i < pieces.length; i++) {
                piece = pieces[i];
                newX = piece.x + piece.tx + deltaX;
                newY = piece.y + piece.ty + deltaY;
            
                if ((newX < 0 && deltaX < 0)|| (newX+size > width && deltaX > 0))
                    c.lastX = c.x;
                if ((newY < 0 && deltaY < 0) || (newY+size > height && deltaY > 0))
                    c.lastY = c.y;
            }
        },

        /* check position */
        end: function(c, e) {
            c.cv.style.cursor = "default";
            /* just if game already started */
            if (!c.shuffled) { return; }
            
            var all = c.getAll("piece").concat(c.getAll("group")),
                i = 0, l = all.length,
                that = this;

            for (; i < l; i++) {
                if (all[i] === this) { continue };
                if (that.check(all[i])) {
                    c.remove(that);
                    c.remove(all[i]);
                    c._curHover = c.group().get(-1);
                    c._curHover
                    .add(that.pieces || that, all[i].pieces || all[i]);
                    that = c._curHover;
                    c.focused = null;
                }
            }
            /* if only one group, we ended */
            if (!ce.getAll("piece").length && ce.getAll("group").length == 1 && ce.shuffled) {
                ce.shuffled = false;
                eventBus.emit(jigsaw.Events.JIGSAW_COMPLETE);
            }
            if (that.type == "group") {
                c.remove(that);
                c._shapes.unshift(that);            
            }
        }
    })
    /* put above current piece */
    .focus("*", function(c, e){
        c.remove(this);
        c._shapes.push(this);
    });
    
    
    /* rotate with right click */
    Util.addEvent(ce.cv, "contextmenu", function(e) {
        if (rotate && ce.focused) {
            ce.focused.rotation = (ce.focused.rotation + 45) % 360;
            ce.redraw();
        }
        e.preventDefault();
    });
    
    
    if (!rotate) { return; }

    /* rotate with keyboard */
    ce.keydown("right", function() {
        if (this.focused) {
            this.focused.rotation = (this.focused.rotation + 45) % 360;
        }
        return false;
    })
    .keydown("left", function(){
        if (this.focused) {
            this.focused.rotation = (this.focused.rotation - 45) % 360;
        }
        return false;
    });
    
    /* rotate with touch event (tap) */
    ce.tap("*", function(c, e){
        if (Cevent.isTouchDevice && ce.focused) {
            ce.focused.rotation = (ce.focused.rotation + 45) % 360;
            ce.redraw();
        }
    });

}

/* add event suport */
EventEmitter.mixin(jigsaw.Jigsaw);
}());
