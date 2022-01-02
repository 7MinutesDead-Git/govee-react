import { devicesURL, rateLimitExpireURL, stateURL, loginURL } from "../../config"
import { goveeDevice, goveeDevicesMap, goveeStateResponse } from "../../interfaces/interfaces"
import { LoginFormValues } from "../../interfaces/interfaces"
import { multiplayer } from "./websocket-utilities"
import { messages } from "../constants"


export async function authenticate(values: LoginFormValues) {
    const response = await fetch(loginURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
    })

    if (response.status === 200) {
        multiplayer.client.close()
        multiplayer.reconnect()
        return response.json()
    }
    else {
        throw new Error("Please check your username and password")
    }
}

export async function logout() {
    const response = await fetch(loginURL, {
        method: "DELETE",
        credentials: "include",
    })

    if (response.status === 200) {
        multiplayer.client.close()
        multiplayer.reconnect()
        return response.json()
    }
    else {
        throw new Error("Error logging out")
    }
}

export async function getRateLimitExpireDate() {
    const response = await fetch(rateLimitExpireURL)
    const data = await response.json()
    return data.date
}

export async function getRateLimitTimeRemaining(): Promise<number> {
    try {
        const response = await fetch(rateLimitExpireURL)
        const data = await response.json()
        return data.seconds
    }
    catch (e) {
        console.log("Error fetching rate limit remaining time: ", e)
        throw new Error("Error getting rate limit time remaining")
    }
}

export async function getAvailableLights() {
    const response = await fetch(devicesURL)
    if (response.ok) {
        const onlineDevices: goveeDevice[] = await response.json()
        return onlineDevices
    }
    if (response.status === 429) {
        const date = await getRateLimitExpireDate()
        const messagePrefix = "Govee's restrictive API rate limit has been exceeded"
        const errorMessage = date === "Invalid Date" ?
            `${messagePrefix}. We aren't sure when it'll be back because they didn't tell us.. Try again?` :
            `${messagePrefix}. Please try again after ${date}.`
        throw new Error(errorMessage)
    }
}

export async function getStateOfLights(onlineDevices: goveeDevice[] | undefined) {
    if (!onlineDevices) {
        console.error("No devices found.")
        throw new Error("No devices found.")
    }

    // We'll use a map to store the state of each device. Easy for matching up with the list of device state queries.
    const completeDevices: goveeDevicesMap = {}
    const deviceStatsPromises = []
    // But we'll return each device object in an array that can be more easily iterated over.
    const results = []

    for (const device of onlineDevices) {
        completeDevices[device.device] = {
            id: device.device,
            details: {...device},
            status: {
                brightness: 0,
                color: { b: 0, g: 0, r: 0 },
                online: false,
                powerState: "off"
            }
        }
        const deviceStatsPromise = fetch(`${stateURL}?device=${device.device}&model=${device.model}`)
        deviceStatsPromises.push(deviceStatsPromise)
    }
    const deviceStateResponses = await Promise.allSettled(deviceStatsPromises)

    for (const deviceState of deviceStateResponses) {
        if (deviceState.status === "fulfilled") {
            const deviceFetchedStats: goveeStateResponse = await deviceState.value.json()
            const extractedStatusProperties = {}

            for (const propertyObject of deviceFetchedStats.data.properties) {
                const propertyKey = Object.keys(propertyObject)[0]
                // TODO: Use generics to preserve type safety
                // @ts-ignore
                let propertyValue = propertyObject[propertyKey]
                // External Govee API returns light's online status as a string for "false",
                // but as a boolean for true. Very frustrating.
                if (propertyValue === "false") {
                    propertyValue = false
                }
                // TODO: Use generics to preserve type safety
                // @ts-ignore
                extractedStatusProperties[propertyKey] = propertyValue
            }
            // TODO: Use generics to preserve type safety
            // @ts-ignore
            completeDevices[deviceFetchedStats.data.device].status = extractedStatusProperties
        }
        else {
            console.error(`Couldn't get device stats for a light: `, deviceState.reason)
        }
    }
    for (const device in completeDevices) {
        results.push(completeDevices[device])
    }
    return results
}

/**
 * Throws an unknown error with a message that includes the target.
 * @param target The target that the error pertains to.
 * @param response The server Response object received that triggered the error.
 * @throws {Error} An error with the message generated by `messages.unknownError(target)`.
 */
export function throwUnknownFetchError(target: string, response: Response): never {
    const errorMessage = messages.unknownError(target)
    console.log(errorMessage, response)
    throw new Error(errorMessage)
}