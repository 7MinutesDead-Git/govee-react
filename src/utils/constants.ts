export const durations = {
    lerpClear: 500,
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
    lerpColorInterval: setInterval(() => {}, durations.fps90),
    lerpColorClear: setInterval(() => {}, durations.lerpClear)
}

export const messages = {
    notLoggedIn: (target: string) => `You must be logged in to change ${target}.`,
    unknownError: (target: string) => `An unknown error occurred while changing ${target}.`,
    unknownSocketMessageType: (type: string) => `Unknown socket message type received: ${type}`,
    failed: (target: string) => `Failed to change ${target}!`,
    deviceOffline: "This device is offline.",
    rateLimited: "You are sending requests too quickly!",
}