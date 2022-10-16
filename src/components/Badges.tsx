import { Badge } from "@mantine/core"
import React from "react"
import { useQueryClient } from "@tanstack/react-query"


const badgeStyles = {
    badge: {
        transition: "all 0.3s ease-in-out",
        margin: "0 0.5rem",
    },
    networkOnline: {},
    networkOffline: {
        animation: "none",
    },
    illuminationLight: {
        animation: "blink 2s linear infinite"
    },
    illuminationDark: {
        animation: "none",
        color: "#5a5c61",
        backgroundColor: "#242528"
    },
    // https://stackoverflow.com/a/69161332/13627106
    connectionStatus: {
        animation: "blink 4s linear infinite",
        margin: "0 0.5rem",
    } as React.CSSProperties,
}

enum BadgeColors {
    green = "green",
    red = "red",
    teal = "teal",
    dark = "dark",
    violet = "violet",
}

interface BadgeProps {
    online?: boolean,
    illuminating?: boolean,
    rateLimited?: boolean,
    error?: boolean,
    errorMessage?: string,
}


// ----------------------------------------------------------------
export const BadgeNetworkStatus = (props: BadgeProps) => {
    const queryClient = useQueryClient()

    // Functions
    function getColor() {
        return props.online ? BadgeColors.green : BadgeColors.red
    }
    function getStyle() {
        return props.online ? badgeStyles.networkOnline : badgeStyles.networkOffline
    }
    function getText() {
        if (queryClient.isFetching(["lights"])) {
            return "Updating"
        }
        return props.online ? "Online" : "Offline"
    }

    // Render
    return (
        <Badge color={getColor()} variant="dot" style={getStyle()}>
            {getText()}
        </Badge>
    )
}

// ----------------------------------------------------------------
export const BadgeIlluminationStatus = (props: BadgeProps) => {
    function getColor() {
        if (props.rateLimited) {
            return BadgeColors.red
        }
        return props.illuminating ? BadgeColors.teal : BadgeColors.dark
    }
    function getStyle() {
        return props.illuminating ?
            { ...badgeStyles.badge, ...badgeStyles.illuminationLight } :
            { ...badgeStyles.badge, ...badgeStyles.illuminationDark }
    }
    function getText() {
        return props.illuminating ? "Illuminating" : "Dark"
    }
    function getFetchStatus() {
        return props.rateLimited ? "Rate Limited" : getText()
    }

    // Render
    if (!props.online) {
        return (
            <Badge color={BadgeColors.red}
                   variant="outline"
                   style={{ ...badgeStyles.badge, ...badgeStyles.illuminationDark }}>
                No Power
            </Badge>
        )
    }

    return (
        <Badge color={getColor()} variant="outline" style={getStyle()}>
            {getFetchStatus()}
        </Badge>
    )
}

export const BadgeConnectionStatus = (props: BadgeProps) => {
    const queryClient = useQueryClient()

    if (props.error) {
        return (
            <Badge color={BadgeColors.red}
                   size="md"
                   variant="outline"
                   style={badgeStyles.networkOffline}>
                Wait {props.errorMessage}
            </Badge>
        )
    }
    if (props.online) {
        return (
            <Badge color={BadgeColors.green}
                   size="md"
                   variant="outline"
                   style={badgeStyles.connectionStatus}>
                Connected
            </Badge>
        )
    }

    if (queryClient.isFetching(["lights"])) {
        return (
            <Badge color={BadgeColors.teal}
                   size="md"
                   variant="outline"
                   style={badgeStyles.connectionStatus}>
                Updating
            </Badge>
        )
    }

    return (
        <Badge color={BadgeColors.violet}
               size="md"
               variant="outline"
               style={badgeStyles.connectionStatus}>
            Connecting
        </Badge>
    )
}