import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface PerformanceData {
  date: string;
  value: number;
}

interface PortfolioChartProps {
  data: PerformanceData[];
  currentValue: number;
  totalGainPercent: number;
}

export default function PortfolioChart({ data, currentValue, totalGainPercent }: PortfolioChartProps) {
  const isPositive = totalGainPercent >= 0;

  return (
    <Card className="rounded-[28px] glass-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-light">
              ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <TrendingUp className={`w-4 h-4 ${isPositive ? 'text-green-500' : 'text-destructive'}`} />
              <span className={isPositive ? 'text-green-500' : 'text-destructive'}>
                {isPositive ? '+' : ''}{totalGainPercent.toFixed(2)}% all time
              </span>
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Just now</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A855F7" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#A855F7" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#A855F7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#888" 
              tick={{ fill: '#888', fontSize: 12 }}
              tickLine={{ stroke: '#888' }}
            />
            <YAxis 
              stroke="#888" 
              tick={{ fill: '#888', fontSize: 12 }}
              tickLine={{ stroke: '#888' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A0A0A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#fff',
              }}
              labelStyle={{ color: '#888' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#colorGradient)"
              strokeWidth={3}
              fill="url(#fillGradient)"
              dot={false}
              activeDot={{ r: 6, fill: '#A855F7', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
