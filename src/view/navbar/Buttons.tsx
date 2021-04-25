import React from 'react';
import './Navbar.css'

interface VProps {
    active: boolean,
    paused: boolean,
    onStartStop: ()  => void,
    onPause: ()  => void,
    onResume: ()  => void,
}

interface SProps {
    onClick: ()  => void
}

const SYMBOL_COLOR = 'rgb(230,230,230)';
const OFFSET = 14;
const DIMENSION = 47 - 2 * OFFSET;

export class VisualizeButton extends React.Component<VProps>
{
    getStopSymbol() {
        return (
            <rect width={DIMENSION}
                  height={DIMENSION}
                  rx={4}
                  fill={SYMBOL_COLOR}
            />
        );
    }

    getResumeSymbol() {
        const midY = DIMENSION / 2;
        return (
            <polygon
                  points={`${0},${0} ${0},${DIMENSION} ${DIMENSION},${midY}`}
                  className={'track round'}
                  fill={SYMBOL_COLOR}
            />
        );
    }

    getPauseSymbol() {
        return (
            <svg>
                <rect width={DIMENSION/2.5}
                      height={DIMENSION}
                      rx={3}
                      fill={SYMBOL_COLOR}
                />
                <rect width={DIMENSION/2.5}
                      height={DIMENSION}
                      x={0.2*DIMENSION + DIMENSION/2.5}
                      rx={3}
                      fill={SYMBOL_COLOR}
                />
            </svg>
        );
    }

    render() {
        if(this.props.active) {
            return (
                <div className={'half-button-wrapper'}>
                    <button onMouseDown={e => e.preventDefault()}
                            className={'center half-button-left red-button half-viz-button'}
                            onClick={this.props.paused ? this.props.onResume : this.props.onPause}
                    >
                        <svg xmlns='http://www.w3.org/2000/svg'
                             className='svg-icon'
                             width={DIMENSION}
                             height={DIMENSION}
                        >
                            {this.props.paused ? this.getResumeSymbol() : this.getPauseSymbol()}
                        </svg>
                    </button>
                    <button onMouseDown={e => e.preventDefault()}
                            className={'center half-button-right red-button half-viz-button'}
                            onClick={this.props.onStartStop}
                    >
                        <svg xmlns='http://www.w3.org/2000/svg'
                             className='svg-icon'
                             width={DIMENSION}
                             height={DIMENSION}
                        >
                            {this.getStopSymbol()}
                        </svg>
                    </button>
                </div>
            );
        } else {
            return (
                <button onMouseDown={e => e.preventDefault()}
                        className={'button green-button viz-button'}
                        onClick={this.props.onStartStop}
                >
                    Visualize!
                </button>
            );
        }
    }
}

export class SettingsButton extends React.Component<SProps>
{

    render() {
        return (
            <button onMouseDown={e => e.preventDefault()}
                    className='button settings-button'
                    onClick={this.props.onClick}>
                Settings
            </button>
        );
    }
}