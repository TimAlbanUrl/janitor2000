"use client";

import { useState, useEffect } from "react";
import { saveCustomer } from "@/app/actions/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, MapPin, Phone as PhoneIcon } from "lucide-react";

type Country = { id: number; label: string };

export function CustomerForm({ initialData, countries }: { initialData?: any, countries: Country[] }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!initialData?.id;

    // --- ÉTATS DYNAMIQUES INITIALISÉS AVEC LES DONNÉES EXISTANTES ---
    const [phones, setPhones] = useState<string[]>(initialData?.phones || []);
    const [addresses, setAddresses] = useState<any[]>(initialData?.addresses || []);

    // --- TÉLÉPHONES ---
    const updatePhone = (index: number, value: string) => {
        const newPhones = [...phones];
        newPhones[index] = value;
        setPhones(newPhones);
    };
    const addPhone = () => setPhones([...phones, ""]);
    // La suppression ici mettra à jour le JSON envoyé au serveur
    const removePhone = (index: number) => setPhones(phones.filter((_, i) => i !== index));

    // --- ADRESSES ---
    const updateAddress = (index: number, field: string, value: string) => {
        const newAddresses = [...addresses];
        newAddresses[index] = { ...newAddresses[index], [field]: value };
        setAddresses(newAddresses);
    };
    const addAddress = () => setAddresses([...addresses, { street: "", number: "", post_code: "", city: "", country_id: "" }]);
    const removeAddress = (index: number) => setAddresses(addresses.filter((_, i) => i !== index));

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
            <CardHeader className="border-b bg-muted/20">
                <CardTitle>{isEditing ? `Modifier : ${initialData.name}` : "Nouveau client"}</CardTitle>
                <CardDescription>Gérez toutes les coordonnées du client.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <form action={saveCustomer} onSubmit={() => setIsSubmitting(true)} className="flex flex-col gap-10">

                    {isEditing && <input type="hidden" name="id" value={initialData.id} />}

                    {/* JSON HIDDEN FIELDS : Contiennent l'état final de l'interface (incluant les suppressions) */}
                    <input type="hidden" name="phonesData" value={JSON.stringify(phones)} />
                    <input type="hidden" name="addressesData" value={JSON.stringify(addresses)} />

                    {/* === INFOS DE BASE === */}
                    <div>
                        <h3 className="font-semibold text-xl mb-4 text-primary">Informations Principales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-card">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nom complet *</Label>
                                <Input id="name" name="name" defaultValue={initialData?.name} required placeholder="Jean Dupont" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="mail">Email *</Label>
                                <Input id="mail" name="mail" type="email" defaultValue={initialData?.mail} required placeholder="jean@example.com" />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="birth">Date de naissance</Label>
                                <Input id="birth" name="birth" type="date" defaultValue={initialData?.birth} />
                            </div>
                        </div>
                    </div>

                    {/* === TÉLÉPHONES === */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-xl flex items-center gap-2 text-primary">
                                <PhoneIcon size={22} /> Téléphones
                            </h3>
                            <Button type="button" variant="outline" size="sm" onClick={addPhone} className="gap-2">
                                <PlusCircle size={16} /> Ajouter
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {phones.map((phone, index) => (
                                <div key={index} className="flex items-end gap-3 p-3 border rounded-lg bg-card">
                                    <div className="grid gap-2 flex-1">
                                        <Label className="text-muted-foreground text-xs">Numéro {index + 1}</Label>
                                        <Input value={phone} onChange={(e) => updatePhone(index, e.target.value)} placeholder="0612345678" />
                                    </div>
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removePhone(index)} title="Supprimer ce numéro">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                            {phones.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center border rounded-lg border-dashed md:col-span-2">Aucun numéro enregistré.</p>}
                        </div>
                    </div>

                    {/* === ADRESSES === */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-xl flex items-center gap-2 text-primary">
                                <MapPin size={22} /> Adresses de livraison
                            </h3>
                            <Button type="button" variant="outline" size="sm" onClick={addAddress} className="gap-2">
                                <PlusCircle size={16} /> Ajouter
                            </Button>
                        </div>

                        <div className="flex flex-col gap-6">
                            {addresses.map((address, index) => (
                                <div key={index} className="relative p-5 border rounded-lg bg-muted/10 shadow-inner">
                                    {/* ID caché de l'adresse pour la modif côté serveur */}
                                    {address.id && <input type="hidden" value={address.id} />}

                                    <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 gap-1" onClick={() => removeAddress(index)}>
                                        <Trash2 size={16} /> Supprimer
                                    </Button>

                                    <h4 className="font-medium mb-5 text-sm text-muted-foreground uppercase tracking-wider">Adresse {index + 1}</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                        <div className="grid gap-2 md:col-span-9">
                                            <Label>Rue</Label>
                                            <Input value={address.street} onChange={(e) => updateAddress(index, "street", e.target.value)} placeholder="Rue de la Paix" />
                                        </div>
                                        <div className="grid gap-2 md:col-span-3">
                                            <Label>Numéro</Label>
                                            <Input type="number" value={address.number} onChange={(e) => updateAddress(index, "number", e.target.value)} placeholder="12" />
                                        </div>
                                        <div className="grid gap-2 md:col-span-4">
                                            <Label>Code Postal</Label>
                                            <Input value={address.post_code} onChange={(e) => updateAddress(index, "post_code", e.target.value)} placeholder="75000" />
                                        </div>
                                        <div className="grid gap-2 md:col-span-8">
                                            <Label>Ville</Label>
                                            <Input value={address.city} onChange={(e) => updateAddress(index, "city", e.target.value)} placeholder="Paris" />
                                        </div>

                                        {/* NOUVEAU : Champ Country */}
                                        <div className="grid gap-2 md:col-span-12">
                                            <Label>Pays *</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={address.country_id}
                                                required
                                                onChange={(e) => updateAddress(index, "country_id", e.target.value)}
                                            >
                                                <option value="" disabled>-- Sélectionner un pays --</option>
                                                {countries.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {addresses.length === 0 && <p className="text-sm text-muted-foreground p-8 text-center border rounded-lg border-dashed">Aucune adresse enregistrée.</p>}
                        </div>
                    </div>

                    {/* === BOUTONS D'ACTION === */}
                    <div className="flex justify-end gap-4 mt-4 pt-6 border-t bg-muted/10 p-4 -m-6 rounded-b-lg">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Annuler
                        </Button>
                        <Button type="submit" size="lg" disabled={isSubmitting} className="px-10">
                            {isSubmitting ? "Enregistrement..." : isEditing ? "Sauvegarder les modifications" : "Créer le client"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}