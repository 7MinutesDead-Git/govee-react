import {Button} from "@mantine/core"
import React from "react"

interface HeaderLinkButtonProps {
    children?: React.ReactNode
    color?: string
    href?: string
}

const styles = {
    button: {
        margin: "0 0.5rem",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
            transform: "translateY(-2px) !important",
        }
    }
}

export const HeaderLinkButton = (props: HeaderLinkButtonProps) => {
    return (
        <Button
            component="a"
            href={props.href}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.button}
            color={props.color}
            variant="subtle"
            radius="xs"
            size="sm">
            {props.children}
        </Button>
    )
}