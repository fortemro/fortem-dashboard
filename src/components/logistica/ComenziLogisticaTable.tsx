
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Filter } from 'lucide-react';
import { useComenziLogistica } from '@/hooks/logistica/useComenziLogistica';
import { ComandaDetailsModal } from './ComandaDetailsModal';
import { ComandaEditModal } from './ComandaEditModal';
import { useState } from 'react';
import type { Comanda } from '@/types/comanda';

export function ComenziLogisticaTable() {
  const { comenzi, loading, updateComandaStatus, refetch } = useComenziLogistica();
  const [selectedComanda, setSelectedComanda] = useState<Comanda | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedComandaEdit, setSelectedComandaEdit] = useState<Comanda | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('toate');

  const statusOptions = [
    { value: 'in_procesare', label: 'în procesare' },
    { value: 'pregatit_pentru_livrare', label: 'pregătit pentru livrare' },
    { value: 'in_tranzit', label: 'în tranzit' },
    { value: 'livrata', label: 'livrată' },
    { value: 'anulata', label: 'anulată' }
  ];

  const filterOptions = [
    { value: 'toate', label: 'Toate comenzile' },
    { value: 'in_asteptare', label: 'În așteptare' },
    { value: 'in_procesare', label: 'În procesare' },
    { value: 'pregatit_pentru_livrare', label: 'Pregătit pentru livrare' },
    { value: 'in_tranzit', label: 'În tranzit' },
    { value: 'livrata', label: 'Livrată' },
    { value: 'anulata', label: 'Anulată' }
  ];

  // Filter comenzi based on selected status
  const filteredComenzi = statusFilter === 'toate' 
    ? comenzi 
    : comenzi.filter(comanda => (comanda.status || 'in_asteptare') === statusFilter);

  const handleStatusUpdate = async (comandaId: string, newStatus: string) => {
    await updateComandaStatus(comandaId, newStatus);
  };

  const handleViewClick = (comanda: Comanda) => {
    setSelectedComanda(comanda);
    setIsViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setSelectedComanda(null);
  };

  const handleEditClick = (comanda: Comanda) => {
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Comenzile care necesită procesare logistică ({filteredComenzi.length} din {comenzi.length} comenzi)
            </p>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px] bg-white">
                  <SelectValue placeholder="Filtrează după status" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {filterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredComenzi.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {statusFilter === 'toate' 
                ? 'Nu există comenzi în acest moment'
                : `Nu există comenzi cu statusul "${filterOptions.find(opt => opt.value === statusFilter)?.label}"`
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
                        {comanda.distribuitor?.nume_companie || comanda.distribuitor_id}
                      </TableCell>
                      <TableCell>
                        {comanda.oras_livrare}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {comanda.status || 'in_asteptare'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditClick(comanda)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editează comanda</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Deschide meniul</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white z-50">
                              {statusOptions.map((option) => (
                                <DropdownMenuItem
                                  key={option.value}
                                  onClick={() => handleStatusUpdate(comanda.id, option.value)}
                                  className="cursor-pointer"
                                >
                                  {option.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
