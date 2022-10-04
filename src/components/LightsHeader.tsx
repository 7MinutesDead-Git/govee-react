import { Header } from "@mantine/core"
import React from "react"


interface LightsHeaderProps {
    children?: React.ReactNode,
    color?: string,
}

const height = "3rem"

const styles = {
    lightsHeader: {
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        width: "100%",
        height: height,
        backgroundColor: "#121111",
        padding: "0 1rem",
        zIndex: 100,
    } as React.CSSProperties,
}


export const LightsHeader = (props: LightsHeaderProps) => {
    return (
        <Header
            height={height}
            withBorder={true}
            fixed={true}
            style={styles.lightsHeader}
        >
            {props.children}
        </Header>
    )
}