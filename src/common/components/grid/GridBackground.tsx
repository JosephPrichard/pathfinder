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

interface IState {
    visualization: string[][],
    arrows: Arrow[]
}

const CLOSED_NODE = 'rgb(198, 237, 238)';
const OPEN_NODE = 'rgb(191, 248, 159)';
const ARROW_COLOR = 'rgb(153,153,153)';
const EMPTY_NODE = 'e';
const TILE_CLASS = 'tile';
const VIZ_TILE_CLASS = 'tile-viz';

const BASE_WIDTH = 27;

/**
 * Represents a visualization canvas for the background grid
 * Can be mutated using functions to change the state of the current visualization
 */
class GridBackground extends React.Component<IProps,IState>
{
    private readonly width: number;
    private readonly height: number;
    private readonly tileWidth: number;

    private tileClass: string = VIZ_TILE_CLASS;

    /**
     * Constructs a GridBackground with immutable height and width
     * @param props
     */
    constructor(props: IProps) {
        super(props);
        this.width = this.props.tilesX;
        this.height = this.props.tilesY;
        this.tileWidth = this.props.tileWidth;
        this.state = {
            visualization: this.createEmptyBg(),
            arrows: []
        }
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
    clear() {
        this.setState({
            visualization: this.createEmptyBg(),
            arrows: []
        });
    }

    /**
     * Perform a generation on a visualization array
     * @param generation
     * @param visualization
     */
    static doGeneration(generation: Node, visualization: string[][]) {
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
    visualizeGeneration(generation: Node) {
        this.setState(prevState => ({
            visualization: GridBackground.doGeneration(
                generation,
                clone(prevState.visualization)
            )
        }));
    }

    /**
     * Visualize generation array and update UI
     * @param generations
     */
    visualizeGenerations(generations: Node[]) {
        this.tileClass = TILE_CLASS;
        const visualization = this.createEmptyBg();
        for(const generation of generations) {
            GridBackground.doGeneration(generation, visualization);
        }
        this.setState({
            visualization: visualization
        }, () => this.tileClass = VIZ_TILE_CLASS);
    }

    /**
     * Perform an arrow generation on an arrow array
     * @param generation
     * @param arrows
     */
    static doArrowGeneration(generation: Node, arrows: Arrow[]) {
        const point = generation.tile.point;
        for(const node of generation.children) {
            const childPoint = node.tile.point;
            const newArrow = {
                from: point,
                to: childPoint,
            };
            //remove a duplicate arrow to indicate replacement
            //in A* for example, we could have re-discovered a better path to a tile
            for(let i = 0; i < arrows.length; i++) {
                const a = arrows[i];
                if(pointsEqual(a.to, newArrow.to)) {
                    const index = arrows.indexOf(a);
                    arrows.splice(index, 1);
                    i--;
                }
            }
            arrows.push(newArrow);
        }
        return arrows;
    }

    /**
     * Add arrow generation without updating UI
     * @param generation
     */
    addArrowGeneration(generation: Node) {
        this.setState(prevState => ({
            arrows: GridBackground.doArrowGeneration(
                generation,
                prevState.arrows.slice()
            )
        }));
    }

    /**
     * Add arrow generations and update UI
     * @param generations
     */
    addArrowGenerations(generations: Node[]) {
        const arrows: Arrow[] = [];
        for(const generation of generations) {
            GridBackground.doArrowGeneration(generation, arrows)
        }
        this.setState({
            arrows: arrows
        });
    }

    /**
     * Visualize both generation and arrows and update UI
     * @param generation
     */
    visualizeGenerationAndArrows(generation: Node) {
        this.setState(prevState => ({
            visualization: GridBackground.doGeneration(
                generation,
                clone(prevState.visualization)
            ),
            arrows: GridBackground.doArrowGeneration(
                generation,
                prevState.arrows.slice()
            )
        }));
    }

    render() {
        // console.timeEnd('time');
        // console.time('time');
        return (
            <div>
                <div className='bg'>
                    {this.renderViz()}
                </div>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='bg-grid'
                >
                    <defs>
                        <marker
                            id='arrowhead'
                            markerWidth='3'
                            markerHeight='3'
                            refX='0'
                            refY='1.5'
                            orient='auto'
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

    renderArrows() {
        const width = this.tileWidth;
        const offset = width/2;
        const arrows: JSX.Element[] = [];
        for(let i = 0; i < this.state.arrows.length; i++) {
            //calculate arrow position and dimensions
            const arrow = this.state.arrows[i];
            const first = arrow.from;
            const second = arrow.to;
            const firstX = first.x * width;
            const firstY = first.y * width;
            const secondX = second.x * width;
            const secondY = second.y * width;
            const offsetX = (secondX - firstX)/4;
            const offsetY = (secondY - firstY)/4;
            arrows.push(
                <line
                    key={'arrow ' + i}
                    x1={firstX + offset + offsetX}
                    y1={firstY + offset + offsetY}
                    x2={secondX + offset - offsetX}
                    y2={secondY + offset - offsetY}
                    stroke={ARROW_COLOR}
                    strokeWidth={2 * this.tileWidth/BASE_WIDTH}
                    className='line-arrow'
                    markerEnd='url(#arrowhead)'
                />
            );
        }
        return arrows;
    }

    renderViz() {
        const tiles: JSX.Element[][] = [];
        for(let y = 0; y < this.height; y++) {
            const row: JSX.Element[] = [];
            for(let x = 0; x < this.width; x++) {
                const point = {
                    x: x, y: y
                };
                const viz = this.state.visualization[point.y][point.x];
                if(viz !== EMPTY_NODE) {
                    row.push(
                        this.renderTile(point, viz)
                    );
                }
            }
            tiles.push(row);
        }
        return tiles;
    }

    renderTile(point: Point, color: string) {
        const width = this.tileWidth;
        const top = point.y * width;
        const left = point.x * width;
        const style = {
            backgroundColor: color,
            width: width + 'px',
            height: width + 'px',
            top: top,
            left: left
        };
        return (
            <div
                key={point.x + ',' + point.y}
                style={style}
                className={this.tileClass}
            />
        );
    }
}

function clone(array: string[][]) {
    return array.map(
        (arr) => arr.slice()
    );
}

function pointsEqual(point1: Point, point2: Point) {
    return point1.x === point2.x && point1.y === point2.y;
}

export default GridBackground;