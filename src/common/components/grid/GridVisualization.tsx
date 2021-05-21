import React from 'react';
import {Node} from '../../pathfinding/algorithms/Node';
import {Point} from '../../pathfinding/core/Components';
import AppSettings from "../../utils/AppSettings";
import {HashTable, stringify} from '../../pathfinding/structures/Hash';

const CLOSED_NODE = 'rgb(198, 237, 238)';
const OPEN_NODE = 'rgb(191, 248, 159)';
const ARROW_COLOR = 'rgb(153,153,153)';
const EMPTY_NODE = 'e';
const TILE_CLASS = 'tile';
const VIZ_TILE_CLASS = 'tile-viz';

const BASE_WIDTH = 27;

interface Arrow {
    to: Point,
    from: Point
}

interface IProps {
    settings: AppSettings,
    tileWidth: number,
    width: number,
    height: number
}

//scores and visualization are parallel arrays
interface IState {
    visualization: string[][],
    arrows: HashTable<Arrow>
}

/**
 * Represents a visualization canvas for the background grid
 * Can be mutated using functions to change the state of the current visualization
 */
class GridVisualization extends React.Component<IProps,IState>
{
    private readonly tileWidth: number;

    private tileClass: string = TILE_CLASS;

    /**
     * Constructs a GridVisualization with immutable height and width
     * @param props
     */
    constructor(props: IProps) {
        super(props);
        this.tileWidth = this.props.tileWidth;
        this.state = {
            visualization: this.createEmptyViz(),
            arrows: new HashTable()
        }
    }

    componentDidUpdate(prevProps: Readonly<IProps>) {
        if(this.props.width !== prevProps.width
            || this.props.height !== prevProps.height)
        {
            const visualization: string[][] = this.createEmptyViz();
            for(let y = 0; y < this.props.height; y++) {
                for(let x = 0; x < this.props.width; x++) {
                    if(y < prevProps.height && x < prevProps.width) {
                        visualization[y][x] = this.state.visualization[y][x];
                    }
                }
            }
            this.setState({
                visualization: visualization
            });
        }
    }

    /**
     * Create a new empty visualization canvas
     */
    createEmptyViz() {
        const visualization: string[][] = [];
        for(let y = 0; y < this.props.height; y++) {
            const row: string[] = [];
            for(let x = 0; x < this.props.width; x++) {
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
            visualization: this.createEmptyViz(),
            arrows: new HashTable()
        });
    }

    /**
     * Perform a generation on a visualization array
     * @param generation
     * @param visualization
     */
    static doVizGeneration(generation: Node, visualization: string[][]) {
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
            visualization: GridVisualization.doVizGeneration(
                generation,
                clone(prevState.visualization)
            )
        }));
    }

    enableAnimations() {
        this.tileClass = VIZ_TILE_CLASS;
    }

    disableAnimations() {
        this.tileClass = TILE_CLASS;
    }

    /**
     * Visualize generation array and update UI
     * @param generations
     */
    visualizeGenerations(generations: Node[]) {
        const visualization = this.createEmptyViz();
        for(const generation of generations) {
            GridVisualization.doVizGeneration(generation, visualization);
        }
        this.setState({
            visualization: visualization
        });
    }

    /**
     * Perform an arrow generation on an arrow array
     * @param generation
     * @param arrows
     */
    static doArrowGeneration(generation: Node, arrows: HashTable<Arrow>) {
        const point = generation.tile.point;
        for(const node of generation.children) {
            const childPoint = node.tile.point;
            const newArrow = {
                from: point,
                to: childPoint,
            };
            //remove a duplicate arrow to indicate replacement
            //in A* for example, we could have re-discovered a better path to a tile
            arrows.add(stringify(newArrow.to), newArrow);
        }
        return arrows;
    }

    /**
     * Add arrow generation without updating UI
     * @param generation
     */
    addArrowGeneration(generation: Node) {
        this.setState(prevState => ({
            arrows: GridVisualization.doArrowGeneration(
                generation,
                prevState.arrows.clone()
            )
        }));
    }

    /**
     * Add arrow generations and update UI
     * @param generations
     */
    addArrowGenerations(generations: Node[]) {
        const arrows: HashTable<Arrow> = new HashTable();
        for(const generation of generations) {
            GridVisualization.doArrowGeneration(generation, arrows)
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
            visualization: GridVisualization.doVizGeneration(
                generation,
                clone(prevState.visualization)
            ),
            arrows: GridVisualization.doArrowGeneration(
                generation,
                prevState.arrows.clone()
            )
        }));
    }

    render() {
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
                    {this.props.settings.showArrows ?
                        this.renderArrows() :
                        []
                    }
                </svg>
            </div>
        );
    }

    renderArrows() {
        const width = this.tileWidth;
        const offset = width/2;
        const arrows: JSX.Element[] = [];
        const arrowList = this.state.arrows.values();
        for(let i = 0; i < arrowList.length; i++) {
            //calculate arrow position and dimensions
            const arrow = arrowList[i];
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
        for(let y = 0; y < this.props.height; y++) {
            const row: JSX.Element[] = [];
            for(let x = 0; x < this.props.width; x++) {
                const inBounds = (this.state.visualization[y]||[])[x] !== undefined;
                const viz = inBounds ? this.state.visualization[y][x] : EMPTY_NODE;
                if(viz !== EMPTY_NODE) {
                    const point = {
                        x: x, y: y
                    };
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
            left: left,
            fontSize: 10 * width/BASE_WIDTH
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

function clone<T>(array: T[][]) {
    return array.map(
        (arr) => arr.slice()
    );
}

export default GridVisualization;