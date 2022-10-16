import {Center, Loader, MantineProvider, Stack, Text} from "@mantine/core"
import {theme} from "./theme"
import {useQuery} from "@tanstack/react-query"
import {BadgeConnectionStatus} from "./components/Badges"
import {LightsTable} from "./components/LightsTable"
import {LightsHeader} from "./components/LightsHeader"
import {Toasty} from "./components/Toasty"
import {intervals} from "./config"
import {getAvailableLights, getRateLimitTimeRemaining, getStateOfLights} from "./api/fetch-utilities"


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
