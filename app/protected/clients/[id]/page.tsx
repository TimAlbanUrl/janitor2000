import { Suspense } from "react";
import { CustomerForm } from "@/components/customer-form";
import { createClient } from "@/lib/supabase/server";

// Typage pour les pays
type Country = { id: number; label: string };

async function EditClientForm({ params }: { params: Promise<{ id: string }> }) {
    // 1. Déballage des paramètres (Nouveauté Next.js 15)
    const resolvedParams = await params;
    const clientId = parseInt(resolvedParams.id);

    const supabase = await createClient();

    // 2. On récupère la liste complète des pays et on UTILISE le type Country ici
    const { data } = await supabase.from("country").select("id, label").order("label");
    const countries: Country[] = data || [];

    // 3. MAGIE SUPABASE : Requête "Jointure" pour récupérer tout le profil
    // On récupère infos client + ses tels + ses adresses (via hasaddress)
    const { data: rawCustomer, error } = await supabase
        .from("customer")
        .select(`
            id, 
            name, 
            mail, 
            birth,
            phone ( digits ),
            hasaddress (
                address ( id, street, number, post_code, city, country )
            )
        `)
        .eq("id", clientId)
        .single();

    if (error || !rawCustomer) {
        return <div>Erreur : Client introuvable.</div>
    }

    // 4. REFORMATAGE : On aplatit les données pour que le formulaire React les comprenne facilement
    const formattedCustomer = {
        id: rawCustomer.id,
        name: rawCustomer.name,
        mail: rawCustomer.mail,
        birth: rawCustomer.birth,
        // On extrait juste les numéros
        phones: rawCustomer.phone?.map((p: any) => p.digits) || [],
        // On extrait les infos d'adresse en gardant l'ID de l'adresse pour la modif
        addresses: rawCustomer.hasaddress?.map((ha: any) => ({
            id: ha.address.id, // ID de la table 'address'
            street: ha.address.street || "",
            number: ha.address.number || "",
            post_code: ha.address.post_code || "",
            city: ha.address.city || "",
            country_id: ha.address.country // ID du pays
        })) || []
    };

    return <CustomerForm initialData={formattedCustomer} countries={countries} />;
}

export default function ModifierClientPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col gap-8 p-6">
            <Suspense fallback={<div className="p-24 animate-pulse flex justify-center">Chargement du profil...</div>}>
                <EditClientForm params={params} />
            </Suspense>
        </div>
    );
}