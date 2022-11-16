import { AiOutlineLogin } from "react-icons/ai";
import { CSSProperties } from "react";

interface LoginIconProps {
    style?: CSSProperties,
    color?: string,
}

export const LoginIcon = (props: LoginIconProps) => {
    return (
        <AiOutlineLogin
            size={20}
            color={props.color ?? "white"}
            style={props.style ?? {margin: "0 0.3rem"}}
        />
    )
}