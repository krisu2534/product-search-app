import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found! Make sure index.html has <div id="root"></div>')
  document.body.innerHTML = '<div style="padding: 20px; color: red;"><h1>Error: Root element not found</h1><p>Make sure index.html has &lt;div id="root"&gt;&lt;/div&gt;</p></div>'
} else {
  try {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    )
    console.log('React app initialized successfully')
  } catch (error) {
    console.error('Error initializing React app:', error)
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red;">
        <h1>Error Initializing App</h1>
        <p>${error.message}</p>
        <pre style="background: #f5f5f5; padding: 10px; margin-top: 10px; overflow: auto;">${error.stack}</pre>
      </div>
    `
  }
}
