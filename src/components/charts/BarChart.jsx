import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatShort } from '../../utils/formatCurrency'
import useStore from '../../store/useStore'

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

export default function WeeklyBarChart({ data }) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="week" 
            stroke="#64748B" 
            fontSize={11}
            tickLine={false}
          />
          <YAxis 
            stroke="#64748B" 
            fontSize={11}
            tickLine={false}
            tickFormatter={(v) => formatShort(v)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="income" 
            name="Pemasukan" 
            fill="#00FF88" 
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          <Bar 
            dataKey="expense" 
            name="Pengeluaran" 
            fill="#EF4444" 
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
