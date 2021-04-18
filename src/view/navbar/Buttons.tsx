import React from 'react';

interface VProps {
    color: string
    onClick: ()  => void
}

interface SProps {
    onClick: ()  => void
}

export class VisualizeButton extends React.Component<VProps>
{
    render() {
        return (
            <button onMouseDown={e => e.preventDefault()}
                    className={'button ' + this.props.color}
                    onClick={this.props.onClick}
            >
                Visualize!
            </button>
        );
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
