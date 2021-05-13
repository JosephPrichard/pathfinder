interface AppSettings
{
    visualizeAlg: boolean,
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
        visualizeAlg: true,
        showArrows: true,
        delayInc: 25,
        algorithm: 'a*',
        heuristicKey: 'manhattan',
        navigatorKey: 'plus',
        bidirectional: false,
        showScores: false
    }
}

export default AppSettings;