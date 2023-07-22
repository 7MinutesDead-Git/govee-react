import { Center, Loader, MantineProvider, Stack, Text } from "@mantine/core"
import { theme } from "./theme"
import { useQuery } from "@tanstack/react-query"
import { BadgeConnectionStatus } from "./components/Badges"
import { LightsHeader } from "./components/LightsHeader"
import { Toasty } from "./components/Toasty"
import { QueryConfig } from "./config"
import { getAvailableLights, getSession, getStateOfLights } from "./utils/api/fetch-utilities"
import { LightsGrid } from "./components/LightsGrid"
import { LoggedIn } from "./providers/session"
import {useEffect, useState} from "react"
import { LoginForm } from "./components/LoginForm"


export default function App() {
    const [loggedIn, setLoggedIn] = useState(false)
    // Check if we already have a user session, so we can be loggedIn.
    const sessionQuery = useQuery(["session"], getSession, {
        retry: false,
        refetchOnWindowFocus: false,
    })
    // Query to grab all lights that are connected to the Govee API.
    const { error, data: connectedLights, isError, isLoading } = useQuery(
        ["connected"],
        () => getAvailableLights(),
        {
            staleTime: QueryConfig.staleTime,
            refetchInterval: QueryConfig.refetchInterval,
            refetchIntervalInBackground: true,
            refetchOnWindowFocus: true,
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
            refetchInterval: QueryConfig.refetchInterval,
            refetchIntervalInBackground: true,
            staleTime: QueryConfig.staleTime,
        })

    useEffect(() => {
        // Slow speed spinner is created purely in CSS, so it can indicate loading for very slow connections
        // on initial load.
        // This means we'll need to hide the spinner once js is downloaded to render React components.
        const slowSpeedSpinner = document.querySelector(".slow-speed-spinner") as HTMLElement
        if (slowSpeedSpinner) {
            slowSpeedSpinner.style.display = "none"
        }
    }, [])

    // Check if we already have a user session, so we can be loggedIn on load.
    useEffect(() => {
        sessionQuery.isSuccess ? setLoggedIn(true) : setLoggedIn(false)
    }, [sessionQuery.status])

    // Render
    if (isError) {
        return (
            <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
                <Toasty />
                <LightsHeader>
                    <BadgeConnectionStatus online={!isInitialLoading} error={true}/>
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

    if (isLoading || sessionQuery.isLoading) {
        return (
            <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
                <Toasty />
                <LightsHeader>
                    <BadgeConnectionStatus online={!isLoading} error={false}/>
                </LightsHeader>
                <Center style={{minHeight: "80vh"}}>
                    <Loader color="#e11d6d" size="xl" variant="bars"/>
                </Center>
            </MantineProvider>
        )
    }

    return (
        <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
            <LoggedIn.Provider value={loggedIn}>
                <Toasty />
                <LightsHeader>
                    <Center>
                        {!isInitialLoading && <LoginForm loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>}
                        <BadgeConnectionStatus online={!isInitialLoading} error={false}/>
                    </Center>
                </LightsHeader>
                <Stack align="center" justify="center" spacing="xl">
                    <LightsGrid lights={lights} isLoading={isInitialLoading}/>
                </Stack>
            </LoggedIn.Provider>
        </MantineProvider>
    );
}
