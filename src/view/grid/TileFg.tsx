import React from 'react';
import './Grid.css';
import {Point} from '../../pathfinding/core/Components';

export interface TileProps {
    tileWidth: number,
    point: Point,
    color: string,
    doAnimation: boolean
}

export interface TileState {
    tileSize: number
}

abstract class TileFg<IProps extends TileProps, IState extends TileState>
    extends React.Component<IProps, IState>
{
    protected constructor(props: IProps) {
        super(props);
    }

    /**
     * Animation to expand element from half size to full size over a few milliseconds
     * Can be slow to execute so animations should be enabled with caution
     * @param expansionDuration in milliseconds
     */
    protected applyExpandAnimation = (expansionDuration: number) => {
        const expansions = 10;
        const expansionStep = expansionDuration/expansions;
        const overStep = 2;
        const original = this.state.tileSize;
        for(let i = 1; i <= expansions + overStep; i++) {
            const expand = () => this.setState({
                tileSize: original + i * (this.props.tileWidth/(expansions))
            });
            setTimeout(expand, i * expansionStep);
        }
        let time = expansions + overStep + 1;
        for(let i = expansions + overStep - 0.5; i >= expansions; i -= 0.5) {
            const shrink = () => this.setState({
                tileSize: original + i * (this.props.tileWidth/(expansions))
            });
            setTimeout(shrink, time * expansionStep);
            time += 6;
        }
    }

    protected getStyle() {
        return {
            fill: this.props.color,
            stroke: 'none',
            display: 'block'
        };
    }

    protected getDimensions() {
        const width = this.state.tileSize;
        const top = this.props.point.y * this.props.tileWidth + (this.props.tileWidth - width)/2;
        const left = this.props.point.x * this.props.tileWidth + (this.props.tileWidth - width)/2;
        return {
            width: width,
            top: top,
            left: left
        }
    }
}

export default TileFg;