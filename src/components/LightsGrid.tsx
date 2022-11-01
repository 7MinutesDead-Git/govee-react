import {Loader, Center, Grid} from '@mantine/core'
import {goveeDeviceNameOnly, goveeDeviceWithState} from '../interfaces/interfaces'
import { LightsGridProps } from "../interfaces/interfaces"
import { LightCard } from "./LightCard"

const gridStyles = {
    grid: {
        width: '100%',
        margin: "0 auto",
        overflow: "hidden",
    }
}

export const LightsGrid = (props: LightsGridProps) => {
    if (props.isLoading) {
        return (
            <Center style={{minHeight: "80vh"}}>
                <Loader color="violet" size="xl" variant="bars"/>
            </Center>
        )
    }
    else if (!props.lights) {
        return (
            <Center style={{minHeight: "80vh"}}>
                No lights found. Are your lights registered and setup on Govee?
            </Center>
        )
    }
    const sortedLights = props.lights.sort((a: goveeDeviceNameOnly, b: goveeDeviceNameOnly) => {
        return a.details.deviceName.toLowerCase().localeCompare(b.details.deviceName.toLowerCase())
    })

    return (
        <Grid justify="center" align="center" columns={16} gutter="lg" style={gridStyles.grid}>
            {sortedLights.map((light: goveeDeviceWithState) => {
                return (
                    <Grid.Col key={light.id} sm={9} md={8} lg={6} xl={4} >
                        <LightCard light={light}/>
                    </Grid.Col>
                )
            })}
        </Grid>
    )
}