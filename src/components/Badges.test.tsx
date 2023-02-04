import { render } from '@testing-library/react'
import {BadgeIlluminationStatus, BadgeNetworkStatus} from './Badges'

test('Network badge component shows online text when online', () => {
    const { getByText } = render(<BadgeNetworkStatus online={true}/>)
    const badgeElement = getByText("Online")
    expect(badgeElement).toBeInTheDocument()
})

test('Network badge component shows offline text when offline', () => {
    const { getByText } = render(<BadgeNetworkStatus online={false}/>)
    const badgeElement = getByText("Offline")
    expect(badgeElement).toBeInTheDocument()
})

test('Network badge component shows updating text when updating', () => {
    const { getByText } = render(<BadgeNetworkStatus updating={true}/>)
    const badgeElement = getByText("Updating")
    expect(badgeElement).toBeInTheDocument()
})

test('Illumination badge component is dark when not illuminating', () => {
    const { getByText } = render(<BadgeIlluminationStatus illuminating={false} online={true}/>)
    const badgeElement = getByText("Dark")
    expect(badgeElement).toBeInTheDocument()
})

test('Illumination badge component is illuminating', () => {
    const { getByText } = render(<BadgeIlluminationStatus illuminating={true} online={true}/>)
    const badgeElement = getByText("Illuminating")
    expect(badgeElement).toBeInTheDocument()
})