import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import moviesData from '../data/movies'

const MovieContext = createContext(null)

const STORAGE_KEYS = {
  movies: 'flixmate_movies',
  ratings: 'flixmate_user_ratings',
  watchlist: 'flixmate_watchlist',
  logo: 'flixmate_logo_data_url'
}

const DEFAULT_FILTERS = {
  yearMin: 1980,
  yearMax: 2026,
  minRating: 0,
  genre: 'All'
}

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function MovieProvider({ children }) {
  const [movies, setMovies] = useState(() => readJSON(STORAGE_KEYS.movies, moviesData))
  const [ratings, setRatings] = useState(() => readJSON(STORAGE_KEYS.ratings, {}))
  const [watchlist, setWatchlist] = useState(() => readJSON(STORAGE_KEYS.watchlist, []))
  const [logoDataUrl, setLogoDataUrl] = useState(() => localStorage.getItem(STORAGE_KEYS.logo) || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.movies, JSON.stringify(movies))
  }, [movies])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ratings, JSON.stringify(ratings))
  }, [ratings])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(watchlist))
  }, [watchlist])

  useEffect(() => {
    if (logoDataUrl) {
      localStorage.setItem(STORAGE_KEYS.logo, logoDataUrl)
    } else {
      localStorage.removeItem(STORAGE_KEYS.logo)
    }
  }, [logoDataUrl])

  const updateFilter = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const rateMovie = useCallback((movieId, value) => {
    setRatings((prev) => ({ ...prev, [movieId]: value }))
  }, [])

  const toggleWatchlist = useCallback((movieId) => {
    setWatchlist((prev) =>
      prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]
    )
  }, [])

  const addMovie = useCallback((movieInput) => {
    setMovies((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((m) => m.id)) + 1 : 1
      const cleanMovie = {
        id: nextId,
        title: movieInput.title,
        genre: movieInput.genre,
        director: movieInput.director,
        leadCast: movieInput.leadCast,
        rating: Number(movieInput.rating),
        year: Number(movieInput.year),
        synopsis: movieInput.synopsis,
        posterUrl: movieInput.posterUrl,
        trailerLink: movieInput.trailerLink,
        relatedPrequelSequelId: movieInput.relatedPrequelSequelId ? Number(movieInput.relatedPrequelSequelId) : null
      }
      return [cleanMovie, ...prev]
    })
  }, [])

  const deleteMovie = useCallback((movieId) => {
    setMovies((prev) => prev.filter((movie) => movie.id !== movieId))
    setWatchlist((prev) => prev.filter((id) => id !== movieId))
    setRatings((prev) => {
      const cloned = { ...prev }
      delete cloned[movieId]
      return cloned
    })
  }, [])

  const getEffectiveRating = useCallback(
    (movie) => {
      const userRating = ratings[movie.id]
      return userRating ? Number(userRating) : Number(movie.rating)
    },
    [ratings]
  )

  const filteredMovies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return movies.filter((movie) => {
      const inYearRange = movie.year >= filters.yearMin && movie.year <= filters.yearMax
      const ratingOk = getEffectiveRating(movie) >= filters.minRating
      const genreOk = filters.genre === 'All' || movie.genre.includes(filters.genre)

      if (!inYearRange || !ratingOk || !genreOk) {
        return false
      }

      if (!q) {
        return true
      }

      return (
        movie.title.toLowerCase().includes(q) ||
        movie.director.toLowerCase().includes(q) ||
        movie.genre.join(' ').toLowerCase().includes(q) ||
        movie.leadCast.join(' ').toLowerCase().includes(q)
      )
    })
  }, [movies, searchQuery, filters, getEffectiveRating])

  const genres = useMemo(() => {
    const unique = new Set()
    movies.forEach((movie) => movie.genre.forEach((g) => unique.add(g)))
    return ['All', ...Array.from(unique).sort()]
  }, [movies])

  const rows = useMemo(() => {
    const byRating = [...filteredMovies].sort((a, b) => getEffectiveRating(b) - getEffectiveRating(a))
    const byRecency = [...filteredMovies].sort((a, b) => b.year - a.year)

    return [
      { title: 'Trending Now', movies: byRecency.slice(0, 14) },
      { title: 'Top Rated', movies: byRating.slice(0, 14) },
      { title: 'Action Boost', movies: filteredMovies.filter((m) => m.genre.includes('Action')).slice(0, 14) },
      { title: 'Sci-Fi Spectrum', movies: filteredMovies.filter((m) => m.genre.includes('Sci-Fi')).slice(0, 14) },
      { title: 'Crime Pulse', movies: filteredMovies.filter((m) => m.genre.includes('Crime')).slice(0, 14) },
      { title: 'Drama Essentials', movies: filteredMovies.filter((m) => m.genre.includes('Drama')).slice(0, 14) }
    ]
  }, [filteredMovies, getEffectiveRating])

  const getSmartRecs = useCallback(
    (movieId) => {
      const source = movies.find((movie) => movie.id === movieId)
      if (!source) {
        return []
      }

      const sourceGenres = new Set(source.genre)
      const sourceCast = new Set(source.leadCast)

      return movies
        .filter((movie) => movie.id !== movieId)
        .map((movie) => {
          let score = 0

          movie.genre.forEach((genre) => {
            if (sourceGenres.has(genre)) {
              score += 3
            }
          })

          if (movie.director === source.director) {
            score += 2
          }

          movie.leadCast.forEach((actor) => {
            if (sourceCast.has(actor)) {
              score += 2
            }
          })

          if (movie.relatedPrequelSequelId === source.id || source.relatedPrequelSequelId === movie.id) {
            score += 3
          }

          return { ...movie, _score: score }
        })
        .filter((movie) => movie._score > 0)
        .sort((a, b) => b._score - a._score || b.year - a.year)
        .slice(0, 6)
    },
    [movies]
  )

  const value = useMemo(
    () => ({
      movies,
      filteredMovies,
      rows,
      ratings,
      watchlist,
      genres,
      logoDataUrl,
      searchQuery,
      filters,
      setSearchQuery,
      updateFilter,
      resetFilters,
      setLogoDataUrl,
      rateMovie,
      toggleWatchlist,
      addMovie,
      deleteMovie,
      getSmartRecs,
      getEffectiveRating
    }),
    [
      movies,
      filteredMovies,
      rows,
      ratings,
      watchlist,
      genres,
      logoDataUrl,
      searchQuery,
      filters,
      updateFilter,
      resetFilters,
      setLogoDataUrl,
      rateMovie,
      toggleWatchlist,
      addMovie,
      deleteMovie,
      getSmartRecs,
      getEffectiveRating
    ]
  )

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
}

export function useMovies() {
  const ctx = useContext(MovieContext)
  if (!ctx) {
    throw new Error('useMovies must be used within MovieProvider')
  }
  return ctx
}
