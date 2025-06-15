
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Target, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { ro } from 'date-fns/locale';

interface ChartData {
  name: string;
  vanzari: number;
  comenzi: number;
  paleti: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AdvancedCharts() {
  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ['advanced-charts-data'],
    queryFn: async () => {
      console.log('📊 Fetching advanced charts data...');
      
      const days = 7;
      const chartData: ChartData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const startDate = startOfDay(date);
        const endDate = endOfDay(date);
        
        const { data: comenzi, error } = await supabase
          .from('comenzi')
          .select('total_comanda, numar_paleti')
          .gte('data_comanda', startDate.toISOString())
          .lte('data_comanda', endDate.toISOString())
          .neq('status', 'anulata');
          
        if (error) throw new Error(error.message);
        
        const vanzari = comenzi?.reduce((sum, c) => sum + (c.total_comanda || 0), 0) || 0;
        const paleti = comenzi?.reduce((sum, c) => sum + (c.numar_paleti || 0), 0) || 0;
        
        chartData.push({
          name: format(date, 'dd MMM', { locale: ro }),
          vanzari: Math.round(vanzari),
          comenzi: comenzi?.length || 0,
          paleti: paleti
        });
      }
      
      console.log('📊 Charts data processed:', chartData);
      return chartData;
    },
    staleTime: 5 * 60 * 1000, // 5 minute cache
    refetchInterval: 5 * 60 * 1000, // Auto refresh every 5 minutes
  });

  const { data: categoryData = [], isLoading: categoryLoading } = useQuery({
    queryKey: ['category-performance'],
    queryFn: async () => {
      console.log('🎯 Fetching category performance...');
      
      const { data: items, error } = await supabase
        .from('itemi_comanda')
        .select(`
          cantitate,
          total_item,
          produs_id
        `);
        
      if (error) throw new Error(error.message);
      
      const { data: produse, error: produseError } = await supabase
        .from('produse')
        .select('id, nume, categorie');
        
      if (produseError) throw new Error(produseError.message);
      
      const produseMap = new Map(produse?.map(p => [p.id, p]) || []);
      const categoryStats = new Map<string, { value: number; cantitate: number }>();
      
      items?.forEach(item => {
        const produs = produseMap.get(item.produs_id);
        const category = produs?.categorie || 'Necategorisit';
        const existing = categoryStats.get(category) || { value: 0, cantitate: 0 };
        
        categoryStats.set(category, {
          value: existing.value + (item.total_item || 0),
          cantitate: existing.cantitate + item.cantitate
        });
      });
      
      return Array.from(categoryStats.entries()).map(([name, stats]) => ({
        name,
        value: Math.round(stats.value),
        cantitate: stats.cantitate
      }));
    },
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading || categoryLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Trend Vânzări Săptămânale */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Trend Vânzări Săptămânale
          </CardTitle>
          <CardDescription>Evoluția vânzărilor în ultimele 7 zile</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'vanzari' ? `${value.toLocaleString()} RON` : value,
                  name === 'vanzari' ? 'Vânzări' : 'Comenzi'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="vanzari" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performanță Comenzi vs Paleți */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Comenzi vs Paleți
          </CardTitle>
          <CardDescription>Relația între numărul de comenzi și paleți</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="comenzi" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Comenzi"
              />
              <Line 
                type="monotone" 
                dataKey="paleti" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Paleți"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performanță pe Categorii */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Performanță Categorii
          </CardTitle>
          <CardDescription>Distribuția vânzărilor pe categorii de produse</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value.toLocaleString()} RON`, 'Valoare']}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activitate Zilnică Combinată */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Activitate Zilnică
          </CardTitle>
          <CardDescription>Overview complet al activității zilnice</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'vanzari' ? `${value.toLocaleString()} RON` : value,
                  name === 'vanzari' ? 'Vânzări' : name === 'comenzi' ? 'Comenzi' : 'Paleți'
                ]}
              />
              <Legend />
              <Bar dataKey="comenzi" fill="#10B981" name="Comenzi" />
              <Bar dataKey="paleti" fill="#F59E0B" name="Paleți" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
