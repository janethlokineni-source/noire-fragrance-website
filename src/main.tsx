import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Error boundary to surface any crash
class RootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          position: 'fixed', inset: 0, background: '#070707',
          color: '#C8A96B', fontFamily: 'monospace',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '1rem', padding: '2rem', textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', letterSpacing: '0.3em' }}>NOIRÉ</div>
          <div style={{ color: '#ff6b6b', fontSize: '1rem', fontWeight: 'bold' }}>
            Runtime Error
          </div>
          <pre style={{
            background: '#111', border: '1px solid #333',
            padding: '1rem', maxWidth: '90vw', overflow: 'auto',
            fontSize: '0.75rem', color: '#ff9999', textAlign: 'left',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word'
          }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)
