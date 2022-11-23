import {Button} from "@mantine/core"
import React from "react"

interface HeaderLinkButtonProps {
    children?: React.ReactNode
    color?: string
    variant?: "filled" | "light" | "outline" | "default" | "subtle"
    href?: string
    className?: string
    onMouseOver?: () => void
    onMouseOut?: () => void
    onClick?: () => void
    animation?: string
}

const styles = {
    button: (animation: string) => ({
        root: {
            margin: "0 0.2rem",
            padding: "0 0.6rem 0 0",
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
            className={props.className ?? ""}
            onMouseOut={props.onMouseOut}
            onMouseOver={props.onMouseOver}
            onClick={props.onClick}
            component="a"
            href={props.href}
            target="_blank"
            rel="noopener noreferrer"
            styles={() => styles.button(props.animation ? props.animation : "none")}
            color={props.color ?? "indigo"}
            variant={props.variant ?? "subtle"}
            radius="xs"
            size="sm">
            {props.children}
        </Button>
    )
}