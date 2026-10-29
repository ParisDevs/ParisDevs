import { Component } from 'react'
import { Empty } from '@/views/ui'

export class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return <Empty>Não foi possível carregar esta tela.</Empty>
    }
    return this.props.children
  }
}
