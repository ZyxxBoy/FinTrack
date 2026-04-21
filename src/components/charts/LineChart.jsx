import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import useStore from '../../store/useStore'
import { formatShort } from '../../utils/formatCurrency'

const CustomTooltip = ({ active, payload, label }) => {
  const currency = useStore.getState().currency
  if (!active || !payload) return null
  
  return (
    <div className="glass-card p-3 border border-white/10 text-sm">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {formatShort(entry.value, currency)}
        </p>
      ))}
    </div>
  )
}

export default function TrendLineChart({ data }) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="label" 
            stroke="#64748B" 
            fontSize={11}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#64748B" 
            fontSize={11}
            tickLine={false}
            tickFormatter={(v) => formatShort(v)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="income" 
            name="Pemasukan"
            stroke="#00FF88" 
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#00FF88' }}
          />
          <Line 
            type="monotone" 
            dataKey="expense" 
            name="Pengeluaran"
            stroke="#EF4444" 
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#EF4444' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
