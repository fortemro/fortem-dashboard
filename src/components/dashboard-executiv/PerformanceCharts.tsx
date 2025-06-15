
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

interface PerformanceDataPoint {
  date: string;
  vanzari: number;
  comenzi: number;
  dateLabel: string;
}

interface PerformanceChartsProps {
  periodDisplay: string;
  performanceData: PerformanceDataPoint[];
  isLoading: boolean;
}

export function PerformanceCharts({ periodDisplay, performanceData, isLoading }: PerformanceChartsProps) {
  // Calculate trend
  const calculateTrend = () => {
    if (performanceData.length < 2) return 0;
    const firstValue = performanceData[0]?.vanzari || 0;
    const lastValue = performanceData[performanceData.length - 1]?.vanzari || 0;
    return lastValue - firstValue;
  };

  const trend = calculateTrend();
  const totalSales = performanceData.reduce((sum, point) => sum + point.vanzari, 0);

  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Performanță Vânzări
          </CardTitle>
          <CardDescription className="text-sm">Evoluția vânzărilor pentru perioada selectată</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded animate-pulse">
            <div className="text-center text-gray-500 p-4">
              <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2" />
              <p className="text-sm sm:text-base">Se încarcă datele...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!performanceData.length) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Performanță Vânzări
          </CardTitle>
          <CardDescription className="text-sm">Evoluția vânzărilor pentru perioada selectată</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center text-gray-500 p-4">
              <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2" />
              <p className="text-sm sm:text-base">Nu există date pentru perioada selectată</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
          <div className="flex items-center">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Performanță Vânzări
          </div>
          <div className="flex items-center text-sm">
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : trend < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            ) : null}
            <span className={`font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {trend > 0 ? '+' : ''}{trend.toLocaleString()} RON
            </span>
          </div>
        </CardTitle>
        <CardDescription className="text-sm">
          Evoluția vânzărilor pentru {periodDisplay} • Total: {totalSales.toLocaleString()} RON
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="dateLabel" 
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900 mb-1">{label}</p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="text-blue-600">Vânzări:</span> {data.vanzari.toLocaleString()} RON
                          </p>
                          <p className="text-sm">
                            <span className="text-green-600">Comenzi:</span> {data.comenzi}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="vanzari" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fill="url(#salesGradient)"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#3B82F6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
