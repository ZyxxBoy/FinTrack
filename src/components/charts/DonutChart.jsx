import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'
import useStore from '../../store/useStore'

const CustomTooltip = ({ active, payload }) => {
  const currency = useStore.getState().currency
  if (!active || !payload || !payload[0]) return null
  const data = payload[0].payload
  
  return (
    <div className="glass-card p-3 border border-white/10 text-sm">
      <p className="text-white font-medium">{data.icon} {data.name}</p>
      <p className="text-gray-400">{formatCurrency(data.amount, currency)}</p>
    </div>
  )
}

export default function DonutChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-gray-500">
        Belum ada data pengeluaran
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="w-full md:w-1/2 h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="amount"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="w-full md:w-1/2 space-y-2">
        {data.slice(0, 6).map((item, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-400 flex-1">{item.icon} {item.name}</span>
            <span className="text-white font-medium">
              {formatCurrency(item.amount, useStore.getState().currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
