import { createStyles, Table, Badge, Slider, ColorPicker, Text } from '@mantine/core'
import {goveeDevice, goveeDevicesResponse, goveeDeviceWithState} from '../interfaces/interfaces'
import {useEffect, useRef, useState} from 'react'

const useStyles = createStyles((theme) => ({
    progressBar: {
        '&:not(:first-of-type)': {
            borderLeft: `3px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white}`,
        },
    },
    label: {
        top: 0,
        height: 28,
        lineHeight: '28px',
        width: 34,
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 700,
        backgroundColor: 'transparent',
    },
    thumb: {
        backgroundColor: theme.colors[theme.primaryColor][6],
        height: 28,
        width: 34,
        border: 'none',
    },
    dragging: {
        transform: 'translate(-50%, -50%)',
    },
    hidden: {
        opacity: 0,
        transition: 'opacity 1s ease-in-out',
    },
    visible: {
        opacity: 1,
        transition: 'opacity 1s ease-in-out',
    },
    "control-surface": {
        padding: "1.5rem 0"
    }
}));


function rgbToHex(r: number, g: number, b: number) {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16)
        return hex.length === 1 ? "0" + hex : hex
    }).join("")
}


export function TableOfLights(props: any) {
    const [ brightness, setBrightness ] = useState(0)
    const { classes, theme } = useStyles();
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
        const response = await fetch(`http://localhost:3001/devices`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commandBody)
        })

        // TODO: Figure out a way to deal with rate limiting, show visually.
        if (response.status === 200) {
            setBrightness(inputBrightness)
        }
        else {
            console.log("Hmm, something went wrong.", response)
        }
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
            const response = await fetch(`http://localhost:3001/devices`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commandBody)
            })
            if (response.status === 200) {
                console.log("Color changed successfully.")
            }
            else {
                console.log("Hmm, something went wrong.", response)
            }
        }
    }

    const rowsSorted = props.data.sort((a, b) => {
        return a.details.deviceName.toLowerCase().localeCompare(b.details.deviceName.toLowerCase())
    })
    const rows = rowsSorted.map((light: goveeDeviceWithState) => {
        let currentColor = ""
        const lightStatus = light.status.online ?
            <Badge color="green" variant="filled"> Online </Badge> :
            <Badge color="red" variant="filled"> Offline </Badge>

        // This can happen when setting the lights to a bulb color and brightness, rather than an RGB one.
        if (light.status.colorTem) {
            currentColor = "FFFFFF"
        }
        else if (light.status.color) {
            const red = light.status.color.r
            const green = light.status.color.g
            const blue = light.status.color.b
            currentColor = rgbToHex(red, green, blue)
        }

        return (
            <tr key={light.id}>
                <td>
                    <Text component="span"
                          align="center"
                          variant="gradient"
                          gradient={{ from: 'indigo', to: 'pink', deg: 45 }}
                          size="xl"
                          weight={700}
                          style={{ fontFamily: 'Greycliff CF, sans-serif' }}>
                        {light.details.deviceName}
                    </Text>
                </td>
                <td>{light.details.model}</td>
                <td>{lightStatus}</td>
                <td>
                    <ColorPicker
                        fullWidth={true}
                        value={currentColor}
                        size="sm"
                        // According to Mantine docs, onChangeEnd is supposed to exist on ColorPicker element but doesn't,
                        // so we'll need to debounce in changeColor method.
                        onChange={(color) => changeColor(light.id, light.details.model, color)}
                        className={classes["control-surface"]}
                    />
                    <Slider
                        radius="xl"
                        size="xl"
                        color="grape"
                        precision={0}
                        defaultValue={light.status.brightness}
                        className={classes["control-surface"]}
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
    })

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
                {rows}
            </tbody>
        </Table>
    )
}