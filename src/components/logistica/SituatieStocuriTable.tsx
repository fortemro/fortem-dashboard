
import { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDashboardProductie } from '@/hooks/useDashboardProductie';

export function SituatieStocuriTable() {
  const { data: produse, isLoading, error, refetch } = useDashboardProductie();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    console.log('[SituatieStocuriTable] Manual refresh triggered');
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter products based on search term
  const filteredProduse = produse?.filter(produs =>
    produs.nume.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Situație Generală Stocuri Produse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Situație Generală Stocuri Produse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="text-red-500 mb-4">
              Eroare la încărcarea datelor
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Încearcă din nou
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Situație Generală Stocuri Produse
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizează
          </Button>
        </CardTitle>
        <div className="flex items-center gap-2 mt-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Caută după nume produs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px] bg-white"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredProduse.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {!searchTerm 
              ? 'Nu sunt produse în sistem'
              : `Nu există produse care să se potrivească cu "${searchTerm}"`
            }
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Nume Produs</TableHead>
                  <TableHead className="text-center">Stoc Scriptic</TableHead>
                  <TableHead className="text-center">Stoc Alocat Comenzilor</TableHead>
                  <TableHead className="text-center">Stoc Real Disponibil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProduse.map((produs) => {
                  const isStocProblematic = produs.stoc_real_disponibil <= 0;
                  
                  return (
                    <TableRow 
                      key={produs.id} 
                      className={isStocProblematic ? "bg-red-50" : ""}
                    >
                      <TableCell className={isStocProblematic ? "text-red-900 font-medium" : ""}>
                        {produs.nume}
                        {isStocProblematic && (
                          <span className="ml-2 text-red-600 text-xs">⚠️</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium text-blue-700">
                          {produs.stoc_fizic}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium text-orange-600">
                          {produs.stoc_alocat}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={
                            produs.stoc_real_disponibil <= 0
                              ? "font-bold text-red-600"
                              : produs.stoc_real_disponibil <= produs.prag_alerta_stoc
                              ? "font-bold text-orange-600"
                              : "font-semibold text-green-700"
                          }
                        >
                          {produs.stoc_real_disponibil}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
