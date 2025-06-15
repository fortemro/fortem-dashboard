import React, { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useComenzi } from '@/hooks/useComenzi';
import { useDeleteComanda } from '@/hooks/useDeleteComanda';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Eye, Edit, Copy, Trash2, Mail, Search, Filter, Plus, Truck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { OrderDetailsModal } from '@/components/OrderDetailsModal';
import { ConfirmDeleteOrderDialog } from '@/components/ConfirmDeleteOrderDialog';

export default function ComenziMele() {
  const { user } = useAuth();
  const { comenzi, loading } = useComenzi();
  const { deleteComanda, isDeleting } = useDeleteComanda();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('toate');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderForDelete, setSelectedOrderForDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Filter orders based on search criteria
  const filteredComenzi = useMemo(() => {
    return comenzi.filter(comanda => {
      if (searchTerm && !comanda.numar_comanda.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !comanda.oras_livrare.toLowerCase().includes(searchTerm.toLowerCase())) {
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

  const handleDuplicateOrder = (comanda) => {
    // Get distributor name properly
    const distributorName = getDistributorName(comanda);
    
    // Store order data for duplication with distributor_name
    localStorage.setItem('duplicateOrderData', JSON.stringify({
      distribuitor_id: comanda.distribuitor_id,
      distribuitor_name: distributorName, // Add distributor name for proper handling
      oras_livrare: comanda.oras_livrare,
      adresa_livrare: comanda.adresa_livrare,
      judet_livrare: comanda.judet_livrare,
      telefon_livrare: comanda.telefon_livrare,
      observatii: comanda.observatii
    }));
    
    navigate('/comanda');
    toast({
      title: "Template creat",
      description: "Formularul a fost pre-completat cu datele comenzii"
    });
  };

  const handleEditOrder = (comanda) => {
    // Check if order can be edited
    if (comanda.status !== 'in_asteptare') {
      toast({
        title: "Nu se poate edita",
        description: "Doar comenzile în așteptare pot fi editate",
        variant: "destructive"
      });
      return;
    }

    // Navigate to edit mode
    navigate(`/comanda?edit=${comanda.id}`);
    toast({
      title: "Editare comandă",
      description: "Formularul a fost încărcat pentru editare"
    });
  };

  const handleDeleteOrder = (comanda) => {
    setSelectedOrderForDelete(comanda);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedOrderForDelete) {
      deleteComanda(selectedOrderForDelete.id);
      setShowDeleteDialog(false);
      setSelectedOrderForDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setShowDeleteDialog(false);
      setSelectedOrderForDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'in_asteptare': { label: 'În Așteptare', variant: 'secondary', className: 'bg-gray-100 text-gray-800' },
      'procesare': { label: 'Procesare', variant: 'default', className: 'bg-blue-100 text-blue-800' },
      'in_procesare': { label: 'În Procesare', variant: 'default', className: 'bg-blue-100 text-blue-800' },
      'pregatit_pentru_livrare': { label: 'Pregătit Livrare', variant: 'default', className: 'bg-yellow-100 text-yellow-800' },
      'in_tranzit': { label: 'În Tranzit', variant: 'default', className: 'bg-orange-100 text-orange-800' },
      'livrata': { label: 'Livrată', variant: 'default', className: 'bg-green-100 text-green-800' },
      'finalizata': { label: 'Finalizată', variant: 'default', className: 'bg-green-100 text-green-800' },
      'anulata': { label: 'Anulată', variant: 'destructive', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary', className: 'bg-gray-100 text-gray-800' };
    return (
      <Badge 
        variant={config.variant}
        className={config.className}
      >
        {config.label}
      </Badge>
    );
  };

  const getStatusBadgeWithTooltip = (comanda) => {
    const status = comanda.status;
    
    if (status === 'in_tranzit') {
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="cursor-pointer">
              {getStatusBadge(status)}
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 bg-white border shadow-lg">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Detalii Transport</h4>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Transportator:</strong> {comanda.nume_transportator || 'Nu este specificat'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Mașina:</strong> {comanda.numar_masina || 'Nu este specificat'}
                </span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      );
    }
    
    return getStatusBadge(status);
  };

  // Funcție pentru a obține numele distribuitorului
  const getDistributorName = (comanda) => {
    if (comanda.distribuitori && comanda.distribuitori.nume_companie) {
      return comanda.distribuitori.nume_companie;
    }
    return comanda.distribuitor_id; // fallback la ID dacă nu există numele
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
                  placeholder="Caută după numărul comenzii sau oraș..."
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
                  <SelectItem value="procesare">Procesare</SelectItem>
                  <SelectItem value="in_procesare">În Procesare</SelectItem>
                  <SelectItem value="pregatit_pentru_livrare">Pregătit Livrare</SelectItem>
                  <SelectItem value="in_tranzit">În Tranzit</SelectItem>
                  <SelectItem value="livrata">Livrată</SelectItem>
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
                      <TableHead>Distribuitor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Orașul Livrare</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Paleti</TableHead>
                      <TableHead>Total (RON)</TableHead>
                      <TableHead>Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComenzi.map((comanda) => (
                      <TableRow key={comanda.id}>
                        <TableCell className="font-medium font-mono">
                          {comanda.numar_comanda}
                        </TableCell>
                        <TableCell>{getDistributorName(comanda)}</TableCell>
                        <TableCell>
                          {new Date(comanda.data_comanda).toLocaleDateString('ro-RO')}
                        </TableCell>
                        <TableCell>{comanda.oras_livrare}</TableCell>
                        <TableCell>
                          {getStatusBadgeWithTooltip(comanda)}
                        </TableCell>
                        <TableCell>{comanda.numar_paleti}</TableCell>
                        <TableCell className="font-semibold">
                          {(comanda.total_comanda || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrder(comanda)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateOrder(comanda)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {comanda.status === 'in_asteptare' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditOrder(comanda)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteOrder(comanda)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
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

        {/* Delete Confirmation Dialog */}
        <ConfirmDeleteOrderDialog
          isOpen={showDeleteDialog}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          comanda={selectedOrderForDelete}
        />
      </div>
    </div>
  );
}
