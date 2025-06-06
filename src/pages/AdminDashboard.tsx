
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useComenzi } from '@/hooks/useComenzi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, Package, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { comenzi } = useComenzi();
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedMzv, setSelectedMzv] = useState<string>('');
  const [selectedDistributor, setSelectedDistributor] = useState<string>('');

  const { stats, loading } = useAdminStats(dateFrom, dateTo);

  // Verifică dacă utilizatorul este Admin
  if (!profile || profile.rol !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Acces Interzis</CardTitle>
            <CardDescription>
              Nu aveți permisiunea de a accesa această pagină. Doar administratorii pot vizualiza dashboard-ul admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button variant="outline" className="w-full">
                Înapoi la Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrează comenzile în funcție de criteriile selectate
  const filteredComenzi = comenzi.filter(comanda => {
    if (selectedMzv && comanda.mzv_emitent !== selectedMzv) return false;
    if (selectedDistributor && comanda.distribuitor_id !== selectedDistributor) return false;
    if (dateFrom && comanda.data_comanda < dateFrom) return false;
    if (dateTo && comanda.data_comanda > dateTo) return false;
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrator</h1>
          <p className="text-gray-600 mt-2">
            Vizualizare completă a tuturor comenzilor și statisticilor la nivel de companie
          </p>
        </div>

        {/* Filtre */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Data început</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data sfârșit</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">MZV</label>
                <Select value={selectedMzv} onValueChange={setSelectedMzv}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează MZV" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toți MZV-ii</SelectItem>
                    {stats?.mzvPerformance.map((mzv) => (
                      <SelectItem key={mzv.mzv_id} value={mzv.mzv_id}>
                        {mzv.mzv_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Distribuitor</label>
                <Select value={selectedDistributor} onValueChange={setSelectedDistributor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează distribuitor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toți distribuitorii</SelectItem>
                    {stats?.distributorStats.map((dist) => (
                      <SelectItem key={dist.distribuitor_id} value={dist.distribuitor_id}>
                        {dist.distribuitor_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistici generale */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comenzi</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                Filtrate: {filteredComenzi.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valoare Totală</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.totalValue || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MZV Activi</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.mzvPerformance.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produse Vândute</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.productStats.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs pentru diferite vizualizări */}
        <Tabs defaultValue="comenzi" className="space-y-4">
          <TabsList>
            <TabsTrigger value="comenzi">Toate Comenzile</TabsTrigger>
            <TabsTrigger value="mzv">Performanța MZV</TabsTrigger>
            <TabsTrigger value="distribuitori">Distribuitori</TabsTrigger>
            <TabsTrigger value="produse">Produse</TabsTrigger>
          </TabsList>

          <TabsContent value="comenzi">
            <Card>
              <CardHeader>
                <CardTitle>Toate Comenzile</CardTitle>
                <CardDescription>
                  Lista completă a comenzilor cu posibilități de filtrare
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Număr Comandă</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>MZV</TableHead>
                        <TableHead>Distribuitor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Valoare</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredComenzi.map((comanda) => (
                        <TableRow key={comanda.id}>
                          <TableCell className="font-medium">{comanda.numar_comanda}</TableCell>
                          <TableCell>{new Date(comanda.data_comanda).toLocaleDateString('ro-RO')}</TableCell>
                          <TableCell>MZV</TableCell>
                          <TableCell>Distribuitor</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              comanda.status === 'Finalizata' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {comanda.status}
                            </span>
                          </TableCell>
                          <TableCell>-</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mzv">
            <Card>
              <CardHeader>
                <CardTitle>Performanța MZV</CardTitle>
                <CardDescription>
                  Statistici detaliate pentru fiecare MZV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>MZV</TableHead>
                        <TableHead>Număr Comenzi</TableHead>
                        <TableHead>Valoare Totală</TableHead>
                        <TableHead>Medie pe Comandă</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.mzvPerformance.map((mzv) => (
                        <TableRow key={mzv.mzv_id}>
                          <TableCell className="font-medium">{mzv.mzv_name}</TableCell>
                          <TableCell>{mzv.orders_count}</TableCell>
                          <TableCell>{formatCurrency(mzv.total_value)}</TableCell>
                          <TableCell>
                            {formatCurrency(mzv.total_value / mzv.orders_count)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribuitori">
            <Card>
              <CardHeader>
                <CardTitle>Statistici Distribuitori</CardTitle>
                <CardDescription>
                  Performanța pe distribuitori
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Distribuitor</TableHead>
                        <TableHead>Număr Comenzi</TableHead>
                        <TableHead>Valoare Totală</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.distributorStats.map((dist) => (
                        <TableRow key={dist.distribuitor_id}>
                          <TableCell className="font-medium">{dist.distribuitor_name}</TableCell>
                          <TableCell>{dist.orders_count}</TableCell>
                          <TableCell>{formatCurrency(dist.total_value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="produse">
            <Card>
              <CardHeader>
                <CardTitle>Top Produse</CardTitle>
                <CardDescription>
                  Cele mai vândute produse la nivel național
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produs</TableHead>
                        <TableHead>Cantitate Totală</TableHead>
                        <TableHead>Valoare Totală</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.productStats.slice(0, 20).map((product) => (
                        <TableRow key={product.produs_id}>
                          <TableCell className="font-medium">{product.produs_name}</TableCell>
                          <TableCell>{product.total_quantity}</TableCell>
                          <TableCell>{formatCurrency(product.total_value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Link către validarea prețurilor */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Validare Prețuri
            </CardTitle>
            <CardDescription>
              Verificați consistența prețurilor cu grilele oficiale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/validare-preturi">
              <Button>
                Accesează Validarea Prețurilor
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
