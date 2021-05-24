import React, {RefObject} from 'react';

interface IProps {
    algorithm: string,
    length: number,
    cost: number,
    time: number,
    nodes: number
}

class Stats extends React.Component<IProps>
{
    private readonly textLog: RefObject<HTMLTextAreaElement> = React.createRef();

    componentDidUpdate() {
        this.textLog.current!.scrollTop = this.textLog.current!.scrollHeight;
    }

    render() {
        const time = precise(this.props.time);
        const text = this.props.algorithm === '' ? '' :
            `${this.props.algorithm} visited ${this.props.nodes} nodes in ${time} ms. ` +
            `Path length = ${this.props.length}. Path cost = ${this.props.cost}.`;
        return(
            <textarea
                tabIndex={-1}
                ref={this.textLog}
                readOnly={true}
                className='stats-text-area no-select'
                value={text}
                unselectable={'on'}
                onDrop={() => false}
            />
        );
    }
}

function precise(x: number) {
    return x.toFixed(2);
}

export default Stats;