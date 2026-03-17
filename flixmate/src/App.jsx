import { useEffect, useState } from 'react'
import AdminDashboard from './components/AdminDashboard'
import Home from './components/Home'
import MovieModal from './components/MovieModal'
import Navbar from './components/Navbar'

function App() {
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [path, setPath] = useState(window.location.hash || '#/')

  useEffect(() => {
    const onHashChange = () => setPath(window.location.hash || '#/')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const isAdminRoute = path === '#/admin'

  const openAdmin = () => {
    window.location.hash = '/admin'
  }

  const openHome = () => {
    window.location.hash = '/'
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar onOpenAdmin={openAdmin} />

      {isAdminRoute ? (
        <AdminDashboard />
      ) : (
        <Home onOpenMovie={(movie) => setSelectedMovie(movie)} />
      )}

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

      <footer className="border-t border-white/10 px-4 py-4 text-center text-sm text-muted">
        <button onClick={openHome} className="mr-4 hover:text-white">
          Home
        </button>
        <button onClick={openAdmin} className="hover:text-primary">
          Admin Login
        </button>
      </footer>
    </div>
  )
}

export default App
