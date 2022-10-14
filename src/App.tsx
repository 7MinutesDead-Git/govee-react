import { MantineProvider, Stack, Center, Loader, Text } from "@mantine/core"
import { theme } from "./theme"
import { goveeDevice, goveeDevicesMap, goveeStateResponse } from "./interfaces/interfaces"
import { useQuery } from "@tanstack/react-query"
import { BadgeConnectionStatus } from "./components/Badges"
import { LightsTable } from "./components/LightsTable"
import { LightsHeader } from "./components/LightsHeader"
import { Toasty } from "./components/Toasty"
import { devicesURL, stateURL, intervals } from "./config"


async function getAvailableLights() {
    const response = await fetch(devicesURL)
    if (response.ok) {
        const onlineDevices: goveeDevice[] = await response.json()
        return onlineDevices
    }
    if (response.status === 429) {
        // TODO: Get the retry-after header and use that to set the interval.
        throw new Error(`Rate limited by Govee's restrictive API. 😔 Try again tomorrow.`)
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
    // Hooks
    const { error, data: connectedLights, isError, isLoading } = useQuery(
        ["connected"],
        () => getAvailableLights()
    )
    // https://tanstack.com/query/v4/docs/guides/disabling-queries#isinitialloading
    // Because we can't establish a socket or webhook from the limited external Govee API,
    // we'll just have to refetch at an arbitrary interval that also keeps us from hitting their daily rate limit.
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

    // Render
    if (isError) {
        return (
            <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
                <Toasty />
                <LightsHeader>
                    <BadgeConnectionStatus
                        online={!isInitialLoading}
                        error={true}
                        errorMessage={"TODO: Rate limit time remaining"}/>
                </LightsHeader>
                <Center>
                    <Text>{(
                        // It is incredibly complicated to assert the type of "error"
                        // destructured from useQuery, because we can't assert type with angled brackets
                        // while destructuring since this is a TSX file.
                        // So, error is of type "unknown" for now.
                        // @ts-ignore
                        error.message
                    )}</Text>
                </Center>
            </MantineProvider>
        )
    }

    if (isLoading) {
        return (
            <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
                <Toasty />
                <LightsHeader>
                    <BadgeConnectionStatus online={!isLoading} error={false}/>
                </LightsHeader>
                <Center>
                    <Loader size="lg" />
                </Center>
            </MantineProvider>
        )
    }

    return (
        <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
            <Toasty />
            <LightsHeader>
                <BadgeConnectionStatus online={!isInitialLoading} />
            </LightsHeader>
            <Stack align="center" justify="center" spacing="xl">
                <LightsTable lights={lights} isLoading={isInitialLoading}/>
            </Stack>
        </MantineProvider>
    );
}
