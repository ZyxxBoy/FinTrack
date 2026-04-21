import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  icon: Icon,
  className = '',
  ...props 
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'px-6 py-3 rounded-xl font-semibold text-white bg-red-500/20 border border-red-500/50 hover:bg-red-500/40 transition-all duration-300 transform hover:scale-105',
    outline: 'px-6 py-3 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/5 transition-all duration-300',
  }

  const sizes = {
    sm: 'text-sm px-4 py-2',
    md: '',
    lg: 'text-lg px-8 py-4',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${variants[variant]} ${sizes[size]} inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : Icon ? (
        <Icon size={18} />
      ) : null}
      {children}
    </motion.button>
  )
}
