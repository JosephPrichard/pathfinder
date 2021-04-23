import {Point, Tile} from '../core/Components';
import {Grid} from '../core/Grid';
import {HashSet, stringify} from '../structures/Hash';

abstract class TerrainGenerator
{
    protected readonly width: number;
    protected readonly height: number;
    protected readonly ignore: HashSet;

    protected constructor(width: number, height: number, ignore?: Point[]) {
        this.width = width;
        this.height = height;
        this.ignore = new HashSet();
        if(ignore !== undefined) {
            for(const i of ignore) {
                this.ignore.add(stringify(i));
            }
        }
    }

    /**
     * Draws a tile to the grid
     * @param grid
     * @param tile
     */
    protected draw(grid: Grid, tile: Tile) {
        if(!this.shouldIgnore(tile.point)) {
            grid.mutateTile(tile);
        }
    }

    shouldIgnore(point: Point) {
        return this.ignore.has(stringify(point));
    }

    abstract generateTerrain(topLeft?: Point, bottomRight?: Point): Grid;
}

export default TerrainGenerator;