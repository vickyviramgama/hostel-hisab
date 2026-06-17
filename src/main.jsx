import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) return (
      <div style={{ background:'#0C1120', color:'#F1F5F9', padding:32, fontFamily:'monospace', minHeight:'100vh' }}>
        <div style={{ fontSize:24, color:'#F43F5E', marginBottom:16 }}>⚠️ App Error — send this to support</div>
        <div style={{ background:'#111827', padding:16, borderRadius:8, color:'#F87171', fontSize:13, whiteSpace:'pre-wrap', overflowX:'auto' }}>
          {this.state.error.message}{'\n\n'}{this.state.error.stack}
        </div>
      </div>
    )
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
