import { AuthProvider, useAuth } from './context/AuthProvider'
import { MovieProvider, useMovies } from './context/MovieContext'

export function AppStoreProvider({ children }) {
  return (
    <AuthProvider>
      <MovieProvider>{children}</MovieProvider>
    </AuthProvider>
  )
}

export { useAuth, useMovies }
