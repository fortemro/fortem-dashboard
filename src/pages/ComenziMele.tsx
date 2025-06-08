// src/pages/ComenziMele.tsx
import { useComenzi } from "@/hooks/useComenzi";
import { useDistribuitori } from "@/hooks/useDistribuitori";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// ... (păstrează funcția formatStatus dacă o ai definită aici)

export default function ComenziMele() {
    const { comenzi, loading: loadingComenzi } = useComenzi();
    const { distribuitori, loading: loadingDistribuitori } = useDistribuitori();
    const navigate = useNavigate();
    const isLoading = loadingComenzi || loadingDistribuitori;

    const comenziCuNumeDistribuitor = useMemo(() => {
        if (isLoading || !comenzi || !distribuitori) return [];
        const distribuitoriMap = new Map(distribuitori.map(d => [d.id, d.nume_companie]));
        return comenzi.map(comanda => ({
            ...comanda,
            nume_distribuitor: distribuitoriMap.get(comanda.distribuitor_id) || 'N/A'
        }));
    }, [comenzi, distribuitori, isLoading]);

    if (isLoading) {
        return <div className="p-8">Se încarcă comenzile...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader><CardTitle>Comenzile Mele</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nr. Comandă</TableHead>
                                <TableHead>Distribuitor</TableHead>
                                <TableHead>Dată</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Acțiuni</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {comenziCuNumeDistribuitor.map((comanda) => (
                                <TableRow key={comanda.id}>
                                    <TableCell>{comanda.numar_comanda}</TableCell>
                                    <TableCell>{comanda.nume_distribuitor}</TableCell>
                                    <TableCell>{new Date(comanda.data_comanda).toLocaleDateString('ro-RO')}</TableCell>
                                    <TableCell>{comanda.status}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/comanda?edit=${comanda.id}`)}>
                                            Editează
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}