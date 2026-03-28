"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveCustomer(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Vous devez être connecté.");

    const { data: janitor } = await supabase.from("janitor").select("id").eq("auth_id", user.id).single();
    if (!janitor) throw new Error("Profil concierge introuvable.");

    // Récupération des données basiques
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const mail = formData.get("mail") as string;
    const birth = formData.get("birth") as string;

    // Récupération des tableaux JSON (état final de l'interface)
    const phonesData = JSON.parse(formData.get("phonesData") as string || "[]");
    const addressesData = JSON.parse(formData.get("addressesData") as string || "[]");

    let customerId: number;

    // 1. CRÉATION OU MISE À JOUR DU CLIENT (Main table)
    const customerUpdateData = { name, mail, birth: birth || null };

    if (id) {
        customerId = parseInt(id);
        const { error: updateError } = await supabase.from("customer").update(customerUpdateData).eq("id", customerId);
        if (updateError) throw new Error("Erreur modif client: " + updateError.message);
    } else {
        const { data: newCustomer, error: customerError } = await supabase
            .from("customer")
            .insert([{ ...customerUpdateData, membreship: 1 }])
            .select().single();

        if (customerError) throw new Error("Erreur création client : " + customerError.message);
        customerId = newCustomer.id;

        await supabase.from("caresfor").insert([{ janitor: janitor.id, customer: customerId }]);
    }

    // 2. SYNCHRONISATION DES TÉLÉPHONES
    // Stratégie : On nettoie l'existant pour ce client et on repart à zéro
    const { error: deletePhoneError } = await supabase.from("phone").delete().eq("customer", customerId);
    if (deletePhoneError) console.error("Erreur nettoyage tels:", deletePhoneError);

    // Insertion de la nouvelle liste (en ignorant les doublons PK 'digits' pour être sûr)
    const validPhones = phonesData
        .filter((phone: string) => phone && phone.trim() !== "")
        .map((phone: string) => ({ digits: phone.trim(), customer: customerId }));

    if (validPhones.length > 0) {
        // 'upsert' au lieu de 'insert' pour gérer le cas où un numéro existe déjà en PK (digits)
        const { error: phoneError } = await supabase.from("phone").upsert(validPhones, { onConflict: 'digits' });
        if (phoneError) console.error("Erreur insertion tels:", phoneError);
    }

    // 3. SYNCHRONISATION DES ADRESSES
    // Stratégie : On supprime les *liaisons* existantes.
    const { error: deleteLinkError } = await supabase.from("hasaddress").delete().eq("customer", customerId);
    if (deleteLinkError) console.error("Erreur nettoyage liaisons adresses:", deleteLinkError);

    for (const addr of addressesData) {
        // Rue, Ville et Pays obligatoires
        if (addr.street && addr.city && addr.country_id) {
            let addressId = addr.id;

            const addressObject = {
                street: addr.street,
                city: addr.city,
                post_code: addr.post_code ? parseInt(addr.post_code) : null,
                number: addr.number ? parseInt(addr.number) : null,
                country: parseInt(addr.country_id) // Insertion du Pays
            };

            if (addressId) {
                // --- UPDATE de l'adresse existante ---
                const { error: addrError } = await supabase
                    .from("address")
                    .update(addressObject)
                    .eq("id", addressId);
                if (addrError) console.error("Erreur maj adresse:", addrError);
            } else {
                // --- CREATION de la nouvelle adresse ---
                const { data: newAddress, error: addrError } = await supabase
                    .from("address")
                    .insert([addressObject])
                    .select().single();

                if (addrError) console.error("Erreur création adresse:", addrError);
                else addressId = newAddress.id;
            }

            // --- RE-LIAISON ---
            if (addressId) {
                await supabase.from("hasaddress").insert([{ customer: customerId, address: addressId }]);
            }
        }
    }

    revalidatePath("/protected/clients");
    redirect("/protected/clients");
}