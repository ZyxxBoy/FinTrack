import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Camera, Lock, ArrowRight, Wallet, Check, Settings, Shield } from 'lucide-react'
import useStore from '../store/useStore'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

export default function Profile() {
  const { profile, user, currency, setCurrency, isDark, toggleTheme } = useStore()
  const { updateProfile, uploadAvatar, resetPassword } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!name) return
    setLoading(true)
    try {
      await updateProfile({ name })
      toast.success('Profil berhasil diperbarui!')
    } catch (err) {
      toast.error('Gagal memperbarui profil')
    }
    setLoading(false)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran maksimal gambar adalah 2MB')
      return
    }

    const toastId = toast.loading('Mengunggah...')
    try {
      await uploadAvatar(file)
      toast.success('Avatar berhasil diperbarui!', { id: toastId })
    } catch (err) {
      console.error("Upload error details: ", err)
      toast.error(err.message || 'Gagal mengunggah avatar. Pastikan bucket "avatars" ada di Supabase', { id: toastId })
    }
  }

  const handleCurrencyChange = async (newCurrency) => {
    setCurrency(newCurrency)
    try {
      await updateProfile({ currency: newCurrency })
      toast.success(`Mata uang diubah ke ${newCurrency}`)
    } catch (err) {
      console.error('Failed to sync currency to db')
    }
  }

  const handleResetPassword = async () => {
    if (!user?.email) return
    try {
      await resetPassword(user.email)
      toast.success('Link reset password telah dikirim ke email Anda')
    } catch (err) {
      toast.error('Gagal mengirim link reset password')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <h1 className="text-2xl font-heading font-bold text-white mb-6">⚙️ Pengaturan Profil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-6">
          <div className="glass-card p-6 text-center">
            <div className="relative inline-block mb-4 group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-green to-neon-purple p-1">
                <div className="w-full h-full rounded-full bg-dark-900 border-4 border-dark-900 overflow-hidden relative">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                      {profile?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  {/* Overlay upload (hover) */}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={24} className="text-white mb-1" />
                  </div>
                </div>
              </div>
              {/* Invisible file input covering the avatar */}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Ganti Avatar"
              />
            </div>
            <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Shield size={18} className="text-neon-green" /> Keamanan
            </h3>
            <div className="pt-2">
              <button 
                onClick={handleResetPassword}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm text-gray-300"
              >
                <div className="flex items-center gap-2"><Lock size={16} /> Ganti Password</div>
                <ArrowRight size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Edit Profile */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <User size={20} className="text-neon-purple" /> Data Pribadi
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email"
                value={user?.email || ''}
                readOnly
                disabled
                className="opacity-50 cursor-not-allowed"
                title="Email tidak dapat diubah"
              />
              <div className="flex justify-end pt-2">
                <Button type="submit" loading={loading} icon={Check}>
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>

          {/* App Preferences */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Settings size={20} className="text-blue-400" /> Preferensi Aplikasi
            </h3>
            
            <div className="space-y-6">
              {/* Theme */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
                <div>
                  <p className="font-medium text-white mb-1">Tema Gelap (Dark Mode)</p>
                  <p className="text-xs text-gray-400">Gunakan tema gelap agar lebih nyaman di mata</p>
                </div>
                {/* Toggle switch custom */}
                <button 
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full p-1 transition-colors relative ${isDark ? 'bg-neon-green' : 'bg-gray-600'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isDark ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Currency */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
                <div>
                  <p className="font-medium text-white mb-1">Mata Uang</p>
                  <p className="text-xs text-gray-400">Pilih mata uang utama yang digunakan</p>
                </div>
                <div className="flex items-center gap-2 bg-dark-800 rounded-lg p-1">
                  {['IDR', 'USD', 'EUR'].map((curr) => (
                    <button
                      key={curr}
                      onClick={() => handleCurrencyChange(curr)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        currency === curr 
                        ? 'bg-gradient-to-r from-neon-green to-neon-purple text-dark-900 shadow-lg' 
                        : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}
