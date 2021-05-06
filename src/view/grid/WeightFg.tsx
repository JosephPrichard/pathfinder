import React from 'react';
import {ReactComponent as Weight} from '../web-content/weight.svg';
import TileFg, {TileProps, TileState} from './TileFg';

interface IProps extends TileProps{
    opacity: number
    cost: number
}

interface IState extends TileState {
    showNumber: boolean
}

class WeightFg extends TileFg<IProps, IState>
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
            const expansionDuration = 100;
            this.applyExpandAnimation(100);
            setTimeout(() => this.setState({
                showNumber: true
            }), expansionDuration);
        }
    }

    render() {
        const dimensions = this.getDimensions();
        const children: JSX.Element[] = [];
        children.push(
            <Weight width={dimensions.width} height={dimensions.width}
                    style={this.getStyle()} className={'svg-tile'}
                    opacity={this.props.opacity}
                    key={1}
            />
        );
        if(this.state.showNumber) {
            children.push(
                <text x='50%' y='70%'
                      dominantBaseline='middle'
                      textAnchor='middle'
                      fill={'white'}
                      fontSize={'0.8em'}
                      className={'svg-text'}
                      opacity={this.props.opacity + 0.3}
                      key={2}
                >
                    {this.props.cost}
                </text>
            );
        }
        return (
            <svg x={dimensions.left} y={dimensions.top}
                 width={dimensions.width} height={dimensions.width}>
                {children}
            </svg>
        );
    }
}

export default WeightFg;