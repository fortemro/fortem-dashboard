
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useComenzi } from '@/hooks/useComenzi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Copy, Trash2, Mail, Search, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { OrderDetailsModal } from '@/components/OrderDetailsModal';

export default function ComenziMele() {
  const { user } = useAuth();
  const { comenzi, loading } = useComenzi();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('toate');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter orders based on search criteria
  const filteredComenzi = useMemo(() => {
    return comenzi.filter(comanda => {
      if (searchTerm && !comanda.numar_comanda.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !comanda.oras_livrare.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !comanda.distribuitor_id.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'toate' && comanda.status !== statusFilter) return false;
      if (dateFrom && comanda.data_comanda < dateFrom) return false;
      if (dateTo && comanda.data_comanda > dateTo) return false;
      return true;
    });
  }, [comenzi, searchTerm, statusFilter, dateFrom, dateTo]);

  const handleViewOrder = (comanda) => {
    setSelectedOrder(comanda);
    setShowDetailsModal(true);
  };

  const handleEditOrder = (comanda) => {
    // Store order data for editing
    localStorage.setItem('editOrderData', JSON.stringify({
      id: comanda.id,
      distribuitor_id: comanda.distribuitor_id,
      oras_livrare: comanda.oras_livrare,
      adresa_livrare: comanda.adresa_livrare,
      judet_livrare: comanda.judet_livrare,
      telefon_livrare: comanda.telefon_livrare,
      observatii: comanda.observatii
    }));
    
    navigate(`/comanda?edit=${comanda.id}`);
    toast({
      title: "Editare comandă",
      description: "Formularul a fost încărcat pentru editare"
    });
  };

  const handleDuplicateOrder = (comanda) => {
    // Store order data for duplication including items
    localStorage.setItem('duplicateOrderData', JSON.stringify({
      distribuitor_id: comanda.distribuitor_id,
      oras_livrare: comanda.oras_livrare,
      adresa_livrare: comanda.adresa_livrare,
      judet_livrare: comanda.judet_livrare,
      telefon_livrare: comanda.telefon_livrare,
      observatii: comanda.observatii,
      items: comanda.items || []
    }));
    
    navigate('/comanda');
    toast({
      title: "Template creat",
      description: "Formularul a fost pre-completat cu datele și produsele comenzii"
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'in_asteptare': { label: 'În Așteptare', variant: 'secondary' },
      'procesare': { label: 'În Procesare', variant: 'default' },
      'expediere': { label: 'În Expediere', variant: 'default' },
      'finalizata': { label: 'Finalizată', variant: 'default' },
      'anulata': { label: 'Anulată', variant: 'destructive' }
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Comenzile Mele</h1>
              <p className="text-gray-600 mt-2">
                Gestionează și monitorizează toate comenzile tale
              </p>
            </div>
            <Button onClick={() => navigate('/comanda')}>
              <Plus className="h-4 w-4 mr-2" />
              Comandă Nouă
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrare și Căutare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Caută după numărul comenzii, distribuitor sau oraș..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toate">Toate Statusurile</SelectItem>
                  <SelectItem value="in_asteptare">În Așteptare</SelectItem>
                  <SelectItem value="procesare">În Procesare</SelectItem>
                  <SelectItem value="expediere">În Expediere</SelectItem>
                  <SelectItem value="finalizata">Finalizată</SelectItem>
                  <SelectItem value="anulata">Anulată</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                placeholder="Data de la"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                type="date"
                placeholder="Data până la"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Comenzi ({filteredComenzi.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredComenzi.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Număr Comandă</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Distribuitor</TableHead>
                      <TableHead>Orașul Livrare</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Paleti</TableHead>
                      <TableHead>Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComenzi.map((comanda) => (
                      <TableRow key={comanda.id}>
                        <TableCell className="font-medium font-mono">
                          {comanda.numar_comanda}
                        </TableCell>
                        <TableCell>
                          {new Date(comanda.data_comanda).toLocaleDateString('ro-RO')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {comanda.distribuitor_id || 'N/A'}
                        </TableCell>
                        <TableCell>{comanda.oras_livrare}</TableCell>
                        <TableCell>
                          {getStatusBadge(comanda.status)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {comanda.calculated_paleti || comanda.numar_paleti || 0}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrder(comanda)}
                              title="Vezi detalii"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateOrder(comanda)}
                              title="Duplică comandă"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {comanda.status === 'in_asteptare' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditOrder(comanda)}
                                title="Editează comandă"
                              >
                                <Edit className="h-4 w-4" />
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
                <p className="text-gray-500 mb-4">Nu ai comenzi care să corespundă criteriilor de filtrare</p>
                <Button onClick={() => navigate('/comanda')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Creează Prima Comandă
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetailsModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            comanda={selectedOrder}
          />
        )}
      </div>
    </div>
  );
}
