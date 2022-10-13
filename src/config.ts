let baseURL = process.env.REACT_APP_SERVER_URL
if (process.env.NODE_ENV === "development") {
    baseURL = "http://localhost:8080"
}
export const devicesURL = `${baseURL}/devices`
export const stateURL = `${devicesURL}/state`