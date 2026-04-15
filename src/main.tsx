import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Tuyệt đối KHÔNG có dòng import './index.css' ở đây nhé!

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)