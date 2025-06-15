
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
    dateRange: undefined,
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

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulare generare raport
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportData = {
        title: reportConfig.title,
        timestamp: new Date().toISOString(),
        dateRange: reportConfig.dateRange,
        sections: reportConfig.includeSections,
        format: reportConfig.format
      };
      
      console.log('📊 Generating executive report:', reportData);
      
      if (reportConfig.schedule === 'now') {
        // Descărcare imediată
        const blob = new Blob([JSON.stringify(reportData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raport-executiv-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "📄 Raport Generat",
          description: "Raportul executiv a fost descărcat cu succes",
        });
      } else {
        // Programare automată
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
                  <SelectItem value="pdf">📄 PDF</SelectItem>
                  <SelectItem value="excel">📊 Excel</SelectItem>
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
      
      {/* Secțiuni Raport */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Secțiuni de Inclus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <p className="font-medium mb-1">💡 Sfat:</p>
            <p>Rapoartele programate vor fi trimise automat la adresele specificate în fiecare {reportConfig.schedule === 'daily' ? 'zi' : reportConfig.schedule === 'weekly' ? 'săptămână' : 'lună'} la ora 08:00.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
