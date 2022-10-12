import { Table, Slider, ColorPicker, Text, Loader, Center } from '@mantine/core'
import { goveeDeviceNameOnly, goveeDeviceWithState,} from '../interfaces/interfaces'
import { useEffect, useRef, useState} from 'react'
import { BadgeNetworkStatus, BadgeIlluminationStatus } from "./Badges"
import { devicesURL } from "../config"
import { LightTableProps, LightTableRowProps} from "../interfaces/interfaces"
import { useMutation, useQueryClient } from "@tanstack/react-query"

const rowStyles = {
    controlSurface: {
        padding: "1.5rem 0"
    },
    fetchSuccess: {
        animation: "success 0.5s ease-in-out",
        animationFillMode: "forwards",
    },
    fetchFailure: {
        animation: "failure 2s ease-in-out infinite",
        animationFillMode: "forwards",
    },
    fetchNewSync: {
        animation: "newSync 0.5s ease-in-out",
        animationFillMode: "forwards",
    },
    fetchReset: {
        animation: "",
        animationFillMode: ""
    }
}


function rgbToHex(r: number, g: number, b: number) {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16)
        return hex.length === 1 ? "0" + hex : hex
    }).join("")
}


export const TableOfLights = (props: LightTableProps) => {
    let tableContent: React.ReactNode

    if (props.isLoading) {
        tableContent = (
            <tr>
                <td colSpan={4}>
                    <Center style={{minHeight: "80vh"}}>
                        <Loader color="violet" size="xl"/>
                    </Center>
                </td>
            </tr>
        )
    }
    else if (!props.lights) {
        console.error("No lights provided to TableOfLights")
        tableContent = (
            <tr>
                <td colSpan={4}>
                    <Center style={{minHeight: "80vh"}}>
                        No lights found
                    </Center>
                </td>
            </tr>
        )
    }
    else {
        const rowsSorted = props.lights.sort((a: goveeDeviceNameOnly, b: goveeDeviceNameOnly) => {
            return a.details.deviceName.toLowerCase().localeCompare(b.details.deviceName.toLowerCase())
        })

        tableContent = rowsSorted.map((light: goveeDeviceWithState) => {
            return (<LightTableRow light={light} key={light.id}/>)
        })
    }


    return (
        <Table sx={{ maxWidth: '1000px' }}
               verticalSpacing="xs"
               striped={true}
               horizontalSpacing="xs"
               highlightOnHover={true}
               className="table-lights-status">
            <thead>
                <tr>
                    <th>Light Location</th>
                    <th>Model</th>
                    <th>Status</th>
                    <th>Color and Brightness</th>
                </tr>
            </thead>
            <tbody>
                {tableContent}
            </tbody>
        </Table>
    )
}

// TODO: react query has keepPreviousData and isPreviousData for some extra config to play with.
//  https://tanstack.com/query/v4/docs/guides/paginated-queries#better-paginated-queries-with-keeppreviousdata
//  "rather display the previous data on refreshes rather than that initial no-data spinner"
const LightTableRow = (props: LightTableRowProps) => {
    const queryClient = useQueryClient()
    const { light } = props
    const online = light.status.online
    const isIlluminating = light.status.powerState === "on" &&
        light.status.brightness > 0 &&
        light.status.color !== {r: 0, g: 0, b: 0}

    const [ rateLimited, setRateLimited ] = useState(false)
    const [ illuminating, setIlluminating ] = useState(isIlluminating)

    // Color hooks
    // TODO: Change color state hooks to useMutation.
    const [ color, setColor ] = useState("")
    const colorChangeDebounceTimer = useRef(setTimeout(() => {}, 0))

    // Brightness hooks
    const brightnessSliderChanging = useRef(false)
    const [ brightnessSliderValue, setBrightnessSliderValue] = useState(light.status.brightness)
    const lastBrightnessFetched = useRef(light.status.brightness)
    const brightnessMutation = useMutation((value: number) => changeBrightness(value))

    // Flashes background of row to indicate various state updates.
    const [ rowFetchStyle, setRowFetchStyle ] = useState(rowStyles.fetchReset)

    async function changeBrightness(inputBrightness: number) {
        brightnessSliderChanging.current = false
        const device = light.id
        const model = light.details.model
        const commandBody = {
            "device": device,
            "model": model,
            "cmd": {
                "name": "brightness",
                "value": inputBrightness
            }
        }
        const response = await fetch(devicesURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commandBody)
        })
        if (response.status === 200) {
            updateIllumination(inputBrightness)
            flashRowOnSuccess()
            setRateLimited(false)
        }
        else if (response.status === 429) {
            console.log(response)
            updateIllumination(inputBrightness)
            flashRowOnFailure()
            setRateLimited(true)
            throw new Error("Rate limited")
        }
        else {
            console.log("Hmm, something went wrong.", response)
            throw new Error("Something went wrong")
        }
    }

    function flashRowOnSuccess() {
        setRowFetchStyle(rowStyles.fetchSuccess)
        setTimeout(() => {
            setRowFetchStyle(rowStyles.fetchReset)
        }, 1000)
    }
    function flashRowOnFailure() {
        setRowFetchStyle(rowStyles.fetchFailure)
    }

    function updateIllumination(brightness: number) {
        brightness > 0 ? setIlluminating(true) : setIlluminating(false)
    }

    // Sends a debounced request to the server to change the color of the light.
    async function changeColor(device: string, model: string, inputColor: string) {
        clearTimeout(colorChangeDebounceTimer.current)
        colorChangeDebounceTimer.current = setTimeout(sendColorChange, 500)

        async function sendColorChange() {
            const commandBody = {
                "device": device,
                "model": model,
                "cmd": {
                    "name": "color",
                    "value": {
                        "r": parseInt(inputColor.slice(1, 3), 16),
                        "g": parseInt(inputColor.slice(3, 5), 16),
                        "b": parseInt(inputColor.slice(5, 7), 16)
                    }
                }
            }
            const response = await fetch(devicesURL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commandBody)
            })
            if (response.status === 200) {
                setColor(inputColor)
                // Sending black as a color request to their API turns the light off lol.
                inputColor === "#000000" ? updateIllumination(0) : updateIllumination(light.status.brightness)
                flashRowOnSuccess()
                setRateLimited(false)
            }
            else if (response.status === 429) {
                setColor(color)
                flashRowOnFailure()
                setRateLimited(true)
                console.log("Rate limit exceeded.")
            }
            else {
                console.log("Hmm, something went wrong.", response)
            }
        }
    }

    useEffect(() => {
        // This can happen when setting the lights to a bulb color and brightness, rather than an RGB one.
        if (light.status.colorTem) {
            setColor("#ffffff")
        }
        else if (light.status.color) {
            const red = light.status.color.r
            const green = light.status.color.g
            const blue = light.status.color.b
            setColor(rgbToHex(red, green, blue))
        }
    },[light.status.color, light.status.colorTem])


    // Setting the value of the slider to the light.status.brightness props
    // would lock the slider animation in place since the props wouldn't change
    // until the next sync. That meant the value resetting as you dragged the slider,
    // since dragging the slider means a re-render.
    // So, this function allows the slider value to update freely based on the value
    // being returned from onChange() within the slider component,
    // and will also update the brightness value when the parent refetching finds updated data
    // and causes a re-render.
    function handleBrightnessSliderValue() {
        if (brightnessSliderChanging.current) {
            return brightnessSliderValue
        }
        else if (lastBrightnessFetched.current !== light.status.brightness) {
            lastBrightnessFetched.current = light.status.brightness
            return light.status.brightness
        }
    }
    // Set our display brightness value to the slider value returned from the onChange() function,
    // and sets a reference boolean flag to indicate the value is currently changing.
    function handleBrightnessSliderChange(sliderValue: number) {
        brightnessSliderChanging.current = true
        setBrightnessSliderValue(sliderValue)
    }


    return (
        <tr style={rowFetchStyle}>
            <td>
                <Text component="span"
                      align="center"
                      variant="gradient"
                      gradient={{ from: '#FFFFFF', to: '#FAFAFA', deg: 45 }}
                      size="xl"
                      weight={700}
                      style={{ fontFamily: 'Greycliff CF, sans-serif' }}>
                    {light.details.deviceName}
                </Text>
            </td>
            <td>{light.details.model}</td>
            <td className="status-td">
                <BadgeNetworkStatus online={online}/>
                <BadgeIlluminationStatus illuminating={illuminating} rateLimited={rateLimited}/>
            </td>
            <td>
                <ColorPicker
                    fullWidth={true}
                    value={color}
                    size="sm"
                    // According to Mantine docs, onChangeEnd is supposed to exist on ColorPicker element but doesn't,
                    // so we'll need to debounce in changeColor method.
                    onChange={(inputColor) => changeColor(light.id, light.details.model, inputColor)}
                    style={rowStyles.controlSurface}
                />
                <Slider
                    size="xl"
                    thumbSize={25}
                    step={10}
                    color="dark"
                    precision={0}
                    value={handleBrightnessSliderValue()}
                    defaultValue={light.status.powerState === "on" ? light.status.brightness : 0}
                    style={rowStyles.controlSurface}
                    onChange={(currentValue) => handleBrightnessSliderChange(currentValue)}
                    onChangeEnd={(chosenValue) => brightnessMutation.mutate(chosenValue)}
                    marks={[
                        { value: 10, label: "Dim" },
                        { value: 50, label: "Moody" },
                        { value: 90, label: "Bright" },
                    ]}
                />
            </td>
        </tr>
    )
}