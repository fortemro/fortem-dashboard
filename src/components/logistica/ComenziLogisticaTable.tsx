import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useComenziLogistica } from '@/hooks/logistica/useComenziLogistica';
import { ComandaDetailsModal } from './ComandaDetailsModal';
import { ComandaEditModal } from './ComandaEditModal';
import { TableFilters } from './TableFilters';
import { StockStatusBadge, OrderStatusBadge } from './StatusBadges';
import { ActionButtons } from './ActionButtons';
import { useStockStatus } from '@/hooks/logistica/useStockStatus';
import { useState } from 'react';
import type { Comanda } from '@/types/comanda';

interface ComandaWithStockStatus extends Comanda {
  stockStatus?: {
    type: 'loading' | 'available' | 'insufficient';
    productName?: string;
    missingQuantity?: number;
  };
}

export function ComenziLogisticaTable() {
  const { comenzi, loading, updateComandaStatus, refetch } = useComenziLogistica();
  const { comenziWithStockStatus } = useStockStatus(comenzi);
  const [selectedComanda, setSelectedComanda] = useState<ComandaWithStockStatus | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedComandaEdit, setSelectedComandaEdit] = useState<ComandaWithStockStatus | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('toate');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter comenzi based on selected status and search term
  const filteredComenzi = comenziWithStockStatus.filter(comanda => {
    // Filter by status
    const matchesStatus = statusFilter === 'toate' || (comanda.status || 'in_asteptare') === statusFilter;
    
    // Filter by search term (order number or distributor name)
    const matchesSearch = !searchTerm || 
      comanda.numar_comanda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comanda.distribuitor_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = async (comandaId: string, newStatus: string) => {
    await updateComandaStatus(comandaId, newStatus);
  };

  const handleViewClick = (comanda: ComandaWithStockStatus) => {
    setSelectedComanda(comanda);
    setIsViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setSelectedComanda(null);
  };

  const handleEditClick = (comanda: ComandaWithStockStatus) => {
    setSelectedComandaEdit(comanda);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedComandaEdit(null);
  };

  const handleEditSuccess = () => {
    refetch();
  };

  const handleAlocaTransport = (comanda: ComandaWithStockStatus) => {
    setSelectedComandaEdit(comanda);
    setIsEditModalOpen(true);
  };

  const handleMarcheazaExpediat = async (comanda: ComandaWithStockStatus) => {
    await updateComandaStatus(comanda.id, 'in_tranzit', true);
  };

  const handleMarcheazaLivrat = async (comanda: ComandaWithStockStatus) => {
    await updateComandaStatus(comanda.id, 'livrata', false, true);
  };

  const handleAnuleazaComanda = async (comanda: ComandaWithStockStatus) => {
    await updateComandaStatus(comanda.id, 'anulata');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comenzi în Așteptare</CardTitle>
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Comenzi în Așteptare</CardTitle>
          <TableFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            totalCount={comenziWithStockStatus.length}
            filteredCount={filteredComenzi.length}
          />
        </CardHeader>
        <CardContent>
          {filteredComenzi.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {!searchTerm && statusFilter === 'toate' 
                ? 'Nu există comenzi în acest moment'
                : `Nu există comenzi care să se potrivească cu criteriile de filtrare`
              }
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Număr Comandă</TableHead>
                    <TableHead>Dată Plasare</TableHead>
                    <TableHead>Distribuitor</TableHead>
                    <TableHead>Oraș Livrare</TableHead>
                    <TableHead>Status Stoc</TableHead>
                    <TableHead>Nume Transportator</TableHead>
                    <TableHead>Număr Mașină</TableHead>
                    <TableHead>Data Expediere</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px]">Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComenzi.map((comanda) => (
                    <TableRow key={comanda.id}>
                      <TableCell className="font-medium">
                        {comanda.numar_comanda}
                      </TableCell>
                      <TableCell>
                        {format(new Date(comanda.data_comanda), 'dd.MM.yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {comanda.distribuitor_id}
                      </TableCell>
                      <TableCell>
                        {comanda.oras_livrare}
                      </TableCell>
                      <TableCell>
                        <StockStatusBadge stockStatus={comanda.stockStatus} />
                      </TableCell>
                      <TableCell>
                        {comanda.nume_transportator || '-'}
                      </TableCell>
                      <TableCell>
                        {comanda.numar_masina || '-'}
                      </TableCell>
                      <TableCell>
                        {comanda.data_expediere ? format(new Date(comanda.data_expediere), 'dd.MM.yyyy HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge orderStatus={comanda.status || 'in_asteptare'} />
                      </TableCell>
                      <TableCell>
                        <ActionButtons
                          comanda={comanda}
                          onAlocaTransport={handleAlocaTransport}
                          onMarcheazaExpediat={handleMarcheazaExpediat}
                          onMarcheazaLivrat={handleMarcheazaLivrat}
                          onAnuleazaComanda={handleAnuleazaComanda}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ComandaDetailsModal
        comanda={selectedComanda}
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
      />

      <ComandaEditModal
        comanda={selectedComandaEdit}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
