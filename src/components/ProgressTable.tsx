import { createStyles, Table, Badge, ScrollArea, Slider, Transition } from '@mantine/core'
import {goveeDevice, goveeDevicesResponse} from '../interfaces/interfaces'
import { useEffect, useState } from 'react'

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
    }
}));

export function TableOfLights(props: any) {
    const [ brightness, setBrightness ] = useState(0)
    const { classes, theme } = useStyles();

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
        const responseBody: goveeDevicesResponse = await response.json()
        console.log(responseBody)

        if (response.status === 200) {
            setBrightness(inputBrightness)
        }
        else {
            console.log("Hmm, something went wrong.", response)
        }
    }

    const rows = props.data.map((light: goveeDevice) => {
        const lightStatus = light.retrievable ?
            <Badge color='green' variant="filled"> Ready </Badge> :
            <Badge color='red' variant="filled"> Offline </Badge>

        return (
            <tr key={light.device}>
                <td>{light.deviceName}</td>
                <td>{light.model}</td>
                <td>{lightStatus}</td>
                <td>
                    <Slider
                        radius="xl"
                        size="xl"
                        color="grape"
                        precision={0}
                        defaultValue={brightness}
                        onChangeEnd={(currentValue) => changeBrightness(light.device, light.model, currentValue)}
                        marks={[
                            { value: 10, label: 'Dim' },
                            { value: 50, label: 'Moody' },
                            { value: 90, label: 'Bright' },
                        ]}
                    />
                </td>
            </tr>
        )
    })

    return (
        <Table
            sx={{ maxWidth: '800px' }}
            verticalSpacing="xl" striped={true}
            horizontalSpacing="xs"
            highlightOnHover={true}
            className="table-lights-status"
        >
            <thead>
                <tr>
                    <th>Light Location</th>
                    <th>Model</th>
                    <th>Status</th>
                    <th>Brightness</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
    )
}
