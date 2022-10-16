import {Center, Loader, MantineProvider, Stack, Text} from "@mantine/core"
import {theme} from "./theme"
import {goveeDevice, goveeDevicesMap, goveeStateResponse} from "./interfaces/interfaces"
import {useQuery} from "@tanstack/react-query"
import {BadgeConnectionStatus} from "./components/Badges"
import {LightsTable} from "./components/LightsTable"
import {LightsHeader} from "./components/LightsHeader"
import {Toasty} from "./components/Toasty"
import {devicesURL, intervals, rateLimitExpireURL, stateURL} from "./config"


async function getRateLimitExpireDate() {
    const response = await fetch(rateLimitExpireURL)
    const data = await response.json()
    return data.date
}

async function getRateLimitTimeRemaining() {
    try {
        const response = await fetch(rateLimitExpireURL)
        const data = await response.json()
        return (data.date - Date.now()).toLocaleString()
    }
    catch (e) {
        throw new Error("Error getting rate limit time remaining")
    }
}

async function getAvailableLights() {
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


export default function App() {
    // Hooks
    const { error, data: connectedLights, isError, isLoading } = useQuery(
        ["connected"],
        () => getAvailableLights(),
        {
            staleTime: intervals.staleTime,
        })

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
            refetchIntervalInBackground: true,
            staleTime: intervals.staleTime,
        })

    const { data: rateLimitTimeRemaining } = useQuery(
        ["rateLimitTimeRemaining"],
        () => getRateLimitTimeRemaining(),
        { enabled: isError })

    // Render
    if (isError) {
        return (
            <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
                <Toasty />
                <LightsHeader>
                    <BadgeConnectionStatus
                        online={!isInitialLoading}
                        error={true}
                        errorMessage={rateLimitTimeRemaining}/>
                </LightsHeader>
                <Center>
                    <Text>{(
                        // It is complicated to assert the type of "error" destructured from useQuery,
                        // because we can't assert type with angled brackets while destructuring since
                        // this is a TSX file. So, error is of type "unknown" for now.
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
                <BadgeConnectionStatus online={!isInitialLoading}/>
            </LightsHeader>
            <Stack align="center" justify="center" spacing="xl">
                <LightsTable lights={lights} isLoading={isInitialLoading}/>
            </Stack>
        </MantineProvider>
    );
}
