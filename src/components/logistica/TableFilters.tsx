
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
}

const filterOptions = [
  { value: 'toate', label: 'Toate comenzile' },
  { value: 'in_asteptare', label: 'În așteptare' },
  { value: 'in_procesare', label: 'În procesare' },
  { value: 'in_tranzit', label: 'În tranzit' },
  { value: 'livrata', label: 'Livrată' },
  { value: 'anulata', label: 'Anulată' }
];

export function TableFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  filteredCount
}: TableFiltersProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Comenzile care necesită procesare logistică ({filteredCount} din {totalCount} comenzi)
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Caută după număr comandă sau distribuitor..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[300px] bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
    </div>
  );
}
