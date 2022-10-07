let baseURL = `${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_PORT}`
if (process.env.NODE_ENV === "development") {
    baseURL = "http://localhost:8080"
}
export const devicesURL = `${baseURL}/devices`
export const stateURL = `${devicesURL}/state`