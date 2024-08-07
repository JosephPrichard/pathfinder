/*
 * Copyright (c) Joseph Prichard 2022.
 */

import React from 'react';
import AppSettings from "../utils/AppSettings";
import { PointTable } from '../pathfinding/Structures';
import { Point } from '../pathfinding/Core';
import { PathNode } from '../pathfinding/Pathfinders';

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

interface Props {
    settings: AppSettings,
    tileWidth: number,
    width: number,
    height: number
}

// scores and visualization are parallel arrays
interface State {
    visualization: string[][],
    arrows: PointTable<Arrow> // arrows are uniquely defined by where they point to
}

class GridVisualization extends React.Component<Props, State>
{
    private readonly tileWidth: number;
    private tileClass: string = TILE_CLASS;
    private readonly width: number;
    private readonly height: number;

    constructor(props: Props) {
        super(props);
        this.tileWidth = this.props.tileWidth;
        this.width = props.width;
        this.height = props.height;
        this.state = {
            visualization: this.createEmptyViz(),
            arrows: new PointTable(props.width, props.height)
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
        if(this.props.width !== prevProps.width || this.props.height !== prevProps.height) {
            const visualization: string[][] = this.createEmptyViz();
            for(let y = 0; y < this.props.height; y++) {
                for(let x = 0; x < this.props.width; x++) {
                    if(y < prevProps.height && x < prevProps.width) {
                        visualization[y][x] = this.state.visualization[y][x];
                    }
                }
            }
            this.setState({ visualization });
        }
    }

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

    clear() {
        this.setState({
            visualization: this.createEmptyViz(),
            arrows: new PointTable(this.width, this.height)
        });
    }

    static doVizGeneration(generation: PathNode, visualization: string[][]) {
        for(const node of generation.children) {
            const point = node.tile.point;
            visualization[point.y][point.x] = OPEN_NODE;
        }
        const point = generation.tile.point;
        visualization[point.y][point.x] = CLOSED_NODE;
        return visualization;
    }

    visualizeGeneration(generation: PathNode) {
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

    visualizeGenerations(generations: PathNode[]) {
        const visualization = this.createEmptyViz();
        for(const generation of generations) {
            GridVisualization.doVizGeneration(generation, visualization);
        }
        this.setState({
            visualization: visualization
        });
    }

    static doArrowGeneration(generation: PathNode, arrows: PointTable<Arrow>) {
        const point = generation.tile.point;
        for(const node of generation.children) {
            const childPoint = node.tile.point;
            const newArrow = {
                from: point,
                to: childPoint,
            };
            // remove a duplicate arrow to indicate replacement
            // in A* for example, we could have re-discovered a better path to a tile
            arrows.add(newArrow.to, newArrow);
        }
        return arrows;
    }

    addArrowGeneration(generation: PathNode) {
        this.setState(prevState => ({
            arrows: GridVisualization.doArrowGeneration(
                generation,
                prevState.arrows.clone()
            )
        }));
    }

    addArrowGenerations(generations: PathNode[]) {
        const arrows: PointTable<Arrow> = new PointTable(this.width, this.height);
        for(const generation of generations) {
            GridVisualization.doArrowGeneration(generation, arrows)
        }
        this.setState({
            arrows: arrows
        });
    }

    visualizeGenerationAndArrows(generation: PathNode) {
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
            // calculate arrow position and dimensions
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