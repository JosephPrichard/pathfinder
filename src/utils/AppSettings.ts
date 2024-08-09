/*
 * Copyright (c) Joseph Prichard 2022.
 */

import { SPEED_MIN } from "../components/SettingPanels";

interface AppSettings {
    showArrows: boolean;
    delayInc: number;
    algorithm: string;
    heuristicKey: string;
    navigatorKey: string;
    bidirectional: boolean;
}

export function getDefaultSettings(): AppSettings {
    const defaultDelayInc = 25;
    return {
        showArrows: true,
        delayInc: defaultDelayInc >= SPEED_MIN ? defaultDelayInc : SPEED_MIN,
        algorithm: "a*",
        heuristicKey: "manhattan",
        navigatorKey: "plus",
        bidirectional: false,
    };
}

export default AppSettings;
