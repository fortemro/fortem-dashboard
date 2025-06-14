
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";
import { CustomDateRangePicker } from "@/components/CustomDateRangePicker";
import { format } from "date-fns";

export type PeriodFilter = 'today' | 'yesterday' | 'last7days' | 'thisMonth' | 'custom';

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: 'today', label: 'Astăzi' },
  { value: 'yesterday', label: 'Ieri' },
  { value: 'last7days', label: 'Ultimele 7 Zile' },
  { value: 'thisMonth', label: 'Luna Aceasta' },
  { value: 'custom', label: 'Interval Personalizat' },
];

interface PeriodFilterProps {
  selectedPeriod: PeriodFilter;
  customDateRange: DateRange | undefined;
  onPeriodChange: (period: PeriodFilter) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function PeriodFilterComponent({ 
  selectedPeriod, 
  customDateRange, 
  onPeriodChange, 
  onDateRangeChange 
}: PeriodFilterProps) {
  const getDisplayPeriod = () => {
    if (selectedPeriod === 'custom' && customDateRange?.from && customDateRange?.to) {
      return `${format(customDateRange.from, 'dd/MM/yyyy')} - ${format(customDateRange.to, 'dd/MM/yyyy')}`;
    }
    return periodOptions.find(p => p.value === selectedPeriod)?.label || 'Necunoscut';
  };

  return (
    <Card className="mb-8 border-blue-200 bg-blue-50">
      <CardHeader className="pb-4">
        <CardTitle className="text-blue-800 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Perioada Analizată: {getDisplayPeriod()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedPeriod === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => onPeriodChange(option.value)}
                className={selectedPeriod === option.value ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          {selectedPeriod === 'custom' && (
            <div className="mt-4">
              <CustomDateRangePicker
                dateRange={customDateRange}
                onDateRangeChange={onDateRangeChange}
              />
              {customDateRange?.from && customDateRange?.to && (
                <p className="text-sm text-gray-600 mt-2">
                  Perioada selectată: {format(customDateRange.from, 'dd MMMM yyyy')} - {format(customDateRange.to, 'dd MMMM yyyy')}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
