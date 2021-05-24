import React from 'react';

export const KEY_SHOW = 'visited';

interface IProps {}

interface IState {
    show: boolean
    page: number
}

class Tutorial extends React.Component<IProps,IState>
{
    constructor(props: IProps) {
        super(props);
        this.state = {
            show: true,
            page: 0
        }
    }

    /**
     * Hide the tutorial and set key in local storage to true to prevent it from being shown again
     */
    hide() {
        this.setState({
            show: false
        }, () => localStorage.setItem(KEY_SHOW, 'true'));
    }

    /**
     * Display the child one index to the left
     */
    prev() {
        this.setState(prevState => ({
            page: prevState.page - 1 >= 0 ? prevState.page - 1 : prevState.page
        }));
    }

    /**
     * Display the child one index to the right
     */
    next() {
        const children = React.Children.toArray(this.props.children);
        this.setState(prevState => ({
            page: prevState.page + 1 < children.length ? prevState.page + 1 : prevState.page
        }));
    }

    /**
     * Checks if hide was called before by checking if hide() has been called before
     */
    showPanel() {
        return localStorage.getItem(KEY_SHOW) !== 'true';
    }

    /**
     * Tutorial page will only be visible if tutorial hasn't been hidden before
     * Render's the page-th child in the panel
     * If the page is the final page, the next button is replaced with a finish button
     */
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