import { MantineProvider, createStyles, Text, Button, Stack } from "@mantine/core"
import { theme } from "./theme"
import { TableOfLights } from "./components/ProgressTable"
import { useEffect, useState } from "react"
import { goveeDevice } from "./interfaces/interfaces";

const initialDevices: goveeDevice[] = []
const devicesURL = "http://localhost:3001/devices"

const useStyles = createStyles((theme) => ({
    hidden: {
        opacity: 0,
        transition: 'opacity 200ms ease-in-out',
    },
    visible: {
        opacity: 1,
        transition: 'opacity 200ms ease-in-out',
    }
}))

export default function App() {
    const cyberPink = "#ff0051"
    const oceanGreen = "#04E184"
    const backgroundColor = "#1A1B1E"
    const backgroundFlashColor = "#2A2B2E"

    const [connectedLights, setConnectedLights] = useState(initialDevices)
    const [buttonColor, setButtonColor] = useState(cyberPink)
    const [rateLimit, setRateLimit] = useState(0)
    const { classes } = useStyles()

    async function startRateLimitTimer(responseBody: any) {
        console.log("startRateLimitTimer", responseBody)
    }


    async function handleButtonClick() {
        if (buttonColor === cyberPink) {
            setButtonColor(oceanGreen)
        }
        else {
            setButtonColor(cyberPink)
        }
        await getStatusOfLights()
        flashBackground()
    }

    function flashBackground() {
        const body = document.querySelector("body")
        body!.style.backgroundColor = backgroundFlashColor
        setTimeout(() => {
            body!.style.backgroundColor = backgroundColor
        }, 200)
    }

    async function getStatusOfLights() {
        const response = await fetch(devicesURL);
        const onlineDevices: goveeDevice[] = await response.json();
        setConnectedLights(onlineDevices);
    }

    return (
        <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
            <Stack align="center" mt={50}>
                <Text size="xl" weight={500}>
                    THE TIME IS NOW!
                </Text>
                <Button
                    color={buttonColor}
                    onClick={handleButtonClick}
                    className="btn-lights-status">
                    Check For Lights
                </Button>
                <TableOfLights data={connectedLights}/>
            </Stack>
        </MantineProvider>
    );
}
