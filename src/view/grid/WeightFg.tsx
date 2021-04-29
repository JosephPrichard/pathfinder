import React from 'react';
import {Point} from '../../pathfinding/core/Components';
import {ReactComponent as Weight} from '../web-content/weight.svg';

interface IProps {
    tileWidth: number,
    point: Point,
    color: string,
    doAnimation: boolean,
    cost: number
}

interface IState {
    tileSize: number,
    showNumber: boolean
}

class WeightFg extends React.Component<IProps, IState>
{
    constructor(props: IProps) {
        super(props);
        const size = this.props.doAnimation ?  0 : this.props.tileWidth;
        this.state = {
            tileSize: size,
            showNumber: !this.props.doAnimation
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
        const expansionDuration = 100;
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
        setTimeout(() => this.setState({
            showNumber: true
        }), expansionDuration);
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
        const children: JSX.Element[] = [];
        children.push(
            <Weight width={width} height={width}
                    style={style} className={'svg-tile'}
            />
        );
        if(this.state.showNumber) {
            children.push(
                <text x="50%" y="70%"
                      dominantBaseline="middle" textAnchor="middle"
                      fill={'white'}
                      fontSize={'0.8em'}
                >
                    {this.props.cost}
                </text>
            );
        }
        return (
            <svg x={left} y={top} width={width} height={width}>
                {children}
            </svg>
        );
    }
}

export default WeightFg;