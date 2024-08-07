/*
 * Copyright (c) Joseph Prichard 2022.
 */

import React from 'react';

export const KEY_SHOW = 'visited';

interface Props {}

interface State {
    show: boolean
    page: number
}

class Tutorial extends React.Component<Props, State>
{
    constructor(props: Props) {
        super(props);
        this.state = {
            show: true,
            page: 0
        }
    }

    hide() {
        this.setState({
            show: false
        }, () => localStorage.setItem(KEY_SHOW, 'true'));
    }

    prev() {
        this.setState(prevState => ({
            page: prevState.page - 1 >= 0 ? prevState.page - 1 : prevState.page
        }));
    }

    next() {
        const children = React.Children.toArray(this.props.children);
        this.setState(prevState => ({
            page: prevState.page + 1 < children.length ? prevState.page + 1 : prevState.page
        }));
    }

    showPanel() {
        return localStorage.getItem(KEY_SHOW) !== 'true';
    }

    render() {
        const children = React.Children.toArray(this.props.children);
        const lastPage = this.state.page + 1 === children.length;
        return(
            <div
                style={{
                    display: this.showPanel() && this.state.show ? 'block' : 'none'
                }}
                className='tutorial-panel'
            >
                <div
                    className='x-tutorial-button'
                    tabIndex={0}
                    onKeyPress={() => this.hide()}
                    onClick={() => this.hide()}
                    onMouseDown={e => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    <div className='x-tutorial-text'>
                        X
                    </div>
                </div>
                <div className='content-top-wrapper'>
                    <div className='content-top'>
                        {this.state.page + 1 }/{children.length}
                    </div>
                </div>
                <div className='content'>
                    {children[this.state.page]}
                </div>
                <div className='tutorial-control-wrapper'>
                    <button
                        className='tutorial-button tutorial-left-button tut-blue-button'
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => this.prev()}
                    >
                        Prev
                    </button>
                    <button
                        className='tutorial-button tutorial-right-button tut-blue-button'
                        onMouseDown={e => e.preventDefault()}
                        onClick={
                            !lastPage ?
                                () => this.next() :
                                () => this.hide()
                        }
                    >
                        {!lastPage ? 'Next' : 'Finish'}
                    </button>
                </div>
            </div>
        );
    }
}

export default Tutorial;