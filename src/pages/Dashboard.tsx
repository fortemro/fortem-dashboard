import { useComenzi } from "@/hooks/useComenzi";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Presupunând că folosești componente Card

// O componentă simplă pentru a afișa un spinner de încărcare
function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
}

export default function Dashboard() {
    // Preluăm datele și starea de încărcare de la hook-ul pe care l-am reparat
    const { comenzi, loading } = useComenzi();

    // Folosim useMemo pentru a calcula statisticile doar când lista de comenzi se schimbă.
    // Acest calcul se face acum într-un mod sigur.
    const stats = useMemo(() => {
        // Dacă datele se încarcă sau lista nu există, returnăm valori implicite.
        if (!comenzi) {
            return {
                totalComenzi: 0,
                comenziInAsteptare: 0,
                valoareTotala: 0,
            };
        }

        // Filtrarea și calculele se fac doar pe o listă validă.
        const comenziInAsteptare = comenzi.filter(c => c.status === 'in_asteptare').length;
        const valoareTotala = comenzi.reduce((sum, c) => sum + (c.total_comanda || 0), 0);
        
        return {
            totalComenzi: comenzi.length,
            comenziInAsteptare,
            valoareTotala,
        };
    }, [comenzi]);

    // Afișăm un mesaj/spinner de încărcare cât timp datele nu sunt gata.
    // Acest lucru previne eroarea 'Cannot read properties of undefined'.
    if (loading) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <h1 className="text-3xl font-bold">Situație Comenzi</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Comenzi</CardTitle>
                        {/* Aici poți adăuga o iconiță */}
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{stats.totalComenzi}</div>
                        <p className="text-xs text-muted-foreground">Numărul total de comenzi plasate</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Comenzi în Așteptare</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{stats.comenziInAsteptare}</div>
                        <p className="text-xs text-muted-foreground">Comenzi ce necesită procesare</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valoare Totală</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">
                            {stats.valoareTotala.toLocaleString('ro-RO')} RON
                        </div>
                        <p className="text-xs text-muted-foreground">Valoarea totală a comenzilor</p>
                    </CardContent>
                </Card>
            </div>
            {/* Aici se poate adăuga un tabel cu ultimele comenzi */}
        </div>
    );
}