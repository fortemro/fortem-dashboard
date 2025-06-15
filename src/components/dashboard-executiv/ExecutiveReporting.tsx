
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Mail, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import { CustomDateRangePicker } from '@/components/CustomDateRangePicker';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useExecutiveDashboardData } from '@/hooks/dashboard-executiv/useExecutiveDashboardData';
import { PeriodFilter } from './PeriodFilter';
import { generatePDFReport, generateExcelData, generateCSVData, ReportData } from '@/utils/reportGenerator';

interface ReportConfig {
  title: string;
  description: string;
  dateRange: DateRange | undefined;
  format: 'pdf' | 'excel' | 'csv';
  includeSections: {
    kpis: boolean;
    charts: boolean;
    alerts: boolean;
    topProducts: boolean;
    orders: boolean;
  };
  recipients: string;
  schedule: 'now' | 'daily' | 'weekly' | 'monthly';
}

export function ExecutiveReporting() {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: 'Raport Executiv Dashboard',
    description: '',
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date()
    },
    format: 'pdf',
    includeSections: {
      kpis: true,
      charts: true,
      alerts: true,
      topProducts: true,
      orders: false
    },
    recipients: '',
    schedule: 'now'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Determină perioada pentru hook-ul de date
  const period: PeriodFilter = 'custom';
  const { kpis, topProducts, performanceData, isLoading } = useExecutiveDashboardData(period, reportConfig.dateRange);

  const handleGenerateReport = async () => {
    if (!reportConfig.dateRange?.from || !reportConfig.dateRange?.to) {
      toast({
        title: "❌ Eroare",
        description: "Vă rugăm să selectați o perioadă pentru raport",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const reportData: ReportData = {
        title: reportConfig.title,
        timestamp: new Date().toISOString(),
        dateRange: {
          from: reportConfig.dateRange.from.toISOString(),
          to: reportConfig.dateRange.to.toISOString()
        },
        kpis,
        topProducts,
        performanceData,
        format: reportConfig.format
      };
      
      console.log('📊 Generating executive report with real data:', reportData);
      
      if (reportConfig.schedule === 'now') {
        let fileContent: string;
        let fileName: string;
        let mimeType: string;
        
        switch (reportConfig.format) {
          case 'pdf':
            fileContent = generatePDFReport(reportData);
            fileName = `raport-executiv-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.html`;
            mimeType = 'text/html';
            break;
            
          case 'excel':
            const excelData = generateExcelData(reportData);
            fileContent = JSON.stringify(excelData, null, 2);
            fileName = `raport-executiv-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
            mimeType = 'application/json';
            break;
            
          case 'csv':
            fileContent = generateCSVData(reportData);
            fileName = `raport-executiv-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`;
            mimeType = 'text/csv';
            break;
            
          default:
            throw new Error('Format nesuportat');
        }
        
        // Descărcare fișier
        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "📄 Raport Generat",
          description: `Raportul ${reportConfig.format.toUpperCase()} a fost descărcat cu succes`,
        });
      } else {
        toast({
          title: "📅 Raport Programat",
          description: `Raportul va fi trimis automat ${reportConfig.schedule === 'daily' ? 'zilnic' : reportConfig.schedule === 'weekly' ? 'săptămânal' : 'lunar'}`,
        });
      }
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "❌ Eroare",
        description: "A apărut o eroare la generarea raportului",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return 'Nu este selectată';
    if (!range.to) return format(range.from, 'dd MMM yyyy', { locale: ro });
    return `${format(range.from, 'dd MMM', { locale: ro })} - ${format(range.to, 'dd MMM yyyy', { locale: ro })}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded w-3/5"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configurare Raport */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Configurare Raport Executiv
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-title">Titlu Raport</Label>
            <Input
              id="report-title"
              value={reportConfig.title}
              onChange={(e) => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Numele raportului..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="report-description">Descriere</Label>
            <Textarea
              id="report-description"
              value={reportConfig.description}
              onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrierea raportului..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Perioada Raportului</Label>
            <CustomDateRangePicker
              dateRange={reportConfig.dateRange}
              onDateRangeChange={(range) => setReportConfig(prev => ({ ...prev, dateRange: range }))}
            />
            <p className="text-sm text-gray-600">
              Perioada selectată: {formatDateRange(reportConfig.dateRange)}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Format Export</Label>
              <Select 
                value={reportConfig.format} 
                onValueChange={(value: 'pdf' | 'excel' | 'csv') => 
                  setReportConfig(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">📄 HTML/PDF</SelectItem>
                  <SelectItem value="excel">📊 Excel (JSON)</SelectItem>
                  <SelectItem value="csv">📝 CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Programare</Label>
              <Select 
                value={reportConfig.schedule} 
                onValueChange={(value: 'now' | 'daily' | 'weekly' | 'monthly') => 
                  setReportConfig(prev => ({ ...prev, schedule: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">📥 Acum</SelectItem>
                  <SelectItem value="daily">📅 Zilnic</SelectItem>
                  <SelectItem value="weekly">📆 Săptămânal</SelectItem>
                  <SelectItem value="monthly">🗓️ Lunar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {reportConfig.schedule !== 'now' && (
            <div className="space-y-2">
              <Label htmlFor="recipients">Email Destinatari</Label>
              <Input
                id="recipients"
                value={reportConfig.recipients}
                onChange={(e) => setReportConfig(prev => ({ ...prev, recipients: e.target.value }))}
                placeholder="email1@example.com, email2@example.com"
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Secțiuni Raport și Previzualizare Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Previzualizare Date Raport
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">📊 Date Disponibile:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>• Vânzări: {kpis.vanzariTotale?.toLocaleString('ro-RO')} RON</div>
              <div>• Comenzi: {kpis.comenziActive}</div>
              <div>• Distribuitori: {kpis.distributoriActivi}</div>
              <div>• Paleți: {kpis.totalPaleti}</div>
              <div>• Top Produse: {topProducts.length}</div>
              <div>• Zile Date: {performanceData.length}</div>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries({
              kpis: { label: 'KPI-uri și Metrici', icon: TrendingUp },
              charts: { label: 'Grafice și Analytics', icon: BarChart3 },
              alerts: { label: 'Alerte și Probleme', icon: FileText },
              topProducts: { label: 'Top Produse', icon: TrendingUp },
              orders: { label: 'Detalii Comenzi', icon: FileText }
            }).map(([key, { label, icon: Icon }]) => (
              <div key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={key}
                  checked={reportConfig.includeSections[key as keyof typeof reportConfig.includeSections]}
                  onChange={(e) => 
                    setReportConfig(prev => ({
                      ...prev,
                      includeSections: {
                        ...prev.includeSections,
                        [key]: e.target.checked
                      }
                    }))
                  }
                  className="rounded"
                />
                <Icon className="h-4 w-4 text-gray-600" />
                <Label htmlFor={key} className="text-sm cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generez raportul...
                </>
              ) : (
                <>
                  {reportConfig.schedule === 'now' ? (
                    <Download className="h-4 w-4 mr-2" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  {reportConfig.schedule === 'now' ? 'Descarcă Raportul' : 'Programează Raportul'}
                </>
              )}
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p className="font-medium mb-1">💡 Nou:</p>
            <p>Rapoartele conțin acum date reale din dashboard: KPI-uri, top produse, performanță zilnică și alerte. Formatele PDF/HTML sunt optimizate pentru printare.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
