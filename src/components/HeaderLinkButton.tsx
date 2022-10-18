import {Button} from "@mantine/core"
import React from "react"

interface HeaderLinkButtonProps {
    children?: React.ReactNode
    color?: string
    href?: string
    onMouseOver?: () => void
    onMouseOut?: () => void
    animation: string
}

const styles = {
    button: (animation: string) => ({
        root: {
            margin: "0 0.3rem",
            padding: "0 0.5rem 0 0",
            transition: "all 1s ease-in-out",
            "&:hover": {
                transition: "all 0.1s ease-in-out",
                backgroundColor: "#6a0dff",
                color: "white",
            },
            animation: animation,
        }
    })
}

export const HeaderLinkButton = (props: HeaderLinkButtonProps) => {
    return (
        <Button
            onMouseOut={props.onMouseOut}
            onMouseOver={props.onMouseOver}
            component="a"
            href={props.href}
            target="_blank"
            rel="noopener noreferrer"
            styles={() => styles.button(props.animation)}
            color="indigo"
            variant="subtle"
            radius="xs"
            size="sm">
            {props.children}
        </Button>
    )
}