/*
 * Copyright (c) Joseph Prichard 2022.
 */

import React from "react";

interface VizButtonProps {
    active: boolean;
    paused: boolean;
    onStartStop: () => void;
    onPause: () => void;
    onResume: () => void;
}

interface ButtonProps {
    onClick: () => void;
}

const SYMBOL_COLOR = "rgb(230,230,230)";
const OFFSET = 14;
const DIMENSION = 47 - 2 * OFFSET;

export function VisualizeButton(props: VizButtonProps) {
    const getStopSymbol = () => <rect width={DIMENSION} height={DIMENSION} rx={4} fill={SYMBOL_COLOR} />;

    const getResumeSymbol = () => {
        const midY = DIMENSION / 2;
        return <polygon points={`${0},${0} ${0},${DIMENSION} ${DIMENSION},${midY}`} className={"track round"} fill={SYMBOL_COLOR} />;
    };

    const getPauseSymbol = () => (
        <svg>
            <rect width={DIMENSION / 2.5} height={DIMENSION} rx={3} fill={SYMBOL_COLOR} />
            <rect width={DIMENSION / 2.5} height={DIMENSION} x={0.2 * DIMENSION + DIMENSION / 2.5} rx={3} fill={SYMBOL_COLOR} />
        </svg>
    );

    return props.active ? (
        <div className={"half-button-wrapper"}>
            <button
                onMouseDown={(e) => e.preventDefault()}
                className={"center half-button-left red-button half-viz-button"}
                onClick={props.paused ? props.onResume : props.onPause}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="svg-icon" width={DIMENSION} height={DIMENSION}>
                    {props.paused ? getResumeSymbol() : getPauseSymbol()}
                </svg>
            </button>
            <button
                onMouseDown={(e) => e.preventDefault()}
                className={"center half-button-right red-button half-viz-button"}
                onClick={props.onStartStop}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="svg-icon" width={DIMENSION} height={DIMENSION}>
                    {getStopSymbol()}
                </svg>
            </button>
        </div>
    ) : (
        <button onMouseDown={(e) => e.preventDefault()} className={"button green-button viz-button"} onClick={props.onStartStop}>
            Visualize!
        </button>
    );
}

export function SettingsButton({ onClick }: ButtonProps) {
    return (
        <button onMouseDown={(e) => e.preventDefault()} className="special-button" onClick={onClick}>
            Settings
        </button>
    );
}
