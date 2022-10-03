import { MantineProvider, createStyles, Text, Button, Stack, Divider } from "@mantine/core"
import { theme } from "./theme"
import { TableOfLights } from "./components/ProgressTable"
import {SyntheticEvent, useState} from "react"
import {goveeDevice, goveeDevicesMap, goveeDeviceWithState, goveeStateResponse} from "./interfaces/interfaces"
import { RefreshIcon } from "./components/Icons"

const initialDevices: goveeDeviceWithState[] = []
const devicesURL = "http://localhost:3001/devices"
const stateURL = "http://localhost:3001/devices/state"
const backgroundColor = "#1A1B1E"
const backgroundFlashColor = "#2A2B2E"

const useStyles = createStyles((theme) => ({
    hidden: {
        opacity: 0,
        transition: 'opacity 200ms ease-in-out'
    },
    visible: {
        opacity: 1,
        transition: 'opacity 200ms ease-in-out',
    }
}))

export default function App() {
    const [connectedLights, setConnectedLights] = useState(initialDevices)
    const [buttonColor, setButtonColor] = useState("teal")
    const [rateLimit, setRateLimit] = useState(0)
    const [buttonText, setButtonText] = useState("Connect to 7MD Lights")
    const { classes } = useStyles()

    async function startRateLimitTimer(responseBody: any) {
        console.log("startRateLimitTimer", responseBody)
    }


    async function handleButtonClick(event: SyntheticEvent) {
        let target = event.target as HTMLElement

        if (target.tagName === "SPAN") {
            // The Mantine button text is a span, wrapped in a div, sat inside button.
            // TODO: Refactor this to be less dumb.
            target = target.parentElement!.parentElement!
        }
        target.classList.add("fetching")
        setButtonText("Connecting...")
        await getStatusOfLights()
        target.classList.remove("fetching")
        flashBackground()
        setButtonText("Refresh")
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
        const onlineDevices: goveeDevice[] = await response.json()
        const completeDevices: goveeDevicesMap = {}
        const deviceStatsPromises = []
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
        }
        for (const device in completeDevices) {
            results.push(completeDevices[device])
        }
        setConnectedLights(results)
    }

    return (
        <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
            <Stack align="center" justify="center" spacing="xl">
                <Button color={buttonColor}
                        onClick={handleButtonClick}
                        className="btn-lights-status">
                    {buttonText}
                </Button>
                <TableOfLights lights={connectedLights}/>
            </Stack>
        </MantineProvider>
    );
}
