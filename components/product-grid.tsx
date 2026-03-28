"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitOrder } from "@/app/actions/order";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2 } from "lucide-react";

type Item = { id: number; label: string; price: number; };
type Client = { id: number; name: string; phones: string[]; addresses: { id: number; fullAddress: string }[]; };
type PaymentMethod = { id: number; label: string; };

export function ProductGrid({
                                initialItems, clients, janitorId, paymentMethods
                            }: {
    initialItems: Item[], clients: Client[], janitorId: number, paymentMethods: PaymentMethod[]
}) {
    const [cart, setCart] = useState<{ [key: number]: number }>({});

    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [selectedPhone, setSelectedPhone] = useState<string>("");

    // NOUVEAU : État pour les paiements multiples
    const [payments, setPayments] = useState<{ methodId: string, amount: number }[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const selectedClient = clients.find(c => c.id.toString() === selectedClientId);

    const addToCart = (id: number) => setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    const removeFromCart = (id: number) => {
        setCart((prev) => {
            const newCart = { ...prev };
            if (newCart[id] > 1) newCart[id] -= 1;
            else delete newCart[id];
            return newCart;
        });
    };

    // Gestion des paiements
    const addPayment = () => setPayments([...payments, { methodId: "", amount: 0 }]);
    const updatePayment = (index: number, field: "methodId" | "amount", value: any) => {
        const newPayments = [...payments];
        newPayments[index] = { ...newPayments[index], [field]: value };
        setPayments(newPayments);
    };
    const removePayment = (index: number) => setPayments(payments.filter((_, i) => i !== index));

    // Calculs des totaux
    const totalCart = Object.entries(cart).reduce((sum, [id, quantity]) => {
        const item = initialItems.find((i) => i.id === Number(id));
        return sum + (item?.price || 0) * quantity;
    }, 0);
    const totalItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const restToPay = totalCart - totalPaid;

    const handleCheckout = async () => {
        if (!selectedClientId || !selectedAddressId || !selectedPhone) {
            return alert("Veuillez sélectionner un client, une adresse et un téléphone.");
        }

        // On vérifie que les paiements saisis sont valides
        const validPayments = payments.filter(p => p.methodId !== "" && p.amount > 0);

        setIsSubmitting(true);
        try {
            const orderItems = Object.entries(cart).map(([id, quantity]) => {
                const item = initialItems.find((i) => i.id === Number(id));
                return { itemId: Number(id), quantity, price: item?.price || 0 };
            });

            // On passe les validPayments à l'action serveur
            await submitOrder(janitorId, parseInt(selectedClientId), parseInt(selectedAddressId), selectedPhone, orderItems, validPayments);

            alert("Commande passée avec succès !");
            router.push("/protected");
        } catch (error: any) {
            alert("Erreur lors de la commande : " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const canCheckout = selectedClientId && selectedAddressId && selectedPhone && totalItemsCount > 0 && !isSubmitting;

    return (
        <div className="flex flex-col gap-8 relative pb-40">

            {/* Configuration de livraison */}
            <div className="bg-card shadow-sm p-6 rounded-lg border flex flex-col gap-6">
                <h3 className="font-bold text-lg border-b pb-2 text-primary">1. Livraison</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <select className="h-10 rounded-md border px-3" value={selectedClientId} onChange={(e) => { setSelectedClientId(e.target.value); setSelectedAddressId(""); setSelectedPhone(""); }}>
                        <option value="" disabled>-- Client --</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select className="h-10 rounded-md border px-3 disabled:opacity-50" value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)} disabled={!selectedClient || selectedClient.addresses.length === 0}>
                        <option value="" disabled>{!selectedClient ? "Client requis" : "-- Adresse --"}</option>
                        {selectedClient?.addresses.map(a => <option key={a.id} value={a.id}>{a.fullAddress}</option>)}
                    </select>
                    <select className="h-10 rounded-md border px-3 disabled:opacity-50" value={selectedPhone} onChange={(e) => setSelectedPhone(e.target.value)} disabled={!selectedClient || selectedClient.phones.length === 0}>
                        <option value="" disabled>{!selectedClient ? "Client requis" : "-- Téléphone --"}</option>
                        {selectedClient?.phones.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>

            {/* Grille des produits */}
            <h3 className="font-bold text-lg text-primary">2. Produits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialItems.map((item) => (
                    <Card key={item.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
                        <CardHeader><CardTitle className="text-lg">{item.label}</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold text-primary">{item.price.toFixed(2)} €</p></CardContent>
                        <CardFooter className="flex justify-between items-center bg-muted/20 py-4">
                            {cart[item.id] ? (
                                <div className="flex items-center gap-4 w-full justify-between">
                                    <Button variant="outline" onClick={() => removeFromCart(item.id)}>-</Button>
                                    <span className="font-semibold text-lg">{cart[item.id]}</span>
                                    <Button variant="outline" onClick={() => addToCart(item.id)}>+</Button>
                                </div>
                            ) : (
                                <Button className="w-full" onClick={() => addToCart(item.id)}>Ajouter</Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Section Paiement */}
            {totalItemsCount > 0 && (
                <div className="bg-card shadow-sm p-6 rounded-lg border flex flex-col gap-6">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="font-bold text-lg text-primary">3. Paiements reçus aujourd&#39;hui</h3>
                        <Button variant="outline" size="sm" onClick={addPayment} className="gap-2"><PlusCircle size={16} /> Ajouter un paiement</Button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {payments.map((payment, index) => (
                            <div key={index} className="flex gap-4 items-end">
                                <div className="flex flex-col gap-2 flex-1">
                                    <label className="text-xs font-semibold">Méthode</label>
                                    <select className="h-10 rounded-md border px-3" value={payment.methodId} onChange={(e) => updatePayment(index, "methodId", e.target.value)}>
                                        <option value="" disabled>-- Choisir --</option>
                                        {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.label}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2 flex-1">
                                    <label className="text-xs font-semibold">Montant (€)</label>
                                    <Input type="number" min="0" step="0.01" value={payment.amount || ""} onChange={(e) => updatePayment(index, "amount", parseFloat(e.target.value) || 0)} />
                                </div>
                                <Button variant="destructive" size="icon" onClick={() => removePayment(index)}><Trash2 size={16}/></Button>
                            </div>
                        ))}
                        {payments.length === 0 && <p className="text-sm text-muted-foreground">Aucun paiement saisi. (Le client pourra payer plus tard)</p>}
                    </div>
                </div>
            )}

            {/* Barre de résumé */}
            {totalItemsCount > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl bg-card border shadow-2xl rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center z-50 gap-4">
                    <div className="flex gap-8">
                        <div><p className="text-sm text-muted-foreground">Total Commande</p><p className="text-xl font-bold">{totalCart.toFixed(2)} €</p></div>
                        <div><p className="text-sm text-muted-foreground">Déjà Payé</p><p className="text-xl font-bold text-green-600">{totalPaid.toFixed(2)} €</p></div>
                        <div>
                            <p className="text-sm text-muted-foreground">Reste à payer</p>
                            <p className={`text-xl font-bold ${restToPay > 0 ? "text-orange-500" : restToPay < 0 ? "text-red-500" : ""}`}>{restToPay.toFixed(2)} €</p>
                        </div>
                    </div>
                    <Button size="lg" className="bg-primary w-full md:w-auto" onClick={handleCheckout} disabled={!canCheckout}>
                        {isSubmitting ? "Création en cours..." : "Valider la commande"}
                    </Button>
                </div>
            )}
        </div>
    );
}