import {Header, Center} from "@mantine/core"
import React, {useEffect, useRef} from "react"
import { HeaderLinkButton } from "./HeaderLinkButton"
import { SocialIcon } from "react-social-icons"
import {EffectButton} from "./EffectButton";


interface LightsHeaderProps {
    children?: React.ReactNode,
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
    } as React.CSSProperties,

    socialIcons: {
        height: 40,
        width: 40,
    } as React.CSSProperties,
}

const initialEffectArrayWidth = Math.floor(window.innerWidth / 110)
const emptyEffectButtonArray = Array(initialEffectArrayWidth).fill(null)

export const LightsHeader = (props: LightsHeaderProps) => {
    const [ animationButtons, setAnimationButtons ] = React.useState(emptyEffectButtonArray)
    const [ effectArrayWidth, setEffectArrayWidth ] = React.useState(initialEffectArrayWidth)
    const [ headerButtonAnimation, setHeaderButtonAnimation ] = React.useState("none")
    const headerAnimationCompleteDelay = useRef(0)

    // Creates an array of EffectButtons to fill the header with staggered animations.
    function handleMouseOver(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        if (e.target instanceof HTMLAnchorElement) {
            // TODO: Remove this inline style when mousing out somehow.
            e.target.style.animation = styles.headerButtonNoAnimation
        }
        const buttons = Array(effectArrayWidth).fill(null)
        const staggeredDelayButtons = buttons.map((button, index) => {
            const delay = 0.05 * (buttons.length - index)
            return <EffectButton animationDelay={0.05 * (buttons.length - index)} key={`effect-button-${index}-${delay}`}/>
        })
        headerAnimationCompleteDelay.current = buttons.length * 0.05
        setHeaderButtonAnimation(() => styles.headerButtonAnimationNoHover(headerAnimationCompleteDelay.current))
        setAnimationButtons(staggeredDelayButtons)
    }
    // Removes the EffectButtons from the header.
    function handleMouseOut() {
        setAnimationButtons(emptyEffectButtonArray)
        setHeaderButtonAnimation("none")
    }

    // Updates the number of EffectButtons in the header when the window is resized.
    useEffect(() => {
        function handleResize() {
            const newWidth = Math.floor(window.innerWidth / 110)
            setEffectArrayWidth(newWidth)
        }
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    })

    return (
        <Header
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            height={height}
            withBorder={true}
            fixed={true}
            style={styles.lightsHeader}>
            <Center>
                <HeaderLinkButton href="https://7minutes.dev/?referrer=govee" animation={headerButtonAnimation}>
                    <SocialIcon
                        network=""
                        target="_blank"
                        className="social-icon"
                        style={styles.socialIcons}
                        fgColor="#cdd9e5"
                        bgColor="transparent"/>
                    7minutes.dev
                </HeaderLinkButton>
                <HeaderLinkButton href="https://www.linkedin.com/in/alex-gulikers-28256a219/" animation={headerButtonAnimation}>
                    <SocialIcon
                        network="linkedin"
                        target="_blank"
                        className="social-icon"
                        style={styles.socialIcons}
                        fgColor="#cdd9e5"
                        bgColor="transparent"/>
                    contact
                </HeaderLinkButton>
                <HeaderLinkButton href="https://github.com/7MinutesDead-Git/govee-react" animation={headerButtonAnimation}>
                    <SocialIcon
                        network="github"
                        target="_blank"
                        className="social-icon"
                        style={styles.socialIcons}
                        fgColor="#cdd9e5"
                        bgColor="transparent"/>
                    repo
                </HeaderLinkButton>
                <div className="hover-effect">
                    { animationButtons }
                </div>
            </Center>
            {props.children}
        </Header>
    )
}