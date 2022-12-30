import { cardStyles } from "../LightCardStyles"
import { durations } from "../../../utils/constants"
import { Dispatch } from "react"

interface CardFetchStyle {
    animation: string
    border: string
}

export function flashCardOnSuccess(setCardFetchStyle: Dispatch<CardFetchStyle>) {
    setCardFetchStyle(cardStyles.fetchSuccess)
    setTimeout(() => {
        setCardFetchStyle(cardStyles.fetchReset)
    }, durations.flashResetDelay)
}
export function flashCardOnFailure(setCardFetchStyle: Dispatch<CardFetchStyle>) {
    setCardFetchStyle(cardStyles.fetchFailure)
}