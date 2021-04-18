import React from 'react';
import {Node} from '../../pathfinding/algorithms/Node';
import {Point} from '../../pathfinding/core/Components';

interface IProps {
    tileWidth: number,
    tilesX: number,
    tilesY: number
}

const CLOSED_NODE = 'rgb(198, 237, 238)';
const OPEN_NODE = 'rgb(191, 248, 159)';
const EMPTY_NODE = 'white';

class GridBackground extends React.Component<IProps>
{
    /**
     * Represents the state of the component
     * Stored outside of State to prevent copies, allowing
     * updates with forceUpdate to improve App performance
     */
    private visualization: string[][];

    private readonly width: number;
    private readonly height: number;

    /**
     * Constructs a GridBackground with immutable height and width
     * @param props
     */
    constructor(props: IProps) {
        super(props);
        this.width = this.props.tilesX;
        this.height = this.props.tilesY;
        this.visualization = this.createEmptyBg();
    }

    /**
     * Create a new empty visualization canvas
     */
    createEmptyBg() {
        const visualization = [];
        for(let y = 0; y < this.height; y++) {
            const row: string[] = [];
            for(let x = 0; x < this.width; x++) {
                row.push(EMPTY_NODE);
            }
            visualization.push(row);
        }
        return visualization;
    }

    /**
     * Clear the visualization canvas and update UI
     */
    clear = () => {
        this.visualization = this.createEmptyBg();
        this.forceUpdate();
    }

    /**
     * Perform a generation on a visualization array
     * @param generation
     * @param visualization
     */
    private doGeneration = (generation: Node, visualization: string[][]) => {
        for(const node of generation.children) {
            const point = node.tile.point;
            visualization[point.y][point.x] = OPEN_NODE;
        }
        const point = generation.tile.point;
        visualization[point.y][point.x] = CLOSED_NODE;
        return visualization;
    }

    /**
     * Visualize generation and update UI
     * @param generation
     */
    visualizeGeneration = (generation: Node) => {
        this.doGeneration(generation, this.visualization); //modify state directly to improve performance
        this.forceUpdate();
    }

    /**
     * Visualize generation array and update UI
     * @param generations
     */
    visualizeGenerations = (generations: Node[]) => {
        const visualization = this.createEmptyBg();
        for(const generation of generations) {
            this.doGeneration(generation, visualization);
        }
        this.visualization = visualization;
        this.forceUpdate();
    }

    render() {
        return (
            <div className='bg'>
                {this.renderTiles()}
            </div>
        );
    }

    private renderTiles = () => {
        const tiles: JSX.Element[][] = [];
        for(let y = 0; y < this.height; y++) {
            const row: JSX.Element[] = [];
            for(let x = 0; x < this.width; x++) {
                const point = {
                    x: x, y: y
                };
                row.push(
                    this.renderTile(point, this.visualization[point.y][point.x])
                );
            }
            tiles.push(row);
        }
        return tiles;
    }

    private renderTile = (point: Point, color: string) => {
        const width = this.props.tileWidth;
        const top = point.y * this.props.tileWidth;
        const left = point.x * this.props.tileWidth;
        const style = {
            backgroundColor: color,
            width: width + 'px',
            height: width + 'px',
            top: top,
            left: left
        };
        return (
            <div key={point.x + ',' + point.y} style={style} className='tile'/>
        );
    }
}

export default GridBackground;