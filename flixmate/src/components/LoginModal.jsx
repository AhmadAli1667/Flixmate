import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'

const TABS = ['login', 'signup', 'forgot', 'settings']

function LoginModal({ isOpen, onClose, onLogin, onSignup, onForgot, user, settings, onUpdateSettings, emailLog, onUpdateProfilePicture }) {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', profilePicture: '' })
  const [message, setMessage] = useState('')

  const uploadProfilePicture = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : ''
      setForm((prev) => ({ ...prev, profilePicture: value }))
      if (user) {
        onUpdateProfilePicture(value)
      }
    }
    reader.readAsDataURL(file)
  }

  const submit = (event) => {
    event.preventDefault()

    if (tab === 'login') {
      const result = onLogin(form.email, form.password)
      setMessage(result.message)
      return
    }

    if (tab === 'signup') {
      const result = onSignup({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        profilePicture: form.profilePicture
      })
      setMessage(result.message)
      return
    }

    if (tab === 'forgot') {
      const result = onForgot(form.email)
      setMessage(result.message)
      return
    }

    setMessage('Settings saved automatically.')
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(event) => event.stopPropagation()}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 18, opacity: 0 }}
            className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0F172A]/90 p-6 shadow-2xl backdrop-blur-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-3xl text-white" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                Account Access
              </h2>
              <button onClick={onClose} className="text-white/70 hover:text-white">
                <X />
              </button>
            </div>

            <div className="mb-4 flex rounded-lg border border-white/15 bg-black/30 p-1">
              {TABS.map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setTab(name)
                    setMessage('')
                  }}
                  className={`flex-1 rounded-md px-2 py-2 text-xs uppercase tracking-wide ${
                    tab === name ? 'bg-[#F59E0B] text-black' : 'text-white/80'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            <form className="space-y-3" onSubmit={submit}>
              {tab === 'signup' && (
                <>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Name"
                    className="w-full rounded-md border border-white/15 bg-black/35 px-3 py-2 text-sm text-white"
                  />
                  <label className="block rounded-md border border-white/15 bg-black/30 px-3 py-2 text-xs text-white/80">
                    Upload profile picture
                    <input type="file" accept="image/*" onChange={uploadProfilePicture} className="mt-2 block w-full text-xs" />
                  </label>
                </>
              )}

              {(tab === 'login' || tab === 'signup' || tab === 'forgot') && (
                <input
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email"
                  className="w-full rounded-md border border-white/15 bg-black/35 px-3 py-2 text-sm text-white"
                />
              )}

              {(tab === 'login' || tab === 'signup') && (
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Password"
                  className="w-full rounded-md border border-white/15 bg-black/35 px-3 py-2 text-sm text-white"
                />
              )}

              {tab === 'signup' && (
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  placeholder="Confirm password"
                  className="w-full rounded-md border border-white/15 bg-black/35 px-3 py-2 text-sm text-white"
                />
              )}

              {tab === 'settings' && (
                <div className="space-y-3 rounded-lg border border-white/15 bg-black/25 p-3 text-xs text-white">
                  <label className="flex items-center justify-between">
                    Autoplay hero
                    <input
                      type="checkbox"
                      checked={settings.autoplayHero}
                      onChange={(event) => onUpdateSettings({ autoplayHero: event.target.checked })}
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    Mature content
                    <input
                      type="checkbox"
                      checked={settings.matureContent}
                      onChange={(event) => onUpdateSettings({ matureContent: event.target.checked })}
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    Email alerts
                    <input
                      type="checkbox"
                      checked={settings.emailAlerts}
                      onChange={(event) => onUpdateSettings({ emailAlerts: event.target.checked })}
                    />
                  </label>
                  <label className="block">
                    Language
                    <select
                      value={settings.language}
                      onChange={(event) => onUpdateSettings({ language: event.target.value })}
                      className="mt-1 w-full rounded-md border border-white/15 bg-black/35 px-2 py-2"
                    >
                      <option>English</option>
                      <option>Arabic</option>
                      <option>French</option>
                      <option>Spanish</option>
                    </select>
                  </label>
                  <div>
                    <p className="mb-1 text-[11px] text-white/70">Latest sent emails (simulated)</p>
                    <div className="max-h-24 overflow-y-auto rounded border border-white/10 p-2 text-[10px] text-white/80">
                      {emailLog.length === 0 ? 'No emails sent yet.' : emailLog.slice(0, 4).map((item) => `${item.to} - ${item.subject}`).join('\n')}
                    </div>
                  </div>
                </div>
              )}

              {message && <p className="text-xs text-[#F59E0B]">{message}</p>}

              {tab !== 'settings' && (
                <button className="w-full rounded-md bg-[#0F172A] py-2 text-sm font-semibold text-white ring-1 ring-[#F59E0B]/50 hover:bg-[#111f3f]">
                  {tab === 'login' ? 'Login' : tab === 'signup' ? 'Create Account' : 'Send Reset Link'}
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default LoginModal
