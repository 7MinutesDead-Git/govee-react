import { Header, Center } from "@mantine/core"
import React from "react"
import { HeaderLinkButton } from "./HeaderLinkButton"
import { SocialIcon } from "react-social-icons"


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
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: height,
        backgroundColor: "#121111",
        padding: "0 1rem",
        zIndex: 100,
    } as React.CSSProperties,

    socialIcons: {
        height: 40,
        width: 40,
    } as React.CSSProperties,
}


export const LightsHeader = (props: LightsHeaderProps) => {
    return (
        <Header
            height={height}
            withBorder={true}
            fixed={true}
            style={styles.lightsHeader}>
            <Center>
                <HeaderLinkButton href="https://7minutes.dev/?referrer=govee" color="">
                    <SocialIcon
                        url="https://github.com/7MinutesDead-Git/govee-react"
                        target="_blank"
                        className="social-icon"
                        style={styles.socialIcons}
                        fgColor="#cdd9e5"
                        bgColor="transparent"/>
                    Github
                </HeaderLinkButton>
                <HeaderLinkButton
                    href="https://7minutes.dev/?referrer=govee"
                    color="">
                    7 Minutes Dev
                </HeaderLinkButton>
            </Center>
            {props.children}
        </Header>
    )
}