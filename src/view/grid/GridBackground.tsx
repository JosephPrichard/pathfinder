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
const ARROW_COLOR = 'rgb(153,153,153)';

class GridBackground extends React.Component<IProps>
{
    /**
     * Represents the state of the component
     * Stored outside of State to prevent copies, allowing
     * updates with forceUpdate to improve App performance
     */
    private visualization: string[][];
    private arrows: {to: Point, from: Point}[];

    private readonly width: number;
    private readonly height: number;

    private renderKey: number = 0;

    /**
     * Constructs a GridBackground with immutable height and width
     * @param props
     */
    constructor(props: IProps) {
        super(props);
        this.width = this.props.tilesX;
        this.height = this.props.tilesY;
        this.visualization = this.createEmptyBg();
        this.arrows = []
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
        this.arrows = [];
        this.forceUpdate();
    }

    /**
     * Perform a generation on a visualization array
     * @param generation
     * @param visualization
     */
    private doGeneration = (generation: Node, visualization: string[][]) => {
        //modify state directly to improve performance
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
        this.doGeneration(generation, this.visualization);
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

    /**
     * Perform an arrow generation on an arrows array
     * @param generation
     * @param arrows
     */
    private doArrowGeneration = (generation: Node, arrows: {to: Point, from: Point}[]) => {
        //modify state directly to improve performance
        const point = generation.tile.point;
        for(const node of generation.children) {
            const childPoint = node.tile.point;
            arrows.push({
                from: point,
                to: childPoint,
            });
        }
        return arrows;
    }

    /**
     * Add arrow generation without updating UI
     * @param generation
     */
    addArrowGeneration = (generation: Node) => {
        this.doArrowGeneration(generation, this.arrows);
    }

    /**
     * Add arrow generations without updating UI
     * @param generations
     */
    addArrowGenerations = (generations: Node[]) => {
        this.arrows = [];
        for(const generation of generations) {
            this.doArrowGeneration(generation, this.arrows)
        }
        this.forceUpdate();
    }

    render() {
        this.renderKey++;
        return (
            <div>
                <div className='bg'>
                    {this.renderTiles()}
                </div>
                <svg xmlns='http://www.w3.org/2000/svg' className='grid'>
                    <defs>
                        <marker id='arrowhead' markerWidth='3' markerHeight='3'
                                refX='0' refY='1.5' orient='auto'
                                fill={ARROW_COLOR}
                        >
                            <polygon points='0 0, 3 1.5, 0 3'/>
                        </marker>
                    </defs>
                    {this.renderArrows()}
                </svg>
            </div>
        );
    }

    private renderArrows = () => {
        const width = this.props.tileWidth;
        const offset = width/2;
        const arrows: JSX.Element[] = [];
        for(let i = 0; i < this.arrows.length; i++) {
            //calculate arrow position and dimensions
            const arrow = this.arrows[i];
            const first = arrow.from;
            const second = arrow.to;
            const firstX = first.x * width;
            const firstY = first.y * width;
            const secondX = second.x * width;
            const secondY = second.y * width;
            const offsetX = (secondX - firstX)/4;
            const offsetY = (secondY - firstY)/4;
            //generate a key for arrow that unique within the arrows array and across all possible arrow arrays
            const key = 'arrow ' + i + ',' + this.renderKey;
            //create arrow
            arrows.push(<line key={key}
                              x1={firstX + offset + offsetX}
                              y1={firstY + offset + offsetY}
                              x2={secondX + offset - offsetX}
                              y2={secondY + offset - offsetY}
                              stroke={ARROW_COLOR} strokeWidth='2' className='line-arrow'
                              markerEnd='url(#arrowhead)' />);
        }
        return arrows;
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