import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShoppingCart, Truck } from "lucide-react";
import { Suspense } from "react";

// 1. Le sous-composant asynchrone qui charge les données et vérifie l'auth
async function DashboardContent() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Si l'utilisateur n'est pas connecté, on le renvoie vers la page de login
    if (authError || !user) {
        redirect("/auth/login");
    }

    // Récupération du nom du concierge
    const { data: janitor } = await supabase
        .from("Janitor")
        .select("name")
        .eq("auth_id", user.id)
        .single();

    return (
        <div className="flex-1 flex flex-col gap-10 w-full mt-6">

            {/* En-tête du tableau de bord */}
            <div>
                <h1 className="text-4xl font-bold tracking-tight">
                    Bonjour, <span className="text-primary">{janitor?.name || "Concierge"}</span> 👋
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Bienvenue sur votre espace de gestion Janitor 2000. Que souhaitez-vous faire aujourd&#39;hui ?
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card className="hover:border-primary/50 transition-colors flex flex-col justify-between shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Users className="text-blue-500" /> Mes Clients
                        </CardTitle>
                        <CardDescription>Gérez votre portefeuille client</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-6">
                            Ajoutez de nouveaux clients, modifiez leurs informations et gardez un œil sur leur historique.
                        </p>
                        <Link href="/protected/clients">
                            <Button className="w-full">Voir mes clients</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Carte Boutique / Commande */}
                <Card className="hover:border-primary/50 transition-colors flex flex-col justify-between shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <ShoppingCart className="text-green-500" /> Nouvelle Commande
                        </CardTitle>
                        <CardDescription>Accédez au catalogue complet</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-6">
                            Parcourez les produits disponibles et passez commande pour le compte de vos clients.
                        </p>
                        <Link href="/protected/shop">
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                Ouvrir le catalogue
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Carte Suivi */}
                <Card className="bg-muted/30 border-dashed flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-muted-foreground">
                            <Truck /> Suivi & Historique
                        </CardTitle>
                        <CardDescription>Consultez vos commandes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-6">
                            Suivez l&#39;état de préparation et d&#39;expédition des lots de commandes de vos clients.
                        </p>
                        <Button variant="secondary" className="w-full" disabled>
                            Prochainement
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

// 2. La page principale exportée, qui enveloppe le contenu dans un Suspense
export default function ProtectedPage() {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col items-center justify-center py-32 text-muted-foreground animate-pulse">
                    <p className="text-lg">Chargement de votre espace sécurisé...</p>
                </div>
            }
        >
            <DashboardContent />
        </Suspense>
    );
}