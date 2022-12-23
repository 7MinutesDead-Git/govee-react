import { goveeDeviceWithState, Preset } from "../../../interfaces/interfaces"
import { useLocalStorageState } from "../../../utils/hooks"
import { useRef } from "react"
import { Accordion, CloseButton, ColorSwatch, Grid, Text } from "@mantine/core"
import { cardStyles, swatchSize } from "../LightCardStyles"
import { motion } from "framer-motion"
import { EmptySwatch } from "./EmptySwatch"

const swatchDefaults: Preset[] = [
    { color: '#fa5252', brightness: 100 },
    { color: '#7950f2', brightness: 100 },
    { color: '#4c6ef5', brightness: 100 },
    { color: '#15aabf', brightness: 100 },
    { color: '#82c91e', brightness: 100 },
    { color: '#000317', brightness: 10 },
]

interface SwatchesDisplayProps {
    light: goveeDeviceWithState
    brightnessSliderValue: number
    color: string
    setBrightnessSliderValue: (value: number) => void
    changeColor: (color: string) => Promise<void>
    changeBrightness: (brightness: number) => Promise<void>
}


export const SwatchesDisplay = (props: SwatchesDisplayProps) => {
    const light = props.light
    const clickedSwatch = useRef(false)
    const [ swatches, setSwatches ] = useLocalStorageState(`${light.id}-swatches`, swatchDefaults)

    function addSwatch(color: string) {
        const newSwatches = [...swatches]
        const newPreset = { color: color, brightness: props.brightnessSliderValue }
        newSwatches.push(newPreset)
        setSwatches(newSwatches)
    }

    function deleteSwatch(preset: Preset) {
        const newSwatches = [...swatches]
        const index = newSwatches.findIndex((item) => item.color === preset.color)
        newSwatches.splice(index, 1)

        if (newSwatches.length === 0) {
            setSwatches(swatchDefaults)
            return
        }
        setSwatches(newSwatches)
    }

    async function handleSwatchClick(preset: Preset) {
        clickedSwatch.current = true
        props.setBrightnessSliderValue(preset.brightness)
        await props.changeColor(preset.color)
        await props.changeBrightness(preset.brightness)
    }

    return (
        <Accordion variant="contained" radius="xs" defaultValue="color presets" chevronPosition="left">
            <Accordion.Item value="presets">
                <Accordion.Control>Presets</Accordion.Control>
                <Accordion.Panel>
                    <Grid gutter={20} style={cardStyles.colorPicker.swatchesGrid}>
                        {swatches.map((colorPreset: Preset, index: number) => {
                            return (
                                <motion.div key={`${light.id}-${index}-${colorPreset.color}`}
                                            whileHover={{ filter: "brightness(1.3)" }}
                                            whileTap={{ scale: 0.9 }}>
                                    <ColorSwatch
                                        title={colorPreset.color}
                                        color={colorPreset.color}
                                        radius="xs"
                                        size={swatchSize}
                                        onClick={() => handleSwatchClick(colorPreset)}
                                        styles={cardStyles.colorPicker.swatchRoot}>
                                        <Text style={cardStyles.colorPicker.swatchBrightness}>
                                            {colorPreset.brightness}
                                        </Text>
                                    </ColorSwatch>
                                    <CloseButton
                                        title="Delete color"
                                        size="sm"
                                        iconSize={15}
                                        style={cardStyles.colorPicker.closeButton}
                                        onClick={() => deleteSwatch(colorPreset)}/>
                                </motion.div>
                            )
                        })}
                        <EmptySwatch
                            title="Add color"
                            radius="xs"
                            size={swatchSize}
                            styles={{...cardStyles.colorPicker.swatchRoot}}
                            onClick={() => addSwatch(props.color)}/>
                    </Grid>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    )
}