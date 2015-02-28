
/**
 * This is the constructor for a helper class which defines the co-ordinates of a pixilated hexagon
 * Assists in drawing a hexagonal grid, with a consistent look and crisp horizontal/vertical line placement
 * Converts from hexagonal co-ordinates to pixel co-ordinates and back
 * The difficulty this class is intended to encapsulate is that HTML canvas co-ordinates are between pixels. If line width is odd, need to add .5 to draw crisp lines
 * @constructs
 * @param edgeSize { integer } - The number of integer pixels in a side. Due to canvas co-ordinates (between pixels)
 *            the math works best to have an odd edgeSize for odd width edges, and even for even
 * @param vScale { number } - The amount to scale by to provide an oblique perspective to the grid, need to calculate here because of twiddle factor
 */
function hexDefinition(edgeSize, vScale) {

    //http://www.gamedev.net/page/resources/_/technical/game-programming/coordinates-in-hexagon-based-tile-maps-r1800
    //and
    //http://www-cs-students.stanford.edu/~amitp/game-programming/grids/
    
    this.twiddle = (edgeSize % 2) ? 0.5 : 0; //0 if even, 0.5 if odd
    this.vScale = vScale;
    this.edgeSize = edgeSize;
    this.s = edgeSize;

    this.h = Math.sin(30 * Math.PI / 180) * edgeSize; //The height of the triangles, if the hex were composed of a rectangle with triangles on top and bottom

    this.r = Math.cos(30 * Math.PI / 180) * edgeSize; //The width of the triangles, if the two previous triangles were actually composed of mirrored right angle triangles
    
    /**
     * Important value, will be added/subtracted from a Hex's center pixel co-ordinate to get 2 of the point co-ordinates
     * If edgeWidth is odd, we discount the center pixel (thus the "- this.twiddle" value)
     * The end result must be a whole number, so that the twiddle factor of the central co-ordinate remains when figuring out the point co-ordinates
     */
    this.hexagon_half_wide_width = Math.round(this.vScale*(edgeSize/2 + this.h));
    
    this.hexagon_wide_width = 2 * this.hexagon_half_wide_width; //the vertical width (hex point up), will be used to calculate co-ord conversions. Needs to be accurate to our roundings above

    this.hexagon_edge_to_edge_width = 2 * Math.round(this.r); //We need this to be a whole, even number. Will be divided by 2 and added to the central co-ordinate
    this.hexagon_scaled_half_edge_size = Math.round(this.vScale * (this.edgeSize/2)); //Need this to be a whole number. Will be added to the central co-ordinate to figure a point
    
    /**
     * This is not a measurement of a single hex. It is the y distance of two adjacent hexes in different y rows when they are oriented horizontal up
     * Used for co-ordinate conversion
     * Could be calculated as this.edgeSize + this.h, but need it accurate to our other rounded values
     */
    this.hexagon_narrow_width = this.hexagon_half_wide_width + this.hexagon_scaled_half_edge_size;  //



    /*
        Assuming Orientation of u const on the x axis, v constant on the x = -y axis (this will orient the hexes point up)
    */
    this.getPixelCoordinates = function(u, v) {
        //values pre-scaled in the calculation above
        var y = this.hexagon_narrow_width * u + this.twiddle;
        
        //this.hexagon_edge_to_edge_width is a whole, even number. Dividing by 2 gives a whole number
        var x = this.hexagon_edge_to_edge_width * (u * 0.5 + v) + this.twiddle;

        return { x: x, y: y };
    };

    /*
        Assuming Orientation of u const on the x axis, v constant on the x = -y axis (this will orient the hexes point up)
    */
    this.getReferencePoint = function(x, y) {

        var u = Math.round(y / this.hexagon_narrow_width);
        var v = Math.round(x / this.hexagon_edge_to_edge_width - u * 0.5);

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


