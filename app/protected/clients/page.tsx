import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

async function ClientList() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Veuillez vous connecter.</div>;
    }

    const { data: janitor } = await supabase
        .from("janitor")
        .select("id")
        .eq("auth_id", user.id)
        .single();

    if (!janitor) {
        return <div>Profil concierge introuvable.</div>;
    }

    const { data: relations, error } = await supabase
        .from("caresfor")
        .select(`
      customer (
        id,
        name,
        mail,
        facebook,
        instagram
      )
    `)
        .eq("janitor", janitor.id);

    if (error) {
        return <div className="text-red-500">Erreur de chargement : {error.message}</div>;
    }

    const clients = relations?.map(r => r.customer).filter(Boolean) || [];

    if (clients.length === 0) {
        return (
            <div className="text-center p-12 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">Vous n&#39;avez pas encore de clients.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client: any) => (
                <Card key={client.id} className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle>{client.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{client.mail}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2 mb-4 text-sm">
                            {client.facebook && (
                                <p>🔵 Facebook : {client.facebook}</p>
                            )}
                            {client.instagram && (
                                <p>🟣 Instagram : {client.instagram}</p>
                            )}
                        </div>

                        <Link href={`/protected/clients/${client.id}`} className="w-full">
                            <Button variant="outline" className="w-full">
                                Modifier le profil
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function ClientsPage() {
    return (
        <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col gap-8 p-6">

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mes Clients</h1>
                    <p className="text-muted-foreground mt-2">
                        Gérez votre portefeuille de clients et leurs informations.
                    </p>
                </div>

                <Link href="/protected/clients/new">
                    <Button className="bg-primary text-primary-foreground">
                        + Nouveau Client
                    </Button>
                </Link>
            </div>

            <Suspense fallback={
                <div className="flex justify-center p-12 text-muted-foreground animate-pulse">
                    Chargement de vos clients...
                </div>
            }>
                <ClientList />
            </Suspense>

        </div>
    );
}