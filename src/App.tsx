import { MantineProvider, Stack } from "@mantine/core"
import { theme } from "./theme"
import { goveeDevice, goveeDevicesMap, goveeStateResponse, intervals } from "./interfaces/interfaces"
import { useQuery } from "@tanstack/react-query"

import { BadgeConnectionStatus } from "./components/Badges"
import { TableOfLights } from "./components/LightsTable"
import { LightsHeader } from "./components/LightsHeader"

import { devicesURL, stateURL } from "./config"



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
    const { error, data: connectedLights } = useQuery(
        ["connected"],
        () => getAvailableLights()
    )
    // https://tanstack.com/query/v4/docs/guides/disabling-queries#isinitialloading
    const { isInitialLoading, data: lights } = useQuery(
        ["lights"],
        () => getStateOfLights(connectedLights),
        {
            enabled: !!connectedLights,
            refetchOnWindowFocus: true,
            refetchInterval: intervals.refetchInterval,
            refetchIntervalInBackground: false,
            staleTime: intervals.staleTime,
        }
    )

    // ----------------------------------------
    // Render
    if (error) {
        return (
            <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
                <LightsHeader>
                    <BadgeConnectionStatus online={!isInitialLoading} error={true}/>
                </LightsHeader>
            </MantineProvider>
        )
    }

    return (
        <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
            <LightsHeader>
                <BadgeConnectionStatus online={!isInitialLoading} />
            </LightsHeader>
            <Stack align="center" justify="center" spacing="xl">
                <TableOfLights lights={lights} isLoading={isInitialLoading}/>
            </Stack>
        </MantineProvider>
    );
}
