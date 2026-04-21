import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, Wallet } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import ParticleBackground from '../components/3d/ParticleBackground'
import toast from 'react-hot-toast'

export default function Auth() {
  const [mode, setMode] = useState('login') // login | register | forgot
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    const emailStr = form.email.trim()
    if (!emailStr) errs.email = 'Email wajib diisi'
    else if (!/\S+@\S+\.\S+/.test(emailStr)) errs.email = 'Email tidak valid'
    
    if (mode !== 'forgot') {
      if (!form.password) errs.password = 'Password wajib diisi'
      else if (form.password.length < 6) errs.password = 'Password minimal 6 karakter'
    }
    
    if (mode === 'register') {
      if (!form.name) errs.name = 'Nama wajib diisi'
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Password tidak cocok'
    }
    
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    
    setLoading(true)
    const emailStr = form.email.trim()
    try {
      if (mode === 'login') {
        await signIn(emailStr, form.password)
        toast.success('Selamat datang kembali! 👋')
        navigate('/')
      } else if (mode === 'register') {
        const result = await signUp(emailStr, form.password, form.name)
        if (result.session) {
          toast.success('Registrasi berhasil! 👋')
          // The onAuthStateChange will handle setting the user and navigating to '/'
        } else {
          toast.success('Registrasi berhasil! Cek email untuk verifikasi 📧')
          setMode('login')
          setForm(prev => ({ ...prev, password: '', confirmPassword: '' }))
        }
      } else if (mode === 'forgot') {
        await resetPassword(emailStr)
        toast.success('Link reset password telah dikirim ke email Anda 📧')
        setMode('login')
      }
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      toast.error('Gagal login dengan Google')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticleBackground />
      <div className="gradient-mesh-bg" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
            style={{ perspective: '600px' }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-green to-neon-purple flex items-center justify-center mx-auto shadow-lg shadow-neon-green/30">
              <Wallet size={40} className="text-dark-900" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-heading font-bold text-gradient mt-4">FinTrack</h1>
          <p className="text-gray-400 mt-1">Smart Financial Tracker</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-heading font-bold text-white mb-6">
            {mode === 'login' && 'Masuk ke Akun'}
            {mode === 'register' && 'Buat Akun Baru'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <Input
                label="Nama Lengkap"
                icon={User}
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, name: e.target.value }))
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                }}
                error={errors.name}
              />
            )}

            <Input
              label="Email"
              icon={Mail}
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => {
                setForm(prev => ({ ...prev, email: e.target.value }))
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
              }}
              error={errors.email}
            />

            {mode !== 'forgot' && (
              <div className="relative">
                <Input
                  label="Password"
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, password: e.target.value }))
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
                  }}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {mode === 'register' && (
              <Input
                label="Konfirmasi Password"
                icon={Lock}
                type="password"
                placeholder="Ulangi password"
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, confirmPassword: e.target.value }))
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }))
                }}
                error={errors.confirmPassword}
              />
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              {mode === 'login' && 'Masuk'}
              {mode === 'register' && 'Daftar'}
              {mode === 'forgot' && 'Kirim Link Reset'}
            </Button>
          </form>

          {mode !== 'forgot' && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-sm text-gray-500">atau</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-white"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Masuk dengan Google
              </button>
            </>
          )}

          {/* Mode Switch */}
          <div className="mt-6 text-center text-sm text-gray-400">
            {mode === 'login' && (
              <>
                <button onClick={() => setMode('forgot')} className="text-neon-green hover:underline">
                  Lupa password?
                </button>
                <div className="mt-2">
                  Belum punya akun?{' '}
                  <button onClick={() => setMode('register')} className="text-neon-green hover:underline font-medium">
                    Daftar
                  </button>
                </div>
              </>
            )}
            {mode === 'register' && (
              <div>
                Sudah punya akun?{' '}
                <button onClick={() => setMode('login')} className="text-neon-green hover:underline font-medium">
                  Masuk
                </button>
              </div>
            )}
            {mode === 'forgot' && (
              <button onClick={() => setMode('login')} className="text-neon-green hover:underline">
                ← Kembali ke Login
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
