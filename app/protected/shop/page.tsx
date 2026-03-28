import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/product-grid";

async function ShopItems() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Veuillez vous connecter.</div>;

    const { data: janitor } = await supabase.from("janitor").select("id").eq("auth_id", user.id).single();
    if (!janitor) return <div>Profil concierge introuvable.</div>;

    // 1. Articles et Méthodes de paiement
    const { data: items } = await supabase.from("item").select("id, label, price").order("label");
    const { data: paymentMethods } = await supabase.from("paymentmethod").select("id, label").order("label");

    // 2. Clients avec leurs adresses et téléphones
    const { data: relations } = await supabase
        .from("caresfor")
        .select(`
            customer ( 
                id, name,
                phone ( digits ),
                hasaddress ( address ( id, street, number, post_code, city, country ( label ) ) )
            )
        `)
        .eq("janitor", janitor.id);

    const clients = relations?.map((r: any) => {
        const c = r.customer;
        return {
            id: c.id,
            name: c.name,
            phones: c.phone?.map((p: any) => p.digits) || [],
            addresses: c.hasaddress?.map((ha: any) => {
                const a = ha.address;
                const countryLabel = a.country?.label || "";
                return {
                    id: a.id,
                    fullAddress: `${a.number || ''} ${a.street || ''}, ${a.post_code || ''} ${a.city || ''} ${countryLabel}`.trim()
                };
            }) || []
        };
    }).filter(Boolean) || [];

    return (
        <ProductGrid
            initialItems={items || []}
            clients={clients}
            janitorId={janitor.id}
            paymentMethods={paymentMethods || []}
        />
    );
}

export default function ShopPage() {
    return (
        <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col gap-8 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Catalogue Conciergerie</h1>
                <p className="text-muted-foreground mt-2">Préparez la commande et saisissez les paiements reçus.</p>
            </div>
            <Suspense fallback={<div className="p-12 animate-pulse flex justify-center">Chargement...</div>}>
                <ShopItems />
            </Suspense>
        </div>
    );
}