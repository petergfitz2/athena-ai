import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export interface SectorData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface SectorAllocationChartProps {
  data: SectorData[];
  title?: string;
  description?: string;
}

const SECTOR_COLORS: Record<string, string> = {
  'Technology': '#A855F7',
  'Tech': '#A855F7',
  'Healthcare': '#EC4899',
  'Finance': '#3B82F6',
  'Consumer': '#10B981',
  'Energy': '#F59E0B',
  'Industrial': '#6366F1',
  'Materials': '#14B8A6',
  'Utilities': '#8B5CF6',
  'Real Estate': '#06B6D4',
  'Communications': '#F97316',
  'Beauty': '#EC4899',
  'Wellness': '#10B981',
  'Fitness': '#F59E0B',
  'Other': '#64748B',
};

export default function SectorAllocationChart({ 
  data, 
  title = "Sector Allocation",
  description = "Portfolio breakdown by sector"
}: SectorAllocationChartProps) {
  // Assign colors to sectors
  const chartData = data.map(sector => ({
    ...sector,
    color: SECTOR_COLORS[sector.name] || SECTOR_COLORS['Other'],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass rounded-lg p-3 border border-white/10">
          <p className="text-sm font-light text-foreground">{data.name}</p>
          <p className="text-lg font-light text-primary">
            ${data.value.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.percentage.toFixed(1)}% of portfolio
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2" data-testid={`sector-legend-${entry.value.toLowerCase()}`}>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground font-light">
            {entry.value}: {entry.payload.percentage.toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="rounded-[28px]">
      <CardHeader>
        <CardTitle className="text-xl font-light">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
