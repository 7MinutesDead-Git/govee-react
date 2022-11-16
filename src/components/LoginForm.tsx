import { Modal, PasswordInput, TextInput, Button } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import React, { useState } from "react"
import { useForm } from '@mantine/form'
import { HeaderLinkButton } from "./HeaderLinkButton"
import { LoginIcon } from "./Icons"

interface LoginFormProps {
    loggedIn: boolean,
}

interface LoginFormValues {
    username: string,
    password: string,
}

const formStyles = {
    form: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-around",
        width: "100%",
        height: "250px",
        padding: "0 0 1rem 0",
    } as React.CSSProperties,
    input: {
        root: {
            width: "65%",
        }
    },
    button: {
        root: {
            margin: "auto 0",
        }
    }
}

export const LoginForm = (props: LoginFormProps) => {
    const [ passwordVisible, { toggle: togglePasswordVisible } ] = useDisclosure(false)
    const [showLoginForm, setShowLoginForm] = useState(false)
    const form = useForm({
        initialValues: {
            username: '',
            password: '',
        },
        validate: {
            username: (value) => (value.length < 3 ? 'Username must have at least 3 letters' : null),
            password: (value) => (value.length < 3 ? 'Password must have at least 3 letters' : null),
        },
    });

    function handleSubmit(values: LoginFormValues) {
        form.validate()
        console.log(values)
    }

    return (
        <>
            <Modal
                opened={showLoginForm}
                centered={true}
                onClose={() => setShowLoginForm(false)}
                title="Hey there!">
                <form onSubmit={form.onSubmit((values) => handleSubmit(values))} style={formStyles.form}>
                    <TextInput
                        withAsterisk
                        label="username"
                        placeholder="DayMan"
                        styles={formStyles.input}
                        {...form.getInputProps('username')}/>
                    <PasswordInput
                        withAsterisk
                        label="password"
                        placeholder="master0ftheN1ghtm4n"
                        visible={passwordVisible}
                        styles={formStyles.input}
                        onVisibilityChange={togglePasswordVisible}
                        {...form.getInputProps('password')}/>
                    <Button type="submit" variant="outline" color="teal" radius="xs">
                        <LoginIcon style={{margin: "0 0.3rem 0 0"}} color="#2bfabe"/>
                        Connect
                    </Button>
                </form>
            </Modal>
            <HeaderLinkButton onClick={() => setShowLoginForm(!showLoginForm)}>
                <LoginIcon/>
                {props.loggedIn ? "Logout" : "Login"}
            </HeaderLinkButton>
        </>
    );
}