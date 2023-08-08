import { Overlay } from "@mantine/core"
import {ReactNode, useContext, useState} from "react"
import { LoggedIn } from "../providers/session"
import toast from "react-hot-toast"


interface LoginOverlayProps {
    children?: ReactNode
    onClick?: () => void
}

const opacity = 0.8

export const LoginOverlay = (props: LoginOverlayProps) => {
    const loggedIn = useContext(LoggedIn)
    const [color, setColor] = useState(43)

    function handleClick() {
        toast.dismiss()
        setColor(100)
        toast.error("You need to login first.")
        setTimeout(() => {
            setColor(43)
        }, 100)
    }

    return (
        <>{!loggedIn && <Overlay
            gradient={`linear-gradient(128deg, rgba(${color},43,43,${opacity}) 0%, rgba(0,0,0,${opacity}) 100%);`}
            color="black"
            zIndex={3}
            onClick={handleClick}/>
        }</>
    )
}
