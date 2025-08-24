import { get_DEFAULT_DATES ,type QueryParams } from "./utils";

export enum Actions {
    full = 'f',
    partial = 'p'
}

export enum Queries {
    default = 'q1',
    normal = 'normal',
    watch = 'watch',
    advisory = 'advisory',
    volcanicCloudsTracking = 'volcanicCloudsTracking',
    eruptionClassification = 'eruptionClassification'
}

export const DEFAULT_INITIAL_STATE: QueryParams = {
    date: get_DEFAULT_DATES()[1],
    num: 1,
    rif: get_DEFAULT_DATES()[0],
    idx: 0,
    action: Actions.full
}



