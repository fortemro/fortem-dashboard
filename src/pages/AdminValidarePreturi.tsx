
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { usePreturiOficiale } from '@/hooks/usePreturiOficiale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export default function AdminValidarePreturi() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { preturi, validatePrices } = usePreturiOficiale();
  const { toast } = useToast();
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Verifică dacă utilizatorul este Admin
  if (!profile || profile.rol !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Acces Interzis</CardTitle>
            <CardDescription>
              Nu aveți permisiunea de a accesa această pagină. Doar administratorii pot accesa validarea prețurilor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin-dashboard">
              <Button variant="outline" className="w-full">
                Înapoi la Dashboard Admin
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleValidateAll = async () => {
    setLoading(true);
    try {
      const results = await validatePrices();
      setValidationResults(results);
      
      toast({
        title: "Validare completă",
        description: `Au fost găsite ${results.length} diferențe de preț semnificative`,
        variant: results.length > 0 ? "destructive" : "default"
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut efectua validarea prețurilor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadPreturi = async () => {
    if (!selectedFile) {
      toast({
        title: "Eroare",
        description: "Vă rugăm să selectați un fișier Excel",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "În dezvoltare",
      description: "Funcționalitatea de upload va fi implementată în curând",
    });
  };

  const exportValidationResults = () => {
    if (validationResults.length === 0) {
      toast({
        title: "Nu există date",
        description: "Nu există rezultate de validare pentru export",
        variant: "destructive"
      });
      return;
    }

    // Simplă implementare pentru export CSV
    const csvContent = [
      ['Număr Comandă', 'Produs', 'Preț Comandă', 'Preț Oficial', 'Diferență', 'Procent Diferență'],
      ...validationResults.map(result => [
        result.comenzi?.numar_comanda || '',
        result.produse?.nume || '',
        result.pret_unitar,
        result.pret_oficial,
        result.diferenta.toFixed(2),
        result.procent_diferenta.toFixed(2) + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validare-preturi-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  };

  const getSeverityColor = (percentage: number) => {
    if (percentage > 20) return 'bg-red-100 text-red-800';
    if (percentage > 10) return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Validare Prețuri</h1>
              <p className="text-gray-600 mt-2">
                Verificarea consistenței prețurilor cu grilele oficiale
              </p>
            </div>
            <Link to="/admin-dashboard">
              <Button variant="outline">
                Înapoi la Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Upload prețuri oficiale */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Încărcare Prețuri Oficiale
            </CardTitle>
            <CardDescription>
              Încărcați fișiere Excel cu grilele de preț oficiale pe zone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Button onClick={handleUploadPreturi} disabled={!selectedFile}>
                <Upload className="h-4 w-4 mr-2" />
                Încarcă
              </Button>
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                Fișier selectat: {selectedFile.name}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Acțiuni validare */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Validare Prețuri
            </CardTitle>
            <CardDescription>
              Comparați prețurile din comenzi cu grilele oficiale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleValidateAll} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>Validare în curs...</>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Validează Toate Prețurile
                  </>
                )}
              </Button>
              
              {validationResults.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={exportValidationResults}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Rezultate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rezultate validare */}
        {validationResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Diferențe de Preț Detectate
              </CardTitle>
              <CardDescription>
                Comenzile cu prețuri care diferă semnificativ de grilele oficiale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Număr Comandă</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Produs</TableHead>
                      <TableHead>MZV</TableHead>
                      <TableHead>Preț Comandă</TableHead>
                      <TableHead>Preț Oficial</TableHead>
                      <TableHead>Diferență</TableHead>
                      <TableHead>Severitate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {result.comenzi?.numar_comanda}
                        </TableCell>
                        <TableCell>
                          {new Date(result.comenzi?.data_comanda).toLocaleDateString('ro-RO')}
                        </TableCell>
                        <TableCell>{result.produse?.nume}</TableCell>
                        <TableCell>
                          {result.comenzi?.profiluri_utilizatori 
                            ? `${result.comenzi.profiluri_utilizatori.nume} ${result.comenzi.profiluri_utilizatori.prenume}`
                            : 'Necunoscut'
                          }
                        </TableCell>
                        <TableCell>{formatCurrency(result.pret_unitar)}</TableCell>
                        <TableCell>{formatCurrency(result.pret_oficial)}</TableCell>
                        <TableCell>{formatCurrency(result.diferenta)}</TableCell>
                        <TableCell>
                          <Badge 
                            className={getSeverityColor(result.procent_diferenta)}
                          >
                            {result.procent_diferenta.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mesaj când nu sunt diferențe */}
        {validationResults.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nicio diferență detectată
              </h3>
              <p className="text-gray-600">
                Apăsați butonul "Validează Toate Prețurile" pentru a începe analiza
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
