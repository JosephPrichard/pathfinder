interface AppSettings
{
    showArrows: boolean,
    delayInc: number,
    algorithm: string,
    heuristicKey: string,
    navigatorKey: string,
    bidirectional: boolean,
    showScores: boolean
}

export function getDefaultSettings(): AppSettings {
    return {
        showArrows: true,
        delayInc: 30,
        algorithm: 'a*',
        heuristicKey: 'manhattan',
        navigatorKey: 'plus',
        bidirectional: false,
        showScores: false
    }
}

export default AppSettings;