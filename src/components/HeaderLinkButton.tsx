import {Button} from "@mantine/core"
import React from "react"

interface HeaderLinkButtonProps {
    children?: React.ReactNode
    color?: string
    href?: string
}

const styles = {
    button: () => ({
        root: {
            margin: "0 0.3rem",
            padding: "0 0.5rem 0 0",
            transition: "all 1s ease-in-out",
            "&:hover": {
                transition: "all 0.1s ease-in-out",
                backgroundColor: "#6a0dff",
                color: "white",
            }
        }
    })
}

export const HeaderLinkButton = (props: HeaderLinkButtonProps) => {
    return (
        <Button
            component="a"
            href={props.href}
            target="_blank"
            rel="noopener noreferrer"
            styles={styles.button}
            color="indigo"
            variant="subtle"
            radius="xs"
            size="sm">
            {props.children}
        </Button>
    )
}