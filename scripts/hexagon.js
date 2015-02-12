
function hexDefinition(edgeSize) {

    //http://www.gamedev.net/page/resources/_/technical/game-programming/coordinates-in-hexagon-based-tile-maps-r1800
    //and
    //http://www-cs-students.stanford.edu/~amitp/game-programming/grids/
    
    this.edgeSize = edgeSize;
    this.s = edgeSize;

    this.h = Math.sin(30 * Math.PI / 180) * edgeSize;

    this.r = Math.cos(30 * Math.PI / 180) * edgeSize;

    this.b = edgeSize + 2 * this.h;

    this.a = 2 * this.r;

    this.hexagon_narrow_width = this.s + this.h;  //This is not a measurement of a single hex. It is the x distance of two adjacent hexes in different y rows when they are oriented horizontal up
    this.hexagon_wide_width = this.b; //the cross-wdith
    this.hexagon_height = this.a; //this is side to side width

    /*
        Assuming Orientation of u const on the x axis, v constant on the x = -y axis (this will orient the hexes point up)
    */
    this.getPixelCoordinates = function(u, v) {

        var y = this.hexagon_narrow_width * u;
        var x = this.hexagon_height * (u * 0.5 + v);

        return { x: x, y: y };
    };

    /*
        Assuming Orientation of u const on the x axis, v constant on the x = -y axis (this will orient the hexes point up)
    */
    this.getReferencePoint = function(x, y) {

        var u = Math.round(y / this.hexagon_narrow_width);
        var v = Math.round(x / this.hexagon_height - u * 0.5);

        return { u: u, v: v };
    }

    /**
     * Convert to Alpha co-ords (all positive, A is up, rotate clockwise)
     */
    this.convertToAlpha = function(u, v) {
        absoluteu = Math.abs(u);
        absolutev = Math.abs(v);
        var a =0;
        var b = 0;
        var c = 0;
        var d = 0;
        var e = 0;
         var f = 0;
        if (v < 0) {
            if (u < 1) {
                a = absolutev;
                f = absoluteu
            } else if (absolutev > absoluteu) {
                a = absolutev - absoluteu;
                b = Math.min(absolutev, absoluteu);
            } else {
                b = Math.min(absolutev, absoluteu);
                c = absoluteu - absolutev; 
            }
        } else {
            if (u > -1) {
                c = absoluteu;
                d = absolutev;
            } else if (absolutev > absoluteu) {
                d = absolutev - absoluteu;
                e = Math.min(absolutev, absoluteu);
            } else {
                e = Math.min(absolutev, absoluteu);
                f = absoluteu - absolutev; 
            }
        }
        return {a: a, b: b, c: c, d: d, e: e, f: f };
    }
}

function hexDistance(u1, v1, u2, v2) {
    var du = u1 - u2;
    var dv = v1 - v2;
    var dd = du + dv;
    return Math.max(Math.abs(du), Math.abs(dv), Math.abs(dd));
}


