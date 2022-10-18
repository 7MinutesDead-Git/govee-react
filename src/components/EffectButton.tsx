import {Button} from "@mantine/core"
import React from "react"

interface EffectButtonProps {
    children?: React.ReactNode
    color?: string,
    animationDelay: number,
}

const styles = {
    hoverEffect: (delay: number) => ({
        root: {
            width: "2.5rem",
            margin: "0 0.25rem",
            transition: "all 1s ease-in-out",
            opacity: 0,
            animation: `headerEffect 1s ease-in-out ${delay}s`,
        }
    }),
}

export const EffectButton = (props: EffectButtonProps) => {
    return (
        <Button
            component="div"
            className="effect-button"
            styles={() => styles.hoverEffect(props.animationDelay)}
            color="indigo"
            variant="subtle"
            radius="xs"
            size="sm">
            {props.children}
        </Button>
    )
}