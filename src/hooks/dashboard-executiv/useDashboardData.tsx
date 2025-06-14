
import { DateRange } from "react-day-picker";
import { PeriodFilter } from "@/components/dashboard-executiv/PeriodFilter";

export function useDashboardData() {
  const getDataForPeriod = (period: PeriodFilter, dateRange?: DateRange) => {
    switch (period) {
      case 'today':
        return {
          vanzariTotale: '45,678 RON',
          vanzariChange: '+5%',
          comenziActive: 12,
          comenziChange: '+2 noi',
          distributoriActivi: 8,
          distributoriChange: 'activi azi',
          alerteStoc: 3,
          alerteChange: 'produse critice',
          topProduse: [
            { nume: 'BCA FORTEM 200', cantitate: '23 bucăți', valoare: '8,950 RON', trend: '+12%' },
            { nume: 'BCA FORTEM 150', cantitate: '18 bucăți', valoare: '6,720 RON', trend: '+8%' },
            { nume: 'BCA FORTEM 250', cantitate: '15 bucăți', valoare: '5,480 RON', trend: '-2%' },
          ]
        };
      case 'yesterday':
        return {
          vanzariTotale: '52,340 RON',
          vanzariChange: '+8%',
          comenziActive: 15,
          comenziChange: '+3 noi',
          distributoriActivi: 12,
          distributoriChange: 'activi ieri',
          alerteStoc: 5,
          alerteChange: 'produse critice',
          topProduse: [
            { nume: 'BCA FORTEM 150', cantitate: '28 bucăți', valoare: '10,440 RON', trend: '+15%' },
            { nume: 'BCA FORTEM 200', cantitate: '25 bucăți', valoare: '9,750 RON', trend: '+10%' },
            { nume: 'BCA FORTEM 100', cantitate: '20 bucăți', valoare: '7,200 RON', trend: '+5%' },
          ]
        };
      case 'last7days':
        return {
          vanzariTotale: '324,567 RON',
          vanzariChange: '+12%',
          comenziActive: 89,
          comenziChange: '+15 această săptămână',
          distributoriActivi: 45,
          distributoriChange: 'activi săptămâna aceasta',
          alerteStoc: 7,
          alerteChange: 'produse critice',
          topProduse: [
            { nume: 'BCA FORTEM 200', cantitate: '180 bucăți', valoare: '68,400 RON', trend: '+18%' },
            { nume: 'BCA FORTEM 150', cantitate: '145 bucăți', valoare: '54,150 RON', trend: '+14%' },
            { nume: 'BCA FORTEM 250', cantitate: '120 bucăți', valoare: '43,200 RON', trend: '+8%' },
          ]
        };
      case 'thisMonth':
        return {
          vanzariTotale: '1,234,567 RON',
          vanzariChange: '+12%',
          comenziActive: 89,
          comenziChange: '+25 această lună',
          distributoriActivi: 156,
          distributoriChange: 'activi luna aceasta',
          alerteStoc: 7,
          alerteChange: 'produse critice',
          topProduse: [
            { nume: 'BCA FORTEM 200', cantitate: '734 bucăți', valoare: '278,580 RON', trend: '+15%' },
            { nume: 'BCA FORTEM 150', cantitate: '589 bucăți', valoare: '219,780 RON', trend: '+8%' },
            { nume: 'BCA FORTEM 250', cantitate: '456 bucăți', valoare: '164,160 RON', trend: '-3%' },
          ]
        };
      case 'custom':
        if (!dateRange?.from || !dateRange?.to) {
          return getDataForPeriod('today');
        }
        
        const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const avgDailySales = 45000;
        const totalSales = avgDailySales * days;
        
        return {
          vanzariTotale: `${totalSales.toLocaleString('ro-RO')} RON`,
          vanzariChange: `+${Math.floor(Math.random() * 20)}%`,
          comenziActive: Math.floor(days * 1.5),
          comenziChange: `+${Math.floor(days * 0.3)} în perioada`,
          distributoriActivi: Math.min(Math.floor(days * 2), 200),
          distributoriChange: 'activi în perioada',
          alerteStoc: Math.floor(Math.random() * 10) + 1,
          alerteChange: 'produse critice',
          topProduse: [
            { nume: 'BCA FORTEM 200', cantitate: `${Math.floor(days * 23)} bucăți`, valoare: `${(days * 8950).toLocaleString('ro-RO')} RON`, trend: `+${Math.floor(Math.random() * 20)}%` },
            { nume: 'BCA FORTEM 150', cantitate: `${Math.floor(days * 18)} bucăți`, valoare: `${(days * 6720).toLocaleString('ro-RO')} RON`, trend: `+${Math.floor(Math.random() * 15)}%` },
            { nume: 'BCA FORTEM 250', cantitate: `${Math.floor(days * 15)} bucăți`, valoare: `${(days * 5480).toLocaleString('ro-RO')} RON`, trend: `+${Math.floor(Math.random() * 10)}%` },
          ]
        };
      default:
        return getDataForPeriod('today');
    }
  };

  return { getDataForPeriod };
}
