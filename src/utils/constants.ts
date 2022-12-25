export const durations = {
    colorChangeDebounceDelay: 100,
    flashResetDelay: 1000,
    fps60: 1000 / 60,
    fps90: 1000 / 90,
    fps120: 1000 / 120,
    fps144: 1000 / 144,
}

export enum intervals {
    twoSeconds = 2000,
    fiveSeconds = 5000,
    tenSeconds = 10000,
    thirtySeconds = 30000,
    oneMinute = 60000,
    fiveMinutes = 300000,
    tenMinutes = 600000,
}

export const statusCodes = {
    success: 200,
    unauthorized: 401,
    rateLimited: 429,
    internalServerError: 500,
}

export const clocks = {
    lerpColorInterval: setInterval(() => {}, durations.fps90)
}