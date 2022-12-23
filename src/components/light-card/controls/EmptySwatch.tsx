import {ColorSwatch, Text, MantineNumberSize, Styles, ColorSwatchStylesParams} from "@mantine/core"

interface EmptyColorSwatchProps {
    size: number
    color?: string
    title?: string
    radius: MantineNumberSize | undefined
    styles: Styles<"children" | "root" | "overlay" | "shadowOverlay" | "alphaOverlay", ColorSwatchStylesParams> | undefined
    onClick: () => void
}

export const EmptySwatch = (props: EmptyColorSwatchProps) => {
    return (
        <ColorSwatch
            title={props.title}
            color="transparent"
            radius={props.radius}
            size={props.size}
            styles={props.styles}
            onClick={props.onClick}>
            <Text size="xl" color="dimmed">+</Text>
        </ColorSwatch>
    )
}