interface Stat {
  label: string;
  value: string | number;
  change?: number;
  icon?: string;
}

interface DashboardStatsProps {
  stats: Stat[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{stat.label}</span>
            {stat.icon && (
              <span className="text-2xl">{stat.icon}</span>
            )}
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            {stat.change !== undefined && (
              <span className={`ml-2 text-sm font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change >= 0 ? '+' : ''}{stat.change}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}