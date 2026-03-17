import { Search, Shield } from 'lucide-react'
import { useMovies } from '../store'

function Navbar({ onOpenAdmin }) {
  const { logoDataUrl, searchQuery, setSearchQuery } = useMovies()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          {logoDataUrl ? (
            <img src={logoDataUrl} alt="FlixMate" className="h-10 w-auto rounded-md object-contain" />
          ) : (
            <div className="text-2xl font-black tracking-wide text-primary">FLIXMATE</div>
          )}
          <span className="hidden rounded-full border border-white/15 px-3 py-1 text-xs text-muted md:inline">
            Movie Discovery Engine
          </span>
        </div>

        <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-white/10 bg-surface/70 px-3 py-2">
          <Search size={18} className="text-muted" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search title, director, cast, genre..."
            className="w-full bg-transparent text-sm text-text placeholder:text-muted focus:outline-none"
          />
        </div>

        <button
          onClick={onOpenAdmin}
          className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-muted transition hover:border-primary/70 hover:text-text md:flex"
        >
          <Shield size={16} />
          Command Center
        </button>
      </div>
    </header>
  )
}

export default Navbar
