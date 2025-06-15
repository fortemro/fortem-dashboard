
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format, addDays } from 'date-fns';

interface StockPrediction {
  produs_id: string;
  nume: string;
  stoc_actual: number;
  predictie_7_zile: number;
  predictie_14_zile: number;
  predictie_30_zile: number;
  risc_epuizare: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  data_estimata_epuizare: Date | null;
  tendinta: 'CRESCATOR' | 'STABIL' | 'DESCRESCATOR';
  viteza_consum: number; // bucati/zi
}

interface PredictiveInsight {
  type: 'stock_alert' | 'demand_spike' | 'seasonal_trend' | 'supplier_risk';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  actionRequired: string;
  affectedProducts: string[];
  confidence: number; // 0-100%
}

export function usePredictiveAnalytics() {
  const { data: predictions = [], isLoading: predictionsLoading } = useQuery({
    queryKey: ['stock-predictions'],
    queryFn: async () => {
      console.log('🔮 Calculating stock predictions...');
      
      // Obține datele istorice pentru ultimele 30 de zile
      const { data: comenzi, error: comenziError } = await supabase
        .from('comenzi')
        .select(`
          data_comanda,
          itemi_comanda (
            cantitate,
            produs_id
          )
        `)
        .gte('data_comanda', subDays(new Date(), 30).toISOString())
        .neq('status', 'anulata');

      if (comenziError) throw new Error(comenziError.message);

      // Obține stocurile actuale
      const { data: produse, error: produseError } = await supabase
        .from('produse')
        .select('id, nume, stoc_disponibil, prag_alerta_stoc')
        .eq('activ', true);

      if (produseError) throw new Error(produseError.message);

      // Calculează consumul zilnic pentru fiecare produs
      const consumZilnic = new Map<string, number[]>();
      
      // Iterează prin ultimele 30 de zile
      for (let i = 29; i >= 0; i--) {
        const ziua = subDays(new Date(), i);
        const ziuaStr = format(ziua, 'yyyy-MM-dd');
        
        // Calculează consumul pentru această zi
        const consumZi = new Map<string, number>();
        
        comenzi?.forEach(comanda => {
          if (format(new Date(comanda.data_comanda), 'yyyy-MM-dd') === ziuaStr) {
            comanda.itemi_comanda?.forEach(item => {
              const existing = consumZi.get(item.produs_id) || 0;
              consumZi.set(item.produs_id, existing + item.cantitate);
            });
          }
        });
        
        // Adaugă la istoric
        produse?.forEach(produs => {
          if (!consumZilnic.has(produs.id)) {
            consumZilnic.set(produs.id, []);
          }
          consumZilnic.get(produs.id)!.push(consumZi.get(produs.id) || 0);
        });
      }

      // Calculează predicțiile pentru fiecare produs
      const predictions: StockPrediction[] = produse?.map(produs => {
        const istoric = consumZilnic.get(produs.id) || [];
        const consumMediu = istoric.reduce((sum, val) => sum + val, 0) / istoric.length;
        const consumRecent = istoric.slice(-7).reduce((sum, val) => sum + val, 0) / 7;
        
        // Detectează tendința
        const prima_jumatate = istoric.slice(0, 15).reduce((sum, val) => sum + val, 0) / 15;
        const a_doua_jumatate = istoric.slice(15).reduce((sum, val) => sum + val, 0) / 15;
        
        let tendinta: 'CRESCATOR' | 'STABIL' | 'DESCRESCATOR' = 'STABIL';
        if (a_doua_jumatate > prima_jumatate * 1.2) tendinta = 'CRESCATOR';
        else if (a_doua_jumatate < prima_jumatate * 0.8) tendinta = 'DESCRESCATOR';
        
        // Calculează predicțiile
        const viteza_consum = tendinta === 'CRESCATOR' ? consumRecent * 1.1 : 
                             tendinta === 'DESCRESCATOR' ? consumRecent * 0.9 : consumMediu;
        
        const predictie_7_zile = Math.max(0, produs.stoc_disponibil - (viteza_consum * 7));
        const predictie_14_zile = Math.max(0, produs.stoc_disponibil - (viteza_consum * 14));
        const predictie_30_zile = Math.max(0, produs.stoc_disponibil - (viteza_consum * 30));
        
        // Calculează data estimată de epuizare
        let data_estimata_epuizare: Date | null = null;
        if (viteza_consum > 0) {
          const zile_ramase = produs.stoc_disponibil / viteza_consum;
          if (zile_ramase > 0) {
            data_estimata_epuizare = addDays(new Date(), Math.ceil(zile_ramase));
          }
        }
        
        // Calculează riscul de epuizare
        let risc_epuizare: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        if (predictie_7_zile <= 0) risc_epuizare = 'CRITICAL';
        else if (predictie_14_zile <= produs.prag_alerta_stoc) risc_epuizare = 'HIGH';
        else if (predictie_30_zile <= produs.prag_alerta_stoc * 2) risc_epuizare = 'MEDIUM';
        
        return {
          produs_id: produs.id,
          nume: produs.nume,
          stoc_actual: produs.stoc_disponibil,
          predictie_7_zile,
          predictie_14_zile,
          predictie_30_zile,
          risc_epuizare,
          data_estimata_epuizare,
          tendinta,
          viteza_consum
        };
      }) || [];

      console.log('🔮 Stock predictions calculated:', predictions.length);
      return predictions;
    },
    staleTime: 15 * 60 * 1000, // 15 minute cache
    refetchInterval: 30 * 60 * 1000, // Actualizează la 30 min
  });

  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ['predictive-insights', predictions],
    queryFn: async () => {
      const insights: PredictiveInsight[] = [];
      
      // Analiză risc stoc critic
      const produseCritice = predictions.filter(p => p.risc_epuizare === 'CRITICAL');
      if (produseCritice.length > 0) {
        insights.push({
          type: 'stock_alert',
          severity: 'critical',
          title: `${produseCritice.length} produse vor avea stoc zero în 7 zile`,
          description: 'Acțiune imediată necesară pentru evitarea întreruperilor',
          actionRequired: 'Contactați furnizorii și expeditați comenzile urgente',
          affectedProducts: produseCritice.map(p => p.nume),
          confidence: 85
        });
      }
      
      // Analiză tendințe de creștere
      const produseCrescatoare = predictions.filter(p => p.tendinta === 'CRESCATOR' && p.risc_epuizare !== 'LOW');
      if (produseCrescatoare.length > 0) {
        insights.push({
          type: 'demand_spike',
          severity: 'warning',
          title: `Cerere crescută detectată pentru ${produseCrescatoare.length} produse`,
          description: 'Viteza de consum a crescut semnificativ în ultima perioadă',
          actionRequired: 'Ajustați planul de aprovizionare și monitorizați îndeaproape',
          affectedProducts: produseCrescatoare.map(p => p.nume),
          confidence: 78
        });
      }
      
      // Analiză produse cu risc mediu/mare
      const produseRisc = predictions.filter(p => ['MEDIUM', 'HIGH'].includes(p.risc_epuizare));
      if (produseRisc.length > 0) {
        insights.push({
          type: 'supplier_risk',
          severity: 'warning',
          title: `${produseRisc.length} produse necesită atenție în următoarele 2-4 săptămâni`,
          description: 'Planificați comenzile de aprovizionare pentru a evita stocul zero',
          actionRequired: 'Verificați termenele de livrare și inițiați procesul de comandă',
          affectedProducts: produseRisc.map(p => p.nume),
          confidence: 72
        });
      }
      
      return insights;
    },
    enabled: predictions.length > 0,
    staleTime: 15 * 60 * 1000,
  });

  const getHighRiskProducts = () => {
    return predictions.filter(p => ['HIGH', 'CRITICAL'].includes(p.risc_epuizare));
  };

  const getStockOutDates = () => {
    return predictions
      .filter(p => p.data_estimata_epuizare)
      .sort((a, b) => a.data_estimata_epuizare!.getTime() - b.data_estimata_epuizare!.getTime())
      .slice(0, 10);
  };

  return {
    predictions,
    insights,
    isLoading: predictionsLoading || insightsLoading,
    getHighRiskProducts,
    getStockOutDates
  };
}
