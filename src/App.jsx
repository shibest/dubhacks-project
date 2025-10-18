import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Callback from './components/Callback';
import UserWatchlist from './components/UserWatchlist';

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProfileSelect />}></Route>
            <Route path="/profile" element={<ProfileEditor />}></Route>
            <Route path="/callback" element={<Callback />} />
            <Route path="/dashboard" element={<UserWatchlist />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
