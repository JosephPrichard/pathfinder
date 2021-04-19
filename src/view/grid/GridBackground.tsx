import React from 'react';
import {Node} from '../../pathfinding/algorithms/Node';
import {Point} from '../../pathfinding/core/Components';

interface Arrow {
    to: Point,
    from: Point
}

interface IProps {
    tileWidth: number,
    tilesX: number,
    tilesY: number
}

const CLOSED_NODE = 'rgb(198, 237, 238)';
const OPEN_NODE = 'rgb(191, 248, 159)';
const EMPTY_NODE = 'white';
const ARROW_COLOR = 'rgb(153,153,153)';

const BASE_WIDTH = 27;

class GridBackground extends React.Component<IProps>
{
    /**
     * Represents the state of the component
     * Stored outside of State to prevent copies, allowing
     * updates with forceUpdate to improve App performance
     */
    private visualization: string[][];
    private arrows: Arrow[];

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
     * Visualize generation without updating UI
     * @param generation
     */
    visualizeGeneration = (generation: Node) => {
        this.doGeneration(generation, this.visualization);
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
     * Perform an arrow generation
     * @param generation
     */
    private doArrowGeneration = (generation: Node) => {
        //modify state directly to improve performance
        const point = generation.tile.point;
        for(const node of generation.children) {
            const childPoint = node.tile.point;
            const newArrow = {
                from: point,
                to: childPoint,
            };
            //remove a duplicate arrow to indicate replacement
            //in A* for example, we could have re-discovered a better path to a tile
            for(let i = 0; i < this.arrows.length; i++) {
                const a = this.arrows[i];
                if(pointsEqual(a.to, newArrow.to)) {
                    const index = this.arrows.indexOf(a);
                    this.arrows.splice(index, 1);
                    i--;
                }
            }
            this.arrows.push(newArrow);
        }
    }

    /**
     * Add arrow generation without updating UI
     * @param generation
     */
    addArrowGeneration = (generation: Node) => {
        this.doArrowGeneration(generation);
    }

    /**
     * Add arrow generations and update UI
     * @param generations
     */
    addArrowGenerations = (generations: Node[]) => {
        this.arrows = [];
        for(const generation of generations) {
            this.doArrowGeneration(generation)
        }
        this.forceUpdate();
    }

    render() {
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
            arrows.push(<line key={'arrow ' + i}
                              x1={firstX + offset + offsetX}
                              y1={firstY + offset + offsetY}
                              x2={secondX + offset - offsetX}
                              y2={secondY + offset - offsetY}
                              stroke={ARROW_COLOR}
                              strokeWidth={2 * this.props.tileWidth/BASE_WIDTH}
                              className='line-arrow'
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

function pointsEqual(point1: Point, point2: Point) {
    return point1.x === point2.x && point1.y === point2.y;
}

export default GridBackground;