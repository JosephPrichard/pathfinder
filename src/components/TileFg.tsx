/*
 * Copyright (c) Joseph Prichard 2022.
 */

import React from "react";
import { Point } from "../pathfinding/Core";
import Weight from "../assets/weight.svg";

interface TileProps {
    tileWidth: number;
    point: Point;
    color: string;
}

export function TileFg({ tileWidth, point, color }: TileProps) {
    const size = tileWidth;
    const top = point.y * tileWidth;
    const left = point.x * tileWidth;

    return (
        <div
            style={{
                position: "absolute",
                width: size,
                height: size,
                top: top,
                left: left,
                backgroundColor: color,
                display: "block",
                borderColor: color,
            }}
            className={"svg-tile tile-fg"}
        />
    );
}

interface SolidProps {
    tileSize: number;
    point: Point;
    doTileAnimation: boolean;
}

export function SolidFg({ tileSize, point, doTileAnimation }: SolidProps) {
    return (
        <div
            style={{
                position: "absolute",
                left: point.x * tileSize,
                top: point.y * tileSize,
                width: tileSize,
                height: tileSize,
            }}
            className={doTileAnimation ? "solid-animation" : "solid"}
        />
    );
}

interface WeightProps {
    tileSize: number;
    point: Point;
    doTileAnimation: boolean;
}

export function WeightFg({ tileSize, point, doTileAnimation }: WeightProps) {
    return (
        <div
            style={{
                left: point.x * tileSize,
                top: point.y * tileSize,
                width: tileSize,
                height: tileSize,
                backgroundImage: `url(${Weight})`,
                position: "absolute",
            }}
            className={doTileAnimation ? "weight-animation" : "weight"}
        />
    );
}
