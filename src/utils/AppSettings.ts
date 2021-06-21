/*
 * Copyright (c) Joseph Prichard 2022.
 */

import { SPEED_MIN } from "../components/panel/SettingPanels";

interface AppSettings
{
    showArrows: boolean,
    delayInc: number,
    algorithm: string,
    heuristicKey: string,
    navigatorKey: string,
    bidirectional: boolean
}

export function getDefaultSettings(): AppSettings {
    return {
        showArrows: true,
        delayInc: SPEED_MIN,
        algorithm: 'a*',
        heuristicKey: 'manhattan',
        navigatorKey: 'plus',
        bidirectional: false
    }
}

export default AppSettings;