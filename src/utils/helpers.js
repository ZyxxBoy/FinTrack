/**
 * Smart category suggestion based on note keywords
 */
const keywordMap = {
  // Makanan
  'makan': 'Makanan',
  'nasi': 'Makanan',
  'ayam': 'Makanan',
  'bakso': 'Makanan',
  'mie': 'Makanan',
  'kopi': 'Makanan',
  'starbucks': 'Makanan',
  'gofood': 'Makanan',
  'grabfood': 'Makanan',
  'resto': 'Makanan',
  'restoran': 'Makanan',
  'rice': 'Makanan',
  'lunch': 'Makanan',
  'dinner': 'Makanan',
  'breakfast': 'Makanan',
  'snack': 'Makanan',
  'jajan': 'Makanan',
  'warteg': 'Makanan',
  'indomie': 'Makanan',
  
  // Transport
  'grab': 'Transport',
  'gojek': 'Transport',
  'ojek': 'Transport',
  'bensin': 'Transport',
  'parkir': 'Transport',
  'tol': 'Transport',
  'bus': 'Transport',
  'kereta': 'Transport',
  'mrt': 'Transport',
  'uber': 'Transport',
  'taxi': 'Transport',
  'taksi': 'Transport',
  'commuter': 'Transport',
  'transjakarta': 'Transport',
  
  // Belanja
  'belanja': 'Belanja',
  'shopee': 'Belanja',
  'tokopedia': 'Belanja',
  'lazada': 'Belanja',
  'baju': 'Belanja',
  'sepatu': 'Belanja',
  'celana': 'Belanja',
  'mall': 'Belanja',
  'supermarket': 'Belanja',
  'indomaret': 'Belanja',
  'alfamart': 'Belanja',
  
  // Tagihan
  'listrik': 'Tagihan',
  'pln': 'Tagihan',
  'air': 'Tagihan',
  'pdam': 'Tagihan',
  'internet': 'Tagihan',
  'wifi': 'Tagihan',
  'pulsa': 'Tagihan',
  'paket data': 'Tagihan',
  'telkomsel': 'Tagihan',
  'indosat': 'Tagihan',
  'xl': 'Tagihan',
  'netflix': 'Tagihan',
  'spotify': 'Tagihan',
  'youtube': 'Tagihan',
  
  // Kesehatan
  'obat': 'Kesehatan',
  'dokter': 'Kesehatan',
  'rumah sakit': 'Kesehatan',
  'apotek': 'Kesehatan',
  'klinik': 'Kesehatan',
  'vitamin': 'Kesehatan',
  'gym': 'Kesehatan',
  'fitness': 'Kesehatan',
  
  // Hiburan
  'bioskop': 'Hiburan',
  'film': 'Hiburan',
  'game': 'Hiburan',
  'konser': 'Hiburan',
  'wisata': 'Hiburan',
  'liburan': 'Hiburan',
  'vacation': 'Hiburan',
  'karaoke': 'Hiburan',
  
  // Pendidikan
  'buku': 'Pendidikan',
  'kursus': 'Pendidikan',
  'udemy': 'Pendidikan',
  'course': 'Pendidikan',
  'sekolah': 'Pendidikan',
  'kuliah': 'Pendidikan',
  'spp': 'Pendidikan',
  
  // Gaji
  'gaji': 'Gaji',
  'salary': 'Gaji',
  'bonus': 'Gaji',
  'thr': 'Gaji',
  'freelance': 'Gaji',
  'honor': 'Gaji',
}

export function suggestCategory(note) {
  if (!note) return null
  const lower = note.toLowerCase()
  
  for (const [keyword, category] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) {
      return category
    }
  }
  return null
}

/**
 * Get greeting based on time of day
 */
export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 5) return 'Selamat malam'
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

/**
 * Random financial tips
 */
export const financialTips = [
  "💡 Terapkan aturan 50/30/20: 50% kebutuhan, 30% keinginan, 20% tabungan.",
  "💰 Sisihkan tabungan di awal bulan, bukan di akhir. Pay yourself first!",
  "📊 Catat setiap pengeluaran, sekecil apapun. Awareness adalah langkah pertama.",
  "🎯 Set target tabungan yang spesifik dan realistis setiap bulan.",
  "☕ Kopi Rp25.000/hari = Rp750.000/bulan. Pertimbangkan buat kopi sendiri!",
  "🏦 Selalu punya dana darurat minimal 3-6 bulan pengeluaran.",
  "📱 Uninstall app belanja online jika sering impulsif beli barang.",
  "🍱 Meal prep di akhir pekan bisa menghemat hingga 40% biaya makan.",
  "💳 Hindari cicilan 0% pada barang yang tidak dibutuhkan.",
  "📈 Mulai investasi sedini mungkin, manfaatkan compound interest.",
  "🛒 Buat daftar belanja sebelum ke supermarket. Jangan belanja lapar!",
  "💵 Gunakan amplop/rekening terpisah untuk tiap kategori pengeluaran.",
  "🔄 Review keuanganmu setiap minggu. Evaluasi rutin mencegah boros.",
  "🚫 Hindari utang konsumtif. Gunakan utang hanya untuk hal produktif.",
  "🎁 Bijak saat diskon besar. Diskon 50% tetap bukan gratis!",
]

export function getRandomTip() {
  return financialTips[Math.floor(Math.random() * financialTips.length)]
}

/**
 * Calculate Financial Health Score (0-100)
 */
export function calculateHealthScore(income, expense, savingsRate, streakDays) {
  let score = 50 // Base score
  
  // Income vs Expense ratio (max 30 points)
  if (income > 0) {
    const ratio = expense / income
    if (ratio <= 0.5) score += 30
    else if (ratio <= 0.7) score += 20
    else if (ratio <= 0.85) score += 10
    else if (ratio <= 1.0) score += 5
    else score -= 10
  }
  
  // Savings rate (max 15 points)
  if (savingsRate >= 30) score += 15
  else if (savingsRate >= 20) score += 10
  else if (savingsRate >= 10) score += 5
  
  // Streak bonus (max 5 points)
  if (streakDays >= 30) score += 5
  else if (streakDays >= 14) score += 3
  else if (streakDays >= 7) score += 1
  
  return Math.min(100, Math.max(0, score))
}

/**
 * Get health score label and color
 */
export function getHealthLabel(score) {
  if (score >= 80) return { label: 'Sangat Sehat', color: '#00FF88', emoji: '🌟' }
  if (score >= 60) return { label: 'Sehat', color: '#4ADE80', emoji: '😊' }
  if (score >= 40) return { label: 'Cukup', color: '#FBBF24', emoji: '😐' }
  if (score >= 20) return { label: 'Kurang', color: '#FB923C', emoji: '😟' }
  return { label: 'Buruk', color: '#EF4444', emoji: '😰' }
}

/**
 * Default categories
 */
export const defaultCategories = [
  { name: 'Makanan', icon: '🍔', color: '#FF6B6B', type: 'expense' },
  { name: 'Transport', icon: '🚗', color: '#4ECDC4', type: 'expense' },
  { name: 'Belanja', icon: '🛍️', color: '#45B7D1', type: 'expense' },
  { name: 'Hiburan', icon: '🎬', color: '#96CEB4', type: 'expense' },
  { name: 'Kesehatan', icon: '💊', color: '#FFEAA7', type: 'expense' },
  { name: 'Tagihan', icon: '📄', color: '#DDA0DD', type: 'expense' },
  { name: 'Pendidikan', icon: '📚', color: '#98D8C8', type: 'expense' },
  { name: 'Lainnya', icon: '📦', color: '#B8B8B8', type: 'expense' },
  { name: 'Gaji', icon: '💰', color: '#00FF88', type: 'income' },
  { name: 'Freelance', icon: '💻', color: '#7C3AED', type: 'income' },
  { name: 'Investasi', icon: '📈', color: '#00D4FF', type: 'income' },
  { name: 'Lainnya', icon: '💵', color: '#FFD700', type: 'income' },
]
