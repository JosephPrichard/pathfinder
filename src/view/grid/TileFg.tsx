import React from 'react';
import {Point} from '../../pathfinding/core/Components';

interface IProps {
    tileWidth: number,
    point: Point,
    color: string,
    doAnimation: boolean
}

interface IState {
    tileSize: number
}

class TileFg extends React.Component<IProps, IState>
{
    constructor(props: IProps) {
        super(props);
        const size = this.props.doAnimation ?  0 : this.props.tileWidth;
        this.state = {
            tileSize: size,
        }
    }

    componentDidMount() {
        if(this.props.doAnimation) {
            this.applyExpandAnimation();
        }
    }

    /**
     * Animation to expand element from half size to full size over a few milliseconds
     * Can be slow to execute so animations should be enabled with caution
     */
    applyExpandAnimation = () => {
        const total = 5
        const original = this.state.tileSize;
        for(let i = 1; i <= total; i++) {
            const expand = () => this.setState({
                tileSize: original + i * (this.props.tileWidth/(total))
            });
            setTimeout(expand, i*10);
        }
    }

    applyShrinkAnimation = () => {
        const total = 5
        const original = this.state.tileSize;
        for(let i = 1; i <= total; i++) {
            const expand = () => this.setState({
                tileSize: original - i * (this.props.tileWidth/(total))
            });
            setTimeout(expand, i*10);
        }
    }

    render() {
        const width = this.state.tileSize;
        const top = this.props.point.y * this.props.tileWidth + (this.props.tileWidth - width)/2;
        const left = this.props.point.x * this.props.tileWidth + (this.props.tileWidth - width)/2;
        const style = {
            fill: this.props.color,
            stroke: 'none',
            display: 'block'
        };
        return (
            <rect x={left} y={top}
                  shapeRendering='crispEdges'
                  width={width} height={width}
                  style={style} className={'tile svg-tile'}
            />
        );
    }
}

export default TileFg;