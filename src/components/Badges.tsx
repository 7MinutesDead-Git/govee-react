import { Badge } from "@mantine/core"

const badgeStyles = {
    badge: {
        transition: "all 0.3s ease-in-out",
        margin: "0 0.5rem",
    },
    networkOnline: {},
    networkOffline: {},
    illuminationLight: {
        animation: "blink 2s linear infinite"
    },
    illuminationDark: {
        animation: "none",
        color: "#5a5c61",
        backgroundColor: "#242528"
    }
}

enum BadgeColors {
    green = "green",
    red = "red",
    teal = "teal",
    dark = "dark"
}

interface BadgeProps {
    online?: boolean,
    illuminating?: boolean,
    rateLimited?: boolean,
}


// ----------------------------------------------------------------
export const BadgeNetworkStatus = (props: BadgeProps) => {
    // Functions
    function getColor() {
        return props.online ? BadgeColors.green : BadgeColors.red
    }
    function getStyle() {
        return props.online ? badgeStyles.networkOnline : badgeStyles.networkOffline
    }
    function getText() {
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
    return (
        <Badge color={getColor()} variant="outline" style={getStyle()}>
            {getFetchStatus()}
        </Badge>
    )
}