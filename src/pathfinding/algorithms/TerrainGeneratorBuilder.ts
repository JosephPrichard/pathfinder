import RandomTerrainGenerator from './RandomTerrainGenerator';
import MazeGenerator from './MazeGenerator';
import {Point} from '../core/Components';

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

    /**
     * Builds a terrain generator with the specified type
     */
    build() {
       if(this.type >= RANDOM_TERRAIN) {
           return new RandomTerrainGenerator(this.width, this.height, this.ignore);
       } else {
           return new MazeGenerator(this.width, this.height, this.ignore, this.type);
       }
    }
}

export default TerrainGeneratorBuilder;