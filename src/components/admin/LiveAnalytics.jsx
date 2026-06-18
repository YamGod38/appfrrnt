import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';

const callVolumeData = [
  { time: '08:00', calls: 45 },
  { time: '09:00', calls: 85 },
  { time: '10:00', calls: 120 },
  { time: '11:00', calls: 145 },
  { time: '12:00', calls: 110 },
  { time: '13:00', calls: 90 },
  { time: '14:00', calls: 160 },
  { time: '15:00', calls: 185 },
  { time: '16:00', calls: 150 },
  { time: '17:00', calls: 100 },
];

const agentPerformanceData = [
  { name: 'Sarah J.', calls: 124, csat: 4.8 },
  { name: 'David C.', calls: 98, csat: 4.9 },
  { name: 'Emily R.', calls: 145, csat: 4.5 },
  { name: 'Marcus T.', calls: 76, csat: 4.2 },
];

const dispositionData = [
  { name: 'Resolved', value: 65, color: '#10b981' }, // Emerald
  { name: 'Escalated', value: 20, color: '#f59e0b' }, // Amber
  { name: 'Dropped', value: 15, color: '#ef4444' }, // Red
];

export default function LiveAnalytics() {
  return (
    <div className="grid grid-cols-3 gap-6 h-full p-4 text-zinc-100">
      {/* Call Volume Chart (Area Chart) */}
      <div className="col-span-2 bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-lg flex flex-col relative z-20">
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Live Call Volume</h3>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={callVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#e4e4e7', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dispositions (Pie Chart) */}
      <div className="col-span-1 bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-lg flex flex-col relative z-20">
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Call Dispositions</h3>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dispositionData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {dispositionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#e4e4e7', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Performance (Bar Chart) */}
      <div className="col-span-3 bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-lg flex flex-col relative z-20">
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Agent Performance (Calls Handled)</h3>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#e4e4e7', fontWeight: 'bold' }}
              />
              <Bar dataKey="calls" radius={[6, 6, 0, 0]}>
                {agentPerformanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.csat > 4.5 ? '#10b981' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
