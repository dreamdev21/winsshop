/**
* Copyright (c) 2012 Jhonatan Salguero (www.novatoz.com)
*/
;(function() {
var abs = Math.abs;

/* check if a piece is in the right place */
function check_position(f1, f2) {
    // test rapido
    if (f1.rotation%360 || f2.rotation%360 || f2.hide || f1.hide || 
        (f1.row != f2.row && f1.col != f2.col)) { return; }

    var diff_x = f1.tx - f2.tx,
        diff_y = f1.ty - f2.ty,
        diff_col = f1.col - f2.col,
        diff_row = f1.row - f2.row,
        s = f1.size;

    if (((diff_col == -1 && diff_x < 0 && abs(diff_x+s) < 10) || 
        (diff_col == 1 && diff_x >= 0 && abs(diff_x-s) < 10))
        && (diff_y <= 10 && diff_y >= -10)) {
        return [f1.col > f2.col ? -abs(diff_x)+s : abs(diff_x)-s, f2.ty-f1.ty];

    } else if (((diff_row == -1 && diff_y < 0 && abs(diff_y+s) < 10) ||
                (diff_row == 1 && diff_y >= 0 && abs(diff_y-s) < 10))
                 && (diff_x <= 10 && diff_x >= -10)) {
        return [f2.tx-f1.tx, f1.row > f2.row ? -abs(diff_y)+s : abs(diff_y)-s];
    }
}

var Piece = Cevent.Rect.extend({
    type: "piece",

    /* edges is an array like ["inside", "outside", null, "inside"]*/
    init: function(x, y, img, size, edges) {
        this._super(x, y);
        var half_s = size / 2;
        this.img = img;
        this.size = size;
        this.edges = edges;
        
        // Change origin to center
        this.tx = this.x + half_s;
        this.ty = this.y + half_s;
        this.x = -half_s;
        this.y = -half_s;
    },
    
    /* draw piece path */
    draw_path: function(ctx) {
    },
    
    /* pre draw piece */
    render: function(ox, oy) {
        this.ox = ox;
        this.oy = oy;
        this.tx += this.offset;
    },
    
    /**/
    draw: function(ctx) {
        if (this.hide) { return; }
        var half_size = this.size / 2 - .5;

        this.setTransform(ctx);

        ctx.drawImage(this.img, this.col*this.size+this.ox, this.row*this.size+this.oy, this.size, this.size, this.x, this.y, this.size, this.size);
    },
    
    /* check position */
    check: function(other) {
        var r;
        if (other.type == "piece") {
            r = check_position(this, other);
        } else {
            var i, l = other.pieces.length;
            for (i = 0; i < l; i++) {
                if (r = check_position(this, other.pieces[i])) { break; };
            }
        }
        if (r) { this.rmove(r[0], r[1]); }
        return r;
    },
    
    /* is mouse over this piece? */
    hitTest: function(point) {
        if (this.hide) { return; }
        var pos = this.position();
        //console.log(pos.x, pos.y, point.x, point.y)
        this.w = this.h = this.size;
        return this._super(point);
    }
}),

Group = Cevent.Shape.extend({
    type: "group",
    
    init: function() {
        this.pieces = [];
        this._super(0, 0);
    },
    
    draw: function(ctx) {
        if (this.hide) { return; }

        var i, l = this.pieces.length;
        for (i = 0; i < l; i++) {
            this.pieces[i].draw(ctx);
        }
    },
    
    /* check every piece in this group */
    hitTest: function(point) {
        var i, l = this.pieces.length;
        for (i = 0; i < l; i++) {
            if (this.pieces[i].hitTest(point)){
                return true;
            }
        }
    },
    
    check: function(other) {
        var i, l = this.pieces.length, r;
        if (other.type == "piece") {
            for (i = 0; i < l; i++) {
                if (r = check_position(this.pieces[i], other)) { 
                    this.rmove(r[0], r[1]);
                    return true;
                }
            }
        } else {
            var j, l2 = other.pieces.length;
            for (i = 0; i < l; i++) {
                for (j = 0; j < l2; j++) {
                    if (r = check_position(this.pieces[i], other.pieces[j])) {
                        this.rmove(r[0], r[1]);
                        return true;
                    }
                } 
            }
        }

    },
    
    /* move each piece */
    rmove: function(x, y) {
        var i, l = this.pieces.length;
        for (i = 0; i < l; i++) { this.pieces[i].rmove(x, y); }
    },
    
    /* add new piece or merge with another group */
    add: function() {
        this.pieces = this.pieces.concat.apply(this.pieces, arguments);
    }
});

/* Register objects in canvas-event framework */
Cevent.register("group", Group);
Cevent.register("piece", Piece);
}())
