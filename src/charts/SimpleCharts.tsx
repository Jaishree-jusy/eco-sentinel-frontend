import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend,
} from 'recharts';

const AXIS_STYLE = { fontSize: 11, fill: '#8a8f94' };

export function BarStat({ data, dataKey = 'value', nameKey = 'name', color = '#2c7a56', height = 220, horizontal = false }: {
  data: any[]; dataKey?: string; nameKey?: string; color?: string; height?: number; horizontal?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef1ee" vertical={!horizontal} horizontal={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={nameKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} width={110} />
          </>
        ) : (
          <>
            <XAxis dataKey={nameKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e3d6' }} />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 4, 4]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutStat({ data, colors, height = 220 }: { data: { name: string; value: number }[]; colors: string[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e3d6' }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendLine({ data, dataKey = 'value', nameKey = 'date', color = '#2c7a56', height = 220, area = true }: {
  data: any[]; dataKey?: string; nameKey?: string; color?: string; height?: number; area?: boolean;
}) {
  if (area) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1ee" vertical={false} />
          <XAxis dataKey={nameKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e3d6' }} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill="url(#trendFill)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef1ee" vertical={false} />
        <XAxis dataKey={nameKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e3d6' }} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
