
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminStats } from '@/types/adminStats';

interface AdminFiltersProps {
  dateFrom: string;
  dateTo: string;
  selectedMzv: string;
  selectedDistributor: string;
  stats: AdminStats | null;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onMzvChange: (value: string) => void;
  onDistributorChange: (value: string) => void;
}

export function AdminFilters({
  dateFrom,
  dateTo,
  selectedMzv,
  selectedDistributor,
  stats,
  onDateFromChange,
  onDateToChange,
  onMzvChange,
  onDistributorChange
}: AdminFiltersProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filtre</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Data început</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Data sfârșit</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">MZV</label>
            <Select value={selectedMzv} onValueChange={onMzvChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selectează MZV" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toate">Toți MZV-ii</SelectItem>
                {stats?.mzvPerformance
                  ?.filter(mzv => mzv.mzv_id && mzv.mzv_id.trim() !== '')
                  ?.map((mzv) => (
                  <SelectItem key={mzv.mzv_id} value={mzv.mzv_id}>
                    {mzv.mzv_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Distribuitor</label>
            <Select value={selectedDistributor} onValueChange={onDistributorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selectează distribuitor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toti">Toți distribuitorii</SelectItem>
                {stats?.distributorStats
                  ?.filter(dist => dist.distribuitor_id && dist.distribuitor_id.trim() !== '')
                  ?.map((dist) => (
                  <SelectItem key={dist.distribuitor_id} value={dist.distribuitor_id}>
                    {dist.distribuitor_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
