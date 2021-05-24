import React from 'react';

interface IProps {
    min: number,
    max: number,
    default: number,
    step: number,
    sliderStyle: string,
    onChange: (val: number) => void
}

interface IState {
    value: number
}

const HOLD_DELAY = 120;

class SteppedButtonRange extends React.Component<IProps, IState>
{
    private interval: NodeJS.Timeout | undefined;
    private callback: (() => void) | undefined; //set to either plus or minus

    private wasClicked: boolean = false;

    //tracks how many times the button has changed its value while being held down
    private intervals: number = 0;

    constructor(props: IProps) {
        super(props);
        this.state = {
            value: this.props.default
        }
    }

    /**
     * Reduces the buttons value and invokes the onChange event
     */
    minus() {
        this.setState(prevState => ({
            value: prevState.value - this.props.step >= this.props.min ?
                prevState.value - this.props.step : prevState.value
        }), () => this.props.onChange(this.state.value));
    }

    /**
     * Called when the minus button is clicked
     * Schedules the minus event to be called every few ms
     *  to simulate the minus button being "held down"
     * @param e
     */
    onMinus(e: Event) {
        e.preventDefault();
        this.wasClicked = true;
        this.callback = () => {
            this.intervals++;
            this.minus();
        };
        this.interval = setInterval(this.callback, HOLD_DELAY);
    }

    /**
     * Increases the buttons value and invokes the onChange event
     */
    plus() {
        this.setState(prevState => ({
            value: prevState.value + this.props.step <= this.props.max ?
                prevState.value + this.props.step : prevState.value
        }), () => this.props.onChange(this.state.value));
    }

    /**
     * Called when the plus button is clicked
     * Schedules the plus event to be called every few ms
     *  to simulate the plus button being "held down"
     * @param e
     */
    onPlus(e: Event) {
        e.preventDefault();
        this.wasClicked = true;
        this.callback = () => {
            this.intervals++;
            this.plus();
        };
        this.interval = setInterval(this.callback, HOLD_DELAY);
    }

    /**
     * Cancels all timeouts to prevent the delayed increase/decrease of the value,
     * If the button was recently clicked and hasn't yet changed its value at least once,
     *  the callback to be scheduled (either plus or minus) will be invoked
     */
    cancel() {
        if(this.intervals === 0 && this.wasClicked) {
            (this.callback as () => void)();
        }
        clearInterval(this.interval as NodeJS.Timeout);
        this.intervals = 0;
        this.wasClicked = false;
    }

    /**
     * Renders the minus button on the left,
     * The value of the button in the middle,
     * and the plus button on the right
     */
    render() {
        return (
            <div className='button-range-wrapper'>
                <button
                    className='range-button minus'
                    onMouseDown={e => this.onMinus(e.nativeEvent)}
                    onMouseUp={() => this.cancel()}
                    onMouseLeave={() => this.cancel()}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter') {
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
                        if(e.key === 'Enter') {
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