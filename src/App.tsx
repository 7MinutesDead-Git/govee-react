import { MantineProvider, Stack } from "@mantine/core"
import { theme } from "./theme"
import { useState } from "react"
import { goveeDevice, goveeDevicesMap, goveeStateResponse, intervals } from "./interfaces/interfaces"
import { useQuery } from "@tanstack/react-query"

import { BadgeConnectionStatus } from "./components/Badges"
import { TableOfLights } from "./components/LightsTable"
import { LightsHeader } from "./components/LightsHeader"


const devicesURL = "http://localhost:3001/devices"
const stateURL = "http://localhost:3001/devices/state"
const backgroundColor = "#1A1B1E"
const backgroundFlashColor = "#2A2B2E"


async function getAvailableLights() {
    try {
        const response = await fetch(devicesURL);
        const onlineDevices: goveeDevice[] = await response.json()
        return onlineDevices
    }
    catch (error) {
        throw new Error("There was an error when fetching initial available lights.")
    }
}

async function getStateOfLights(onlineDevices: goveeDevice[] | undefined) {
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
    const deviceStatsResponses = await Promise.allSettled(deviceStatsPromises)

    for (const deviceStatsResponse of deviceStatsResponses) {
        if (deviceStatsResponse.status === "fulfilled") {
            const deviceFetchedStats: goveeStateResponse = await deviceStatsResponse.value.json()
            const extractedStatusProperties = {}
            for (const propertyObject of deviceFetchedStats.data.properties) {
                const propertyKey = Object.keys(propertyObject)[0]
                // TODO: Properly type this temporary object.
                // @ts-ignore
                extractedStatusProperties[propertyKey] = propertyObject[propertyKey]
            }
            // TODO: Properly type this temporary object.
            // @ts-ignore
            completeDevices[deviceFetchedStats.data.device].status = extractedStatusProperties
        }
        else {
            console.error(`Couldn't get device stats for a light: `, deviceStatsResponse.reason)
        }
    }
    for (const device in completeDevices) {
        results.push(completeDevices[device])
    }
    return results
}


export default function App() {
    // ----------------------------------------
    // Hooks
    const { error, data: lights } = useQuery(
        ["lights"],
        () => getAvailableLights(),
        {
            staleTime: intervals.oneMinute,
            refetchOnWindowFocus: true,
            refetchInterval: intervals.fiveMinutes
        }
    )
    const { isLoading, data: lightsWithState } = useQuery(
        ["lightsWithState"],
        () => getStateOfLights(lights),
        {
            enabled: !!lights,
            staleTime: intervals.thirtySeconds,
            refetchOnWindowFocus: true,
            refetchInterval: intervals.oneMinute
        }
    )

    // ----------------------------------------
    // Methods
    function flashBackground() {
        const body = document.querySelector("body")
        body!.style.backgroundColor = backgroundFlashColor
        setTimeout(() => {
            body!.style.backgroundColor = backgroundColor
        }, 200)
    }

    // ----------------------------------------
    // Render
    if (error) {
        return (
            <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
                <LightsHeader>
                    <BadgeConnectionStatus online={!isLoading} error={true}/>
                </LightsHeader>
            </MantineProvider>
        )
    }

    return (
        <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
            <LightsHeader>
                <BadgeConnectionStatus online={!isLoading} />
            </LightsHeader>
            <Stack align="center" justify="center" spacing="xl">
                <TableOfLights lights={lightsWithState} isLoading={isLoading}/>
            </Stack>
        </MantineProvider>
    );
}
