export interface ViewOptions {
    pass: PassData | null,
    enhancement: Enhancement | null
}

export interface PassData {
    start: string,
    end: string,
    satellite: string,
    enhancements: Array<Enhancement>
}

export interface Enhancement {
    type: string,
    precip: boolean,
    map: boolean
}
