import { durations, intervals } from "./utils/constants"

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
export const loginURL = `${baseURL}auth`


export class NetworkConfig {
    // 1 will be instantaneous, 0.5 is fast smoothing, 0.1 will be slow, 0.01 will be very slow
    // Fast will look jittery but more accurate, while slow will look smooth but less accurate.
    static lerpScale = 0.15
    // How quickly a new value is lerped to the current value, in milliseconds. 16.7ms is 60fps
    static lerpUpdateRate = durations.fps144
    // How quickly commands from the server are processed by the client, in milliseconds.
    static socketUpdateRate = 15
}
export class QueryConfig {
    static staleTime = intervals.thirtySeconds
    static refetchInterval = intervals.tenMinutes * 3
}