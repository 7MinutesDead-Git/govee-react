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
            margin: "0 0.5rem",
            transition: "all 1s ease-in-out",
            "&:hover": {
                transition: "all 0.1s ease-in-out",
                backgroundColor: "#17a985",
                color: "#cdd9e5",
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
            color="teal"
            variant="subtle"
            radius="xs"
            size="sm">
            {props.children}
        </Button>
    )
}