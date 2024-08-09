export const UNIT = 1; // number of tiles we can move at once

export interface Point {
    readonly x: number;
    readonly y: number;
}

export interface TileData {
    readonly pathCost: number;
    readonly isSolid: boolean;
}

export interface Tile {
    data: TileData;
    readonly point: Point;
}

export function createTileData(isSolid: boolean): TileData {
    return {
        pathCost: 1,
        isSolid: isSolid,
    };
}

export interface Grid {
    getWidth(): number;

    getHeight(): number;

    inBounds(point: Point): boolean;

    get(point: Point): Tile;

    isSolid(point: Point): boolean;

    mutate(point: Point, data: TileData): void;

    mutateTile(tile: Tile): void;

    mutateDefault(point: Point, solid: boolean): void;

    output(console: Console): void;

    getJson(): string;

    walkable(point: Point): boolean;

    isEmpty(point: Point): boolean;

    clone(): Grid;

    cloneNewSize(width: number, height: number): Grid;
}

export class RectGrid implements Grid {
    private readonly tiles: Tile[][];
    private readonly width: number;
    private readonly height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.tiles = createEmptyGrid(width, height);
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    inBounds(point: Point) {
        return point.x >= 0 && point.x < this.width && point.y >= 0 && point.y < this.height;
    }

    get(point: Point) {
        return {
            point: this.tiles[point.y][point.x].point,
            data: this.tiles[point.y][point.x].data,
        };
    }

    mutate(point: Point, data: TileData) {
        this.tiles[point.y][point.x].data = data;
    }

    mutateTile(tile: Tile) {
        this.tiles[tile.point.y][tile.point.x].data = tile.data;
    }

    mutateDefault(point: Point, solid: boolean) {
        this.mutate(point, createTileData(solid));
    }

    output(console: Console) {
        for (let y = 0; y < this.height; y++) {
            let str = "";
            for (let x = 0; x < this.width; x++) {
                str += this.tiles[y][x].data.isSolid + ", ";
            }
            console.log(str);
        }
    }

    getJson() {
        return JSON.stringify(this.tiles);
    }

    walkable(point: Point) {
        return !this.tiles[point.y][point.x].data.isSolid;
    }

    isSolid(point: Point) {
        return this.tiles[point.y][point.x].data.isSolid;
    }

    isEmpty(point: Point) {
        const data = this.tiles[point.y][point.x].data;
        return data.pathCost === 1 && !data.isSolid;
    }

    clone() {
        const grid = new RectGrid(this.width, this.height);
        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                const point = {
                    x: x,
                    y: y,
                };
                grid.mutateTile(this.get(point));
            }
        }
        return grid;
    }

    cloneNewSize(width: number, height: number) {
        const grid = new RectGrid(width, height);
        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                const point = {
                    x: x,
                    y: y,
                };
                if (this.inBounds(point)) {
                    grid.mutateTile(this.get(point));
                }
            }
        }
        return grid;
    }
}

function createEmptyGrid(width: number, height: number) {
    const nodes: Tile[][] = [];
    for (let y = 0; y < height; y++) {
        const row: Tile[] = [];
        for (let x = 0; x < width; x++) {
            row.push({
                point: {
                    x: x,
                    y: y,
                },
                data: createTileData(false),
            });
        }
        nodes.push(row);
    }
    return nodes;
}

export abstract class Navigator {
    protected readonly grid: Grid;

    constructor(grid: Grid) {
        this.grid = grid;
    }

    getGrid() {
        return this.grid;
    }

    equals(a: Point, b: Point) {
        return a.x === b.x && a.y === b.y;
    }

    abstract cost(a: Point, b: Point): number;

    abstract neighbors(point: Point): Tile[];

    abstract getType(): string;
}

// we only have one navigator right now, since the diagonal navigator was removed
export class PlusNavigator extends Navigator {
    neighbors(point: Point) {
        const tiles: Tile[] = [];
        if (point.x + UNIT < this.grid.getWidth()) {
            const tile = this.grid.get({ x: point.x + UNIT, y: point.y });

            if (!tile.data.isSolid) {
                tiles.push(tile);
            }
        }
        if (point.y + UNIT < this.grid.getHeight()) {
            const tile = this.grid.get({ x: point.x, y: point.y + UNIT });

            if (!tile.data.isSolid) {
                tiles.push(tile);
            }
        }
        if (point.x - UNIT >= 0) {
            const tile = this.grid.get({ x: point.x - UNIT, y: point.y });

            if (!tile.data.isSolid) {
                tiles.push(tile);
            }
        }
        if (point.y - UNIT >= 0) {
            const tile = this.grid.get({ x: point.x, y: point.y - UNIT });

            if (!tile.data.isSolid) {
                tiles.push(tile);
            }
        }
        return tiles;
    }

    // an is unused, because some kinds of navigators need both points to calculate a cost, but not for a plus movement
    cost(a: Point, b: Point) {
        return this.grid.get(b).data.pathCost;
    }

    getType() {
        return "plus";
    }
}
