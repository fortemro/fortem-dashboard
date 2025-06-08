import { useComenzi } from "@/hooks/useComenzi";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Componentă pentru starea de încărcare
function LoadingSkeleton() {
    return (
        <div className="p-8 space-y-6">
            <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid gap-4 md:grid-cols-4">
                <div className="h-28 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-28 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-28 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-28 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
    );
}

// Funcție pentru a formata statusul comenzii
const formatStatus = (status: string) => {
    switch (status) {
        case 'in_asteptare':
            return <Badge variant="secondary">În Așteptare</Badge>;
        case 'in_tranzit':
            return <Badge className="bg-blue-500 text-white">În Tranzit</Badge>;
        case 'livrata':
            return <Badge className="bg-green-500 text-white">Livrată</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function Dashboard() {
    const { user } = useAuth();
    const { comenzi, loading } = useComenzi();

    // Calculăm statisticile într-un mod sigur, doar după ce datele au fost încărcate
    const stats = useMemo(() => {
        if (!comenzi || comenzi.length === 0) {
            return {
                comenziInAsteptare: 0,
                comenziInTranzit: 0,
                comenziLivrate: 0,
                valoareTotala: 0,
                comenziRecente: []
            };
        }

        return {
            comenziInAsteptare: comenzi.filter(c => c.status === 'in_asteptare').length,
            comenziInTranzit: comenzi.filter(c => c.status === 'in_tranzit').length,
            comenziLivrate: comenzi.filter(c => c.status === 'livrata').length,
            valoareTotala: comenzi.reduce((sum, c) => sum + (c.total_comanda || 0), 0),
            comenziRecente: comenzi.slice(0, 5) // Luăm primele 5 cele mai recente comenzi
        };
    }, [comenzi]);

    // Afișăm o schemă de încărcare până când datele sunt gata
    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <h1 className="text-3xl font-bold">Bine ai venit, {user?.user_metadata?.full_name || 'Utilizator'}!</h1>
            
            {/* Secțiunea de Carduri cu Statistici */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader><CardTitle>Comenzi în Așteptare</CardTitle></CardHeader>
                    <CardContent><p className="text-4xl font-bold">{stats.comenziInAsteptare}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Comenzi în Tranzit</CardTitle></CardHeader>
                    <CardContent><p className="text-4xl font-bold">{stats.comenziInTranzit}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Comenzi Livrate</CardTitle></CardHeader>
                    <CardContent><p className="text-4xl font-bold">{stats.comenziLivrate}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Valoare Totală Comenzi</CardTitle></CardHeader>
                    <CardContent><p className="text-4xl font-bold">{stats.valoareTotala.toLocaleString('ro-RO')} RON</p></CardContent>
                </Card>
            </div>

            {/* Secțiunea Tabel cu Comenzi Recente */}
            <Card>
                <CardHeader>
                    <CardTitle>Comenzi Recente</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Număr Comandă</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Valoare</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.comenziRecente.length > 0 ? (
                                stats.comenziRecente.map((comanda) => (
                                    <TableRow key={comanda.id}>
                                        <TableCell className="font-medium">{comanda.numar_comanda}</TableCell>
                                        <TableCell>{new Date(comanda.data_comanda).toLocaleDateString('ro-RO')}</TableCell>
                                        <TableCell>{formatStatus(comanda.status)}</TableCell>
                                        <TableCell className="text-right">{comanda.total_comanda.toLocaleString('ro-RO')} RON</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Nu există comenzi recente.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}