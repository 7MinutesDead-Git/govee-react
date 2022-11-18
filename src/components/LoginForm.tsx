import {Modal, PasswordInput, TextInput, Button, Loader} from "@mantine/core"
import React, { useState } from "react"
import { useForm } from '@mantine/form'
import { HeaderLinkButton } from "./HeaderLinkButton"
import { LoginFormProps, LoginFormValues } from "../interfaces/interfaces"
import { LoginIcon } from "./Icons"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { authenticate } from "../api/fetch-utilities";

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
    })
    const authMutate = useMutation((input: LoginFormValues) => authenticate(input), {
        onSuccess: () => {
            setShowLoginForm(false)
            toast.success("Logged in successfully!")
        },
        onError: (error) => {
            // https://stackoverflow.com/a/67828747/13627106
            if (error instanceof Error) {
                toast.error(error.message)
            }
        }
    })

    function handleSubmit() {
        form.validate()
        authMutate.mutate(form.values)
    }

    return (
        <>
            <Modal
                opened={showLoginForm}
                centered={true}
                onClose={() => setShowLoginForm(false)}
                title="Hey there!">
                <form onSubmit={form.onSubmit(() => handleSubmit())} style={formStyles.form}>
                    <TextInput
                        label="username"
                        placeholder="DayMan"
                        autoComplete="username"
                        styles={formStyles.input}
                        {...form.getInputProps('username')}/>
                    <PasswordInput
                        label="password"
                        placeholder="master0ftheN1ghtm4n"
                        autoComplete="current-password"
                        styles={formStyles.input}
                        {...form.getInputProps('password')}/>

                    {authMutate.isLoading ? (
                        <Button type="submit" variant="outline" color="teal" radius="xs" disabled>
                            <Loader style={{margin: "0 0.3rem 0 0"}} color="#2bfabe"/>
                            Connecting
                        </Button>
                    ) : (
                        <Button type="submit" variant="outline" color="teal" radius="xs">
                            <LoginIcon style={{margin: "0 0.3rem 0 0"}} color="#2bfabe"/>
                            Connect
                        </Button>
                    )}
                </form>
            </Modal>
            <HeaderLinkButton onClick={() => setShowLoginForm(!showLoginForm)}>
                <LoginIcon/>
                {props.loggedIn ? "Logout" : "Login"}
            </HeaderLinkButton>
        </>
    );
}