import {Header, Center} from "@mantine/core"
import { CSSProperties, ReactNode } from "react"
import { HeaderLinkButton } from "./HeaderLinkButton"
import { SocialIcon } from "react-social-icons"


interface LightsHeaderProps {
    children?: ReactNode,
    color?: string,
}

const height = "3rem"

const styles = {
    headerButtonAnimationNoHover: (delay: number) => `headerButtonCompleteNoHover 1s ease-in-out ${delay}s`,
    headerButtonNoAnimation: "none",
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
    } as CSSProperties,

    socialIcons: {
        height: 40,
        width: 40,
    } as CSSProperties,
}

export const LightsHeader = (props: LightsHeaderProps) => {

    return (
        <Header
            className="header-social-links"
            height={height}
            withBorder={true}
            fixed={true}
            style={styles.lightsHeader}>
            <Center>
                <HeaderLinkButton href="https://7minutes.dev/?referrer=govee" className="link-portfolio">
                    <SocialIcon
                        network=""
                        target="_blank"
                        className="social-icon"
                        style={styles.socialIcons}
                        fgColor="#cdd9e5"
                        bgColor="transparent"/>
                    7minutes.dev
                </HeaderLinkButton>
                <HeaderLinkButton href="https://www.linkedin.com/in/alexgulikers/" className="link-linkedin">
                    <SocialIcon
                        network="linkedin"
                        target="_blank"
                        className="social-icon"
                        style={styles.socialIcons}
                        fgColor="#cdd9e5"
                        bgColor="transparent"/>
                    contact
                </HeaderLinkButton>
                <HeaderLinkButton href="https://github.com/7MinutesDead-Git/govee-react" className="link-github">
                    <SocialIcon
                        network="github"
                        target="_blank"
                        className="social-icon"
                        style={styles.socialIcons}
                        fgColor="#cdd9e5"
                        bgColor="transparent"/>
                    repo
                </HeaderLinkButton>
            </Center>
            {props.children}
        </Header>
    )
}