import { Component, type ReactNode } from 'react'

/** An optional outfit must never unmount the campus Canvas. */
export default class CharacterBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error) {
    console.error('No se pudo cargar esta vestimenta.', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
