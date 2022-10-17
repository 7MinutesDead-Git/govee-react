import { Table, Loader, Center } from '@mantine/core'
import { goveeDeviceNameOnly, goveeDeviceWithState,} from '../interfaces/interfaces'
import { LightTableProps } from "../interfaces/interfaces"
import React from "react"
import { LightCard } from "./LightCard"


export const LightsTable = (props: LightTableProps) => {
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
        tableContent = (
            <tr>
                <td colSpan={4}>
                    <Center style={{minHeight: "80vh"}}>
                        Need some lights?
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
            return (<LightCard light={light} key={light.id}/>)
        })
    }


    return (
        <Table sx={{ maxWidth: '1000px' }}
               verticalSpacing="xs"
               striped={true}
               horizontalSpacing="xs"
               highlightOnHover={true}>
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