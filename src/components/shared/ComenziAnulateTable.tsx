
import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, FileText, User, XCircle, Search, Filter } from 'lucide-react';
import { Comanda } from '@/data-types';

interface ComenziAnulateTableProps {
  comenziAnulate: Comanda[];
  loading: boolean;
  onViewOrder?: (comanda: Comanda) => void;
  showUserColumn?: boolean;
  title?: string;
}

export function ComenziAnulateTable({ 
  comenziAnulate, 
  loading, 
  onViewOrder,
  showUserColumn = false,
  title = "Comenzi Anulate"
}: ComenziAnulateTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredComenziAnulate = useMemo(() => {
    return comenziAnulate.filter(comanda => {
      if (searchTerm && !comanda.numar_comanda.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !getDistributorName(comanda).toLowerCase().includes(searchTerm.toLowerCase()) &&
          !comanda.oras_livrare.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (dateFrom && comanda.data_anulare && comanda.data_anulare < dateFrom) return false;
      if (dateTo && comanda.data_anulare && comanda.data_anulare > dateTo) return false;
      return true;
    });
  }, [comenziAnulate, searchTerm, dateFrom, dateTo]);

  const getDistributorName = (comanda: Comanda) => {
    if (comanda.distribuitori && comanda.distribuitori.nume_companie) {
      return comanda.distribuitori.nume_companie;
    }
    return comanda.distribuitor_id;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-600" />
          {title} ({filteredComenziAnulate.length})
        </CardTitle>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Caută după numărul comenzii, distribuitor sau oraș..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Input
            type="date"
            placeholder="Data anulare de la"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            type="date"
            placeholder="Data anulare până la"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredComenziAnulate.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Număr Comandă</TableHead>
                  <TableHead>Distribuitor</TableHead>
                  {showUserColumn && <TableHead>Utilizator</TableHead>}
                  <TableHead>Data Comandă</TableHead>
                  <TableHead>Data Anulare</TableHead>
                  <TableHead>Anulat De</TableHead>
                  <TableHead>Motiv</TableHead>
                  <TableHead>Paleti</TableHead>
                  <TableHead>Total (RON)</TableHead>
                  <TableHead>Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComenziAnulate.map((comanda) => (
                  <TableRow key={comanda.id} className="bg-red-50">
                    <TableCell className="font-medium font-mono">
                      {comanda.numar_comanda}
                    </TableCell>
                    <TableCell>{getDistributorName(comanda)}</TableCell>
                    {showUserColumn && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-gray-500" />
                          {comanda.profiluri_utilizatori?.nume_complet || 'Utilizator'}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      {new Date(comanda.data_comanda).toLocaleDateString('ro-RO')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-red-600" />
                        {comanda.data_anulare ? new Date(comanda.data_anulare).toLocaleDateString('ro-RO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {comanda.profile_anulat_de?.nume_complet || 'Utilizator'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 max-w-[200px]">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="truncate text-sm">
                          {comanda.motiv_anulare || 'Nu este specificat'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{comanda.numar_paleti}</TableCell>
                    <TableCell className="font-semibold text-red-600">
                      {(comanda.total_comanda || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {onViewOrder && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewOrder(comanda)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || dateFrom || dateTo 
                ? 'Nu există comenzi anulate care să corespundă criteriilor de filtrare'
                : 'Nu există comenzi anulate'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
