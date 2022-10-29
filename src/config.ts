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
}
enum refreshRates {
    fps200 = 5,
    fps144 = 6.944,
    fps120 = 8.333,
    fps90 = 11.111,
    fps60 = 16.667,
    fps30 = 33.333,
}
export class NetworkConfig {
    // 1 will be instantaneous, 0.5 is fast smoothing, 0.1 will be slow, 0.01 will be very slow
    static lerpScale = 0.25
    // How quickly a new value is lerped to the current value, in milliseconds. 16.7ms is 60fps
    static lerpUpdateRate = refreshRates.fps90
    // How quickly commands from the server are processed by the client, in milliseconds.
    static socketUpdateRate = 50
}
export class QueryConfig {
    static staleTime = intervals.thirtySeconds
    static refetchInterval = intervals.tenMinutes * 3
}