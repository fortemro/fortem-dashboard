
import { Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CentralizatorFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  onRefresh: () => void;
}

export default function CentralizatorFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onRefresh
}: CentralizatorFiltersProps) {
  return (
    <Card className="mb-4 sm:mb-6 w-full">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
          Filtre și Căutare
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs sm:text-sm font-medium mb-2">Căutare</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <Input
                placeholder="Comandă, distribuitor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 text-xs sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue placeholder="Toate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toate">Toate</SelectItem>
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
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Data început</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-xs sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Data sfârșit</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-xs sm:text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={onRefresh} className="w-full text-xs sm:text-sm">
              Actualizează
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
