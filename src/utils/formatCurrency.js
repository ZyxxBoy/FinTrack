/**
 * Format number to currency string
 */
export function formatCurrency(amount, currency = 'IDR') {
  const configs = {
    IDR: { locale: 'id-ID', currency: 'IDR', minDigits: 0, maxDigits: 0 },
    USD: { locale: 'en-US', currency: 'USD', minDigits: 2, maxDigits: 2 },
    EUR: { locale: 'de-DE', currency: 'EUR', minDigits: 2, maxDigits: 2 },
  }
  
  const config = configs[currency] || configs.IDR
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: config.minDigits,
    maximumFractionDigits: config.maxDigits,
  }).format(amount)
}

/**
 * Format number input with thousand separator
 */
export function formatNumberInput(value) {
  const num = value.replace(/\D/g, '')
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Parse formatted number string to number
 */
export function parseFormattedNumber(str) {
  return Number(str.replace(/\./g, '').replace(/,/g, '.'))
}

/**
 * Short format (e.g. 1.5jt, 500rb)
 */
export function formatShort(amount, currency = 'IDR') {
  if (currency === 'IDR') {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}M`
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}jt`
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}rb`
    return amount.toString()
  }
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`
  return amount.toString()
}
