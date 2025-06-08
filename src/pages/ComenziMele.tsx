// src/pages/ComenziMele.tsx
import { useComenzi } from "@/hooks/useComenzi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Eye, Copy } from "lucide-react";

export default function ComenziMele() {
    const { comenzi, loading } = useComenzi();
    const navigate = useNavigate();

    const handleDuplicate = (comanda: any) => {
        localStorage.setItem('duplicateOrderData', JSON.stringify(comanda));
        navigate('/comanda');
    };

    if (loading) return <div className="p-8">Se încarcă...</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader><CardTitle>Comenzile Mele</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                           {/* ... Header-ul tabelului ... */}
                        </TableHeader>
                        <TableBody>
                            {comenzi.map((comanda: any) => (
                                <TableRow key={comanda.id}>
                                    <TableCell>{comanda.numar_comanda}</TableCell>
                                    <TableCell>{comanda.distribuitori?.nume_companie || 'N/A'}</TableCell>
                                    <TableCell>{new Date(comanda.data_comanda).toLocaleDateString('ro-RO')}</TableCell>
                                    <TableCell><Badge>{comanda.status}</Badge></TableCell>
                                    <TableCell className="space-x-2">
                                        <Button variant="outline" size="icon"><Eye className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="icon" onClick={() => handleDuplicate(comanda)}>
                                            <Copy className="h-4 w-4" />
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