
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ComandaGeneral {
  id: string;
  numar_comanda: string;
  data_comanda: string;
  distribuitor_id: string;
  oras_livrare: string;
  status: string;
  total_comanda: number;
  user_id: string;
  distribuitori?: {
    nume_companie: string;
  };
  profiluri_utilizatori?: {
    nume_complet: string;
  };
}

interface OrdersTableGeneralProps {
  comenzi: ComandaGeneral[];
}

export function OrdersTableGeneral({ comenzi }: OrdersTableGeneralProps) {
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
      'in_procesare': 'bg-blue-100 text-blue-800',
      'pregatit_pentru_livrare': 'bg-orange-100 text-orange-800',
      'in_tranzit': 'bg-purple-100 text-purple-800',
      'livrata': 'bg-green-100 text-green-800',
      'finalizata': 'bg-green-100 text-green-800',
      'anulata': 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      'in_asteptare': 'ÎN AȘTEPTARE',
      'procesare': 'PROCESARE',
      'in_procesare': 'ÎN PROCESARE',
      'pregatit_pentru_livrare': 'PREGĂTIT LIVRARE',
      'in_tranzit': 'ÎN TRANZIT',
      'livrata': 'LIVRATĂ',
      'finalizata': 'FINALIZATĂ',
      'anulata': 'ANULATĂ'
    };

    const label = statusLabels[status as keyof typeof statusLabels] || status.toUpperCase();

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}>
        {label}
      </Badge>
    );
  };

  // Calculăm valoarea totală a comenzilor afișate
  const totalValue = comenzi.reduce((sum, comanda) => sum + comanda.total_comanda, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">
          Comenzi Generale ({comenzi.length})
        </CardTitle>
        <div className="text-sm text-gray-600">
          Valoare totală: {formatCurrency(totalValue)}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Nr. Comandă</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Data</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Nume Agent (MZV)</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Distribuitor</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Oraș</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Valoare</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comenzi.map((comanda) => (
                    <TableRow key={comanda.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {comanda.numar_comanda}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {formatDate(comanda.data_comanda)}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-medium">
                        <div className="max-w-[150px] truncate" title={comanda.profiluri_utilizatori?.nume_complet || 'Agent necunoscut'}>
                          {comanda.profiluri_utilizatori?.nume_complet || 'Agent necunoscut'}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                        <div className="max-w-[150px] truncate" title={comanda.distribuitori?.nume_companie || comanda.distribuitor_id}>
                          {comanda.distribuitori?.nume_companie || comanda.distribuitor_id}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div className="max-w-[100px] truncate" title={comanda.oras_livrare}>
                          {comanda.oras_livrare}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(comanda.status)}
                      </TableCell>
                      <TableCell className="font-semibold text-xs sm:text-sm">
                        {formatCurrency(comanda.total_comanda)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        
        {comenzi.length === 0 && (
          <div className="text-center py-6 sm:py-8">
            <p className="text-gray-500 text-sm sm:text-base">
              Nu au fost găsite comenzi pentru filtrul selectat.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
