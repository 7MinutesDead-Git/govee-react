import { Center, Loader, MantineProvider, Stack, Text } from "@mantine/core"
import { theme } from "./theme"
import { useQuery } from "@tanstack/react-query"
import { BadgeConnectionStatus } from "./components/Badges"
import { LightsHeader } from "./components/LightsHeader"
import { Toasty } from "./components/Toasty"
import { QueryConfig } from "./config"
import { getAvailableLights, getStateOfLights } from "./utils/api/fetch-utilities"
import { LightsGrid } from "./components/LightsGrid"
import { LoggedIn } from "./providers/session"
import { useState } from "react";
import { LoginForm } from "./components/LoginForm"


export default function App() {
    const [loggedIn, setLoggedIn] = useState(false)
    const { error, data: connectedLights, isError, isLoading } = useQuery(
        ["connected"],
        () => getAvailableLights(),
        {
            staleTime: QueryConfig.staleTime,
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

    if (isLoading) {
        return (
            <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
                <Toasty />
                <LightsHeader>
                    <BadgeConnectionStatus online={!isLoading} error={false}/>
                </LightsHeader>
                <Center style={{minHeight: "80vh"}}>
                    <Loader color="white" size="xl" variant="bars"/>
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
