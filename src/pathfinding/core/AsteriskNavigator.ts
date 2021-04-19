import {Point, Tile} from './Components';
import Navigator, {UNIT} from './Navigator';
import {euclidean} from '../algorithms/Heuristics';

/**
 * Concretion of a Plus Navigator for a grid
 * Allows movement akin to a 'asterisk' symbol
 */
class AsteriskNavigator extends Navigator
{
    /**
     * Adds the neighbors of a point to the left, right, top and down
     * @param point
     */
    neighbors(point: Point): Tile[] {
        //keep track of double squares that block diagonals
        let walkBottomRight = false;
        let walkTopRight = false;
        let walkBottomLeft = false;
        let walkTopLeft = false;
        //plus
        const tiles: Tile[] = [];
        if(point.x + UNIT < this.grid.getWidth()) {
            const tile = this.grid.get({
                x: point.x + UNIT,
                y: point.y
            })
            if(!tile.data.isSolid) {
                tiles.push(tile);
                walkBottomRight = true;
                walkTopRight = true;
            }
        }
        if(point.y + UNIT < this.grid.getHeight()) {
            const tile = this.grid.get({
                x: point.x,
                y: point.y + UNIT
            });
            if(!tile.data.isSolid) {
                tiles.push(tile);
                walkBottomRight = true;
                walkBottomLeft = true;
            }
        }
        if(point.x - UNIT >= 0) {
            const tile = this.grid.get({
                x: point.x - UNIT,
                y: point.y
            });
            if(!tile.data.isSolid) {
                tiles.push(tile);
                walkBottomLeft = true;
                walkTopLeft = true;
            }
        }
        if(point.y - UNIT >= 0) {
            const tile = this.grid.get({
                x: point.x,
                y: point.y - UNIT
            });
            if(!tile.data.isSolid) {
                tiles.push(tile);
                walkTopRight = true;
                walkTopLeft = true;
            }
        }
        //diagonals
        if(point.x + UNIT < this.grid.getWidth() &&
            point.y + UNIT < this.grid.getHeight() &&
            walkBottomRight) {
            const tile = this.grid.get({
                x: point.x + UNIT,
                y: point.y + UNIT
            });
            if(!tile.data.isSolid) {
                tiles.push(tile);
            }
        }
        if(point.x - UNIT >= 0 &&
            point.y + UNIT < this.grid.getHeight() &&
            walkBottomLeft) {
            const tile = this.grid.get({
                x: point.x - UNIT,
                y: point.y + UNIT
            });
            if(!tile.data.isSolid) {
                tiles.push(tile);
            }
        }
        if(point.x + UNIT < this.grid.getWidth() &&
            point.y - UNIT >= 0 &&
            walkTopRight) {
            const tile =  this.grid.get({
                x: point.x + UNIT,
                y: point.y - UNIT
            });
            if(!tile.data.isSolid) {
                tiles.push(tile);
            }
        }
        if(point.x - UNIT >= 0 &&
            point.y - UNIT >= 0 &&
            walkTopLeft) {
            const tile =  this.grid.get({
                x: point.x - UNIT,
                y: point.y - UNIT
            });
            if(!tile.data.isSolid) {
                tiles.push(tile);
            }
        }
        return tiles;
    }

    /**
     * Step cost function that works by getting the pathCost stored in the grid
     * from one point a to b
     * Returns the exact distance multiplied by the cost to travel there
     * @param a
     * @param b to point to travel to
     */
    cost(a: Point, b: Point) {
        return euclidean(a,b) * this.grid.get(b).data.pathCost;
    }

    getType() {
        return 'asterisk';
    }
}

export default AsteriskNavigator;