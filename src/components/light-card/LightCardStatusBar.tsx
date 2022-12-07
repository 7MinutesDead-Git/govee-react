import {Button, CopyButton, Group, Text} from "@mantine/core";
import {BadgeNetworkStatus} from "../Badges";
import {motion} from "framer-motion";
import {cardStyles} from "./LightCardStyles";
import {IconCopy} from "@tabler/icons";
import {goveeDeviceWithState} from "../../interfaces/interfaces";


interface LightCardStatusBarProps {
    grabberColor: string
    light: goveeDeviceWithState
    isLoading: boolean
}

export const LightCardStatusBar = (props: LightCardStatusBarProps) => {
    const { grabberColor, light, isLoading } = props

    return (
        <Group position="apart" mt="xs" mb="xs" spacing="xs" align="center">
            <BadgeNetworkStatus online={light.status.online} updating={isLoading}/>
            {/* Hex color copy button */}
            <CopyButton value={grabberColor} timeout={1000}>
                {({ copied, copy }) => (
                    <motion.div
                        whileHover={{
                            scale: 1.1,
                            transition: { duration: 0.1 },
                        }}
                        whileTap={{ scale: 0.9 }}>
                        <Button onClick={copy} color="dark" radius="xs" size="xs" uppercase styles={cardStyles.hexColorButton}>
                            <Text color={copied ? "white" : grabberColor} weight={500} style={cardStyles.hexColorText}>
                                {copied ? "copied" : grabberColor}
                            </Text>
                            <IconCopy color={copied ? "white" : grabberColor} size={16}/>
                        </Button>
                    </motion.div>
                )}
            </CopyButton>
        </Group>
    )
}