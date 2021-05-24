import TerrainRandomGenerator from '../algorithms/TerrainRandomGenerator';
import TerrainMazeGenerator from '../algorithms/TerrainMazeGenerator';
import {createTileData, Point, TileData} from '../core/Components';

export const MAZE = 0;
export const MAZE_VERTICAL_SKEW = 1;
export const MAZE_HORIZONTAL_SKEW = 2;
export const RANDOM_TERRAIN = 3;

class TerrainGeneratorBuilder
{
    private width: number = 0;
    private height: number = 0;
    private type: number = MAZE;
    private ignore: Point[] = [];
    private data: TileData = createTileData(true);

    setDimensions(width: number, height: number) {
        this.width = width;
        this.height = height;
        return this;
    }

    setGeneratorType(type: number) {
        this.type = type;
        return this;
    }

    setIgnorePoints(ignore: Point[]) {
        this.ignore = ignore.slice();
        return this;
    }

    setTileData(data: TileData) {
        this.data = data;
        return this;
    }

    /**
     * Builds a terrain generator with the specified type
     */
    build() {
       if(this.type >= RANDOM_TERRAIN) {
           return new TerrainRandomGenerator(this.width, this.height, this.data, this.ignore);
       } else {
           return new TerrainMazeGenerator(this.width, this.height, this.data, this.ignore, this.type);
       }
    }
}

export default TerrainGeneratorBuilder;