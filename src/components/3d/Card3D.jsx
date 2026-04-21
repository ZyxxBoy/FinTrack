import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

export default function Card3D({ children, className = '', glowColor = 'rgba(0, 255, 136, 0.3)' }) {
  const cardRef = useRef(null)
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8
    
    setTransform({ rotateX, rotateY })
  }

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 })
  }

  return (
    <motion.div
      ref={cardRef}
      className={`card-3d ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        perspective: '1000px',
      }}
    >
      <div
        className="card-3d-inner glass-card p-6 h-full transition-all duration-200"
        style={{
          transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
          boxShadow: transform.rotateX !== 0 || transform.rotateY !== 0
            ? `0 20px 60px ${glowColor}, 0 0 40px ${glowColor}`
            : `0 4px 20px rgba(0, 0, 0, 0.3)`,
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}
