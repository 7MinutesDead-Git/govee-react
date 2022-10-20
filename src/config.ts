let baseURL = process.env.REACT_APP_SERVER_URL
let baseWebSocketURL = process.env.REACT_APP_SERVER_SOCKET
if (process.env.NODE_ENV === "development") {
    baseURL = "http://localhost:8080/"
    baseWebSocketURL = "ws://localhost:8080"
}

export const websocketURL = baseWebSocketURL
export const devicesURL = `${baseURL}devices`
export const stateURL = `${devicesURL}/state`
export const rateLimitExpireURL = `${devicesURL}/rate-limit`
export enum intervals {
    twoSeconds = 2000,
    fiveSeconds = 5000,
    tenSeconds = 10000,
    thirtySeconds = 30000,
    oneMinute = 60000,
    fiveMinutes = 300000,
    tenMinutes = 600000,
    staleTime = thirtySeconds,
    refetchInterval = tenMinutes * 3
}