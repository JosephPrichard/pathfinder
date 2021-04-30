import React from 'react';
import './Grid.css';
import TileFg, {TileProps, TileState} from './TileFg';

class SolidFg extends TileFg<TileProps, TileState>
{
    constructor(props: TileProps) {
        super(props);
        const size = this.props.doAnimation ?  0 : this.props.tileWidth;
        this.state = {
            tileSize: size
        }
    }

    componentDidMount() {
        if(this.props.doAnimation) {
            this.applyExpandAnimation(100);
        }
    }

    render() {
        const dimensions = this.getDimensions();
        return (
            <rect x={dimensions.left} y={dimensions.top}
                  shapeRendering='crispEdges'
                  width={dimensions.width} height={dimensions.width}
                  style={this.getStyle()} className={'svg-tile'}
            />
        );
    }
}

export default SolidFg;