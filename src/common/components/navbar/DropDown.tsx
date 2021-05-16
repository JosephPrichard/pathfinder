import React from 'react';

export interface DropDownProps {
    onClick: () => void
}

export interface DropDownState {
    up: boolean,
    display: string,
    fade: string
}

abstract class DropDown<IProps extends DropDownProps, IState extends DropDownState>
    extends React.Component<IProps, IState>
{
    protected constructor(props: IProps) {
        super(props);
    }

    windowOnClick = () => {
        this.hide();
    }

    /**
     * Binds window listeners.
     * Hides the drop down if clicked anywhere else
     */
    componentDidMount() {
        window.addEventListener('click', this.windowOnClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.windowOnClick);
    }

    show() {
        this.setState({
            up: false,
            display: 'block',
        });
    }

    hide() {
        this.setState({
            display: 'none',
            up: true,
        });
    }

    toggle(e: Event) {
        e.stopPropagation();
        this.props.onClick();
        if(this.isHidden()) {
            this.show();
        } else {
            this.hide();
        }
    }

    isHidden() {
        return this.state.display === 'none';
    }

    contentStyle() {
        return {
            display: this.state.display
        }
    }
}

export default DropDown;