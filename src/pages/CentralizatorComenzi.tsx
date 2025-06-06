
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useComenzi } from '@/hooks/useComenzi';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Search, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ComandaDetaliata {
  id: string;
  numar_comanda: string;
  data_comanda: string;
  status: string;
  oras_livrare: string;
  adresa_livrare: string;
  judet_livrare: string;
  telefon_livrare: string;
  observatii: string;
  numar_paleti: number;
  mzv_emitent: string;
  distribuitor: {
    nume_companie: string;
    oras: string;
    judet: string;
    persoana_contact: string;
    telefon: string;
  };
  items: Array<{
    id: string;
    cantitate: number;
    pret_unitar: number;
    total_item: number;
    produs: {
      nume: string;
      cod_produs: string;
      dimensiuni: string;
    };
  }>;
  total_comanda: number;
}

export default function CentralizatorComenzi() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [comenzi, setComenzi] = useState<ComandaDetaliata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('toate');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedComanda, setSelectedComanda] = useState<ComandaDetaliata | null>(null);

  useEffect(() => {
    if (user) {
      fetchComenziDetaliate();
    }
  }, [user]);

  const fetchComenziDetaliate = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch comenzi cu toate detaliile
      let query = supabase
        .from('comenzi')
        .select(`
          id,
          numar_comanda,
          data_comanda,
          status,
          oras_livrare,
          adresa_livrare,
          judet_livrare,
          telefon_livrare,
          observatii,
          numar_paleti,
          mzv_emitent,
          distribuitori!distribuitor_id (
            nume_companie,
            oras,
            judet,
            persoana_contact,
            telefon
          )
        `)
        .order('created_at', { ascending: false });

      // Dacă nu este Admin, filtrează doar comenzile utilizatorului sau MZV-ului
      if (profile?.rol !== 'Admin') {
        query = query.eq('user_id', user.id);
      }

      const { data: comenziData, error: comenziError } = await query;

      if (comenziError) {
        console.error('Error fetching comenzi:', comenziError);
        throw comenziError;
      }

      // Fetch items pentru fiecare comandă
      const comenziIds = comenziData?.map(c => c.id) || [];
      
      let itemsData = [];
      if (comenziIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('itemi_comanda')
          .select(`
            id,
            comanda_id,
            cantitate,
            pret_unitar,
            total_item,
            produse!produs_id (
              nume,
              cod_produs,
              dimensiuni
            )
          `)
          .in('comanda_id', comenziIds);

        if (itemsError) {
          console.error('Error fetching items:', itemsError);
          throw itemsError;
        }
        itemsData = items || [];
      }

      // Construiește obiectele detaliate
      const comenziDetaliate: ComandaDetaliata[] = comenziData?.map(comanda => {
        const comandaItems = itemsData.filter(item => item.comanda_id === comanda.id);
        const totalComanda = comandaItems.reduce((sum, item) => sum + (item.total_item || 0), 0);

        return {
          ...comanda,
          items: comandaItems.map(item => ({
            id: item.id,
            cantitate: item.cantitate,
            pret_unitar: item.pret_unitar,
            total_item: item.total_item,
            produs: item.produse
          })),
          total_comanda: totalComanda
        };
      }) || [];

      setComenzi(comenziDetaliate);
    } catch (error) {
      console.error('Error fetching comenzi detaliate:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrează comenzile bazat pe criteriile selectate
  const filteredComenzi = comenzi.filter(comanda => {
    if (searchTerm && !comanda.numar_comanda.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !comanda.distribuitor?.nume_companie.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !comanda.oras_livrare.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'toate' && comanda.status !== statusFilter) return false;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO');
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'in_asteptare': 'bg-yellow-100 text-yellow-800',
      'procesare': 'bg-blue-100 text-blue-800',
      'finalizata': 'bg-green-100 text-green-800',
      'anulata': 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Centralizator Comenzi</h1>
          <p className="text-gray-600 mt-2">
            Vezi toate detaliile comenzilor într-un format centralizat
          </p>
        </div>

        {/* Filtre */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtre și Căutare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Căutare</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Număr comandă, distribuitor, oraș..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toate">Toate</SelectItem>
                    <SelectItem value="in_asteptare">În Așteptare</SelectItem>
                    <SelectItem value="procesare">Procesare</SelectItem>
                    <SelectItem value="finalizata">Finalizată</SelectItem>
                    <SelectItem value="anulata">Anulată</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <div className="flex items-end">
                <Button onClick={fetchComenziDetaliate} className="w-full">
                  Actualizează
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabel comenzi */}
        <Card>
          <CardHeader>
            <CardTitle>Comenzi ({filteredComenzi.length})</CardTitle>
            <CardDescription>
              Total valoare comenzi afișate: {formatCurrency(filteredComenzi.reduce((sum, c) => sum + c.total_comanda, 0))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nr. Comandă</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Distribuitor</TableHead>
                    <TableHead>Oraș Livrare</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Produse</TableHead>
                    <TableHead>Valoare</TableHead>
                    <TableHead>Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComenzi.map((comanda) => (
                    <TableRow key={comanda.id}>
                      <TableCell className="font-medium">{comanda.numar_comanda}</TableCell>
                      <TableCell>{formatDate(comanda.data_comanda)}</TableCell>
                      <TableCell>{comanda.distribuitor?.nume_companie || 'N/A'}</TableCell>
                      <TableCell>{comanda.oras_livrare}</TableCell>
                      <TableCell>{getStatusBadge(comanda.status)}</TableCell>
                      <TableCell>{comanda.items.length} produse</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(comanda.total_comanda)}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedComanda(comanda)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Vezi Detalii
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalii Comandă {comanda.numar_comanda}</DialogTitle>
                              <DialogDescription>
                                Toate informațiile despre această comandă
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedComanda && (
                              <Tabs defaultValue="general" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="general">Informații Generale</TabsTrigger>
                                  <TabsTrigger value="livrare">Livrare</TabsTrigger>
                                  <TabsTrigger value="produse">Produse</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="general" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Număr Comandă</label>
                                      <p className="text-sm text-gray-600">{selectedComanda.numar_comanda}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Data Comandă</label>
                                      <p className="text-sm text-gray-600">{formatDate(selectedComanda.data_comanda)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Status</label>
                                      <div className="mt-1">{getStatusBadge(selectedComanda.status)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Număr Paleți</label>
                                      <p className="text-sm text-gray-600">{selectedComanda.numar_paleti}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-sm font-medium">Distribuitor</label>
                                      <p className="text-sm text-gray-600">{selectedComanda.distribuitor?.nume_companie}</p>
                                    </div>
                                    {selectedComanda.observatii && (
                                      <div className="col-span-2">
                                        <label className="text-sm font-medium">Observații</label>
                                        <p className="text-sm text-gray-600">{selectedComanda.observatii}</p>
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="livrare" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Oraș</label>
                                      <p className="text-sm text-gray-600">{selectedComanda.oras_livrare}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Județ</label>
                                      <p className="text-sm text-gray-600">{selectedComanda.judet_livrare || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-sm font-medium">Adresă</label>
                                      <p className="text-sm text-gray-600">{selectedComanda.adresa_livrare}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Telefon</label>
                                      <p className="text-sm text-gray-600">{selectedComanda.telefon_livrare || 'N/A'}</p>
                                    </div>
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="produse" className="space-y-4">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Produs</TableHead>
                                        <TableHead>Dimensiuni</TableHead>
                                        <TableHead>Cantitate</TableHead>
                                        <TableHead>Preț Unitar</TableHead>
                                        <TableHead>Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedComanda.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>{item.produs?.nume || 'N/A'}</TableCell>
                                          <TableCell>{item.produs?.dimensiuni || 'N/A'}</TableCell>
                                          <TableCell>{item.cantitate}</TableCell>
                                          <TableCell>{formatCurrency(item.pret_unitar)}</TableCell>
                                          <TableCell className="font-semibold">{formatCurrency(item.total_item)}</TableCell>
                                        </TableRow>
                                      ))}
                                      <TableRow className="bg-gray-50">
                                        <TableCell colSpan={4} className="font-semibold">TOTAL COMANDĂ</TableCell>
                                        <TableCell className="font-bold text-lg">{formatCurrency(selectedComanda.total_comanda)}</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredComenzi.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Nu au fost găsite comenzi care să respecte criteriile de filtrare.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
