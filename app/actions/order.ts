"use server";

import { createClient } from "@/lib/supabase/server";
import { generateAndSaveInvoice } from "@/lib/invoice";

type OrderItem = { itemId: number; quantity: number; price: number; };
type PaymentInput = { methodId: string; amount: number; };

export async function submitOrder(
    janitorId: number,
    customerId: number,
    addressId: number,
    phone: string,
    items: OrderItem[],
    payments: PaymentInput[]
) {
    const supabase = await createClient();

    if (!items || items.length === 0) throw new Error("Le panier est vide.");

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

    const { data: customer } = await supabase
        .from("customer")
        .select("name, mail")
        .eq("id", customerId)
        .single();

    if (!customer) throw new Error("Client introuvable.");

    const { data: addressData } = await supabase
        .from("address")
        .select("street, number, post_code, city, country(label)")
        .eq("id", addressId)
        .single();

    let fullAddress = "Adresse non renseignée";
    if (addressData) {
        const countryLabel = (addressData.country as any)?.label || "";
        fullAddress = `${addressData.number || ''} ${addressData.street || ''}, ${addressData.post_code || ''} ${addressData.city || ''} ${countryLabel}`.trim();
    }

    const itemIds = items.map(i => i.itemId);
    const { data: dbItems } = await supabase
        .from("item")
        .select("id, label")
        .in("id", itemIds);

    const enrichedItems = items.map(item => {
        const dbItem = dbItems?.find(i => i.id === item.itemId);
        return {
            label: dbItem?.label || `Article #${item.itemId}`,
            quantity: item.quantity,
            price: item.price
        };
    });

    const { data: order, error: orderError } = await supabase
        .from("Order")
        .insert([{ customer: customerId, janitor: janitorId, phone: phone, date: new Date().toISOString(), status: 1 }])
        .select()
        .single();

    if (orderError) throw new Error(orderError.message);

    const { data: batch, error: batchError } = await supabase
        .from("batch")
        .insert([{ order: order.id, address: addressId }])
        .select()
        .single();

    if (batchError) throw new Error(batchError.message);

    const hasItemInserts = items.map(item => ({
        batch: batch.id,
        item: item.itemId,
        quantity: item.quantity,
        price: item.price,
        status: 1
    }));

    const { error: hasItemError } = await supabase.from("hasitem").insert(hasItemInserts);
    if (hasItemError) throw new Error(hasItemError.message);

    const { data: invoice, error: invoiceError } = await supabase
        .from("invoice")
        .insert([{ order: order.id, amount: totalAmount }])
        .select()
        .single();

    if (invoiceError) throw new Error(invoiceError.message);

    if (payments && payments.length > 0) {
        for (const p of payments) {
            const { data: payment } = await supabase
                .from("payment")
                .insert([{ method: parseInt(p.methodId), amount: p.amount, date: new Date().toISOString() }])
                .select()
                .single();

            if (payment) {
                await supabase.from("haspayment").insert([{ invoice: invoice.id, payment: payment.id }]);
            }
        }
    }

    try {
        await generateAndSaveInvoice({
            invoiceId: invoice.id,
            customerName: customer.name,
            customerEmail: customer.mail || "Non renseigné",
            phoneNumber: phone,
            deliveryAddress: fullAddress,
            date: new Date().toLocaleDateString("fr-FR"),
            items: enrichedItems,
            totalAmount: totalAmount,
            totalPaid: totalPaid
        });
    } catch (e) {
        console.error(e);
    }

    return { success: true, orderId: order.id };
}