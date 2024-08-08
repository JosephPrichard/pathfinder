/*
 * Copyright (c) Joseph Prichard 2022.
 */

import React from 'react';

interface Props {
    min: number,
    max: number,
    default: number,
    step: number,
    sliderStyle: string,
    onChange: (val: number) => void
}

interface State {
    value: number
}

const HOLD_DELAY = 120;

class SteppedButtonRange extends React.Component<Props, State> {
    private interval: NodeJS.Timeout | undefined;
    private callback: (() => void) | undefined; // set to either plus or minus

    private wasClicked: boolean = false;

    // tracks how many times the button has changed its value while being held down
    private intervals: number = 0;

    constructor(props: Props) {
        super(props);
        this.state = {
            value: this.props.default
        }
    }

    minus() {
        this.setState(prevState => ({
            value: prevState.value - this.props.step >= this.props.min ?
                prevState.value - this.props.step : prevState.value
        }), () => this.props.onChange(this.state.value));
    }

    onMinus(e: Event) {
        e.preventDefault();
        this.wasClicked = true;
        this.callback = () => {
            this.intervals++;
            this.minus();
        };
        this.interval = setInterval(this.callback, HOLD_DELAY);
    }

    plus() {
        this.setState(
            prevState => ({
                value: prevState.value + this.props.step <= this.props.max ? prevState.value + this.props.step : prevState.value
            }),
            () => this.props.onChange(this.state.value)
        );
    }

    onPlus(e: Event) {
        e.preventDefault();
        this.wasClicked = true;
        this.callback = () => {
            this.intervals++;
            this.plus();
        };
        this.interval = setInterval(this.callback, HOLD_DELAY);
    }

    cancel() {
        if (this.intervals === 0 && this.wasClicked) {
            (this.callback as () => void)();
        }
        clearInterval(this.interval as NodeJS.Timeout);
        this.intervals = 0;
        this.wasClicked = false;
    }

    render() {
        return (
            <div className='button-range-wrapper'>
                <button
                    className='range-button minus'
                    onMouseDown={e => this.onMinus(e.nativeEvent)}
                    onMouseUp={() => this.cancel()}
                    onMouseLeave={() => this.cancel()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            this.minus();
                        }
                    }}
                >
                    -
                </button>
                <div
                    className='range-value'
                >
                    {this.state.value}
                </div>
                <button
                    className='range-button plus'
                    onMouseDown={e => this.onPlus(e.nativeEvent)}
                    onMouseUp={() => this.cancel()}
                    onMouseLeave={() => this.cancel()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            this.plus()
                        }
                    }}
                >
                    +
                </button>
            </div>
        );
    }
}

export default SteppedButtonRange;