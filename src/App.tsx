import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Callback from './components/Callback';
import UserWatchlist from './pages/UserWatchlist';
import ProfileSelect from './pages/ProfileSelect';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProfileSelect />}></Route>
          <Route path="/callback" element={<Callback />} />
          <Route path="/dashboard" element={<UserWatchlist />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
