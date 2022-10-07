import { createStyles, Table, Slider, ColorPicker, Text, Loader, Center } from '@mantine/core'
import { goveeDeviceNameOnly, goveeDeviceWithState,} from '../interfaces/interfaces'
import React, { useEffect, useRef, useState} from 'react'
import { BadgeNetworkStatus, BadgeIlluminationStatus } from "./Badges"
import { devicesURL } from "../config"
import { LightTableProps, LightTableRowProps} from "../interfaces/interfaces";

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


const LightTableRow = (props: LightTableRowProps) => {
    const { light } = props
    const blackColor = {r: 0, g: 0, b: 0}
    const makingLight = light.status.powerState === "on"
        && light.status.brightness > 0
        && light.status.color !== blackColor

    const [ brightness, setBrightness ] = useState(light.status.brightness)
    const online = light.status.online
    const [ rateLimited, setRateLimited ] = useState(false)
    const [ illuminating, setIlluminating ] = useState(makingLight)
    const [ color, setColor ] = useState("")
    const [rowFetchStyle, setRowFetchStyle] = useState(rowStyles.fetchReset)
    const colorChangeDebounceTimer = useRef(setTimeout(() => {}, 0))

    async function changeBrightness(device: string, model: string, inputBrightness: number) {
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
            setBrightness(inputBrightness)
            updateIllumination(inputBrightness)
            flashRowOnSuccess()
            setRateLimited(false)
        }
        else if (response.status === 429) {
            console.log(response)
            setBrightness(light.status.brightness)
            updateIllumination(inputBrightness)
            flashRowOnFailure()
            setRateLimited(true)
        }
        else {
            console.log("Hmm, something went wrong.", response)
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
                inputColor === "#000000" ? updateIllumination(0) : updateIllumination(brightness)
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
                    defaultValue={light.status.powerState === "on" ? light.status.brightness : 0}
                    style={rowStyles.controlSurface}
                    onChangeEnd={(currentValue) => changeBrightness(light.id, light.details.model, currentValue)}
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