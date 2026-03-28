import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

type InvoiceData = {
    invoiceId: number;
    customerName: string;
    customerEmail: string;
    date: string;
    items: { label: string; quantity: number; price: number }[];
    totalAmount: number;
    totalPaid: number;
};

export async function generateAndSaveInvoice(data: InvoiceData) {
    return new Promise((resolve, reject) => {
        try {
            const invoicesDir = path.join(process.cwd(), "invoices");

            if (!fs.existsSync(invoicesDir)) {
                fs.mkdirSync(invoicesDir, { recursive: true });
            }

            const fileName = `Facture_INV-${data.invoiceId}_${data.customerName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
            const filePath = path.join(invoicesDir, fileName);

            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            doc.fontSize(24).text("FACTURE", { align: "center" });
            doc.moveDown();

            // Infos générales
            doc.fontSize(12);
            doc.text(`Facture N° : INV-${data.invoiceId}`);
            doc.text(`Date : ${data.date}`);
            doc.moveDown();

            doc.text(`Client : ${data.customerName}`);
            doc.text(`Email : ${data.customerEmail}`);
            doc.moveDown(2);

            doc.fontSize(14).text("Détail de la commande :", { underline: true });
            doc.moveDown();

            doc.fontSize(12);
            data.items.forEach((item) => {
                const lineTotal = (item.price * item.quantity).toFixed(2);
                doc.text(`${item.quantity}x ${item.label} - ${item.price.toFixed(2)} €/u`);
                doc.text(`Sous-total : ${lineTotal} €`, { align: "right" });
                doc.moveDown(0.5);
            });

            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Ligne de séparation
            doc.moveDown();

            doc.fontSize(14);
            doc.text(`Total de la commande : ${data.totalAmount.toFixed(2)} €`, { align: "right" });

            if (data.totalPaid > 0) {
                doc.fontSize(12).fillColor("green");
                doc.text(`Déjà réglé : ${data.totalPaid.toFixed(2)} €`, { align: "right" });
                doc.fillColor("black"); // Remettre en noir

                const rest = data.totalAmount - data.totalPaid;
                doc.fontSize(14);
                doc.text(`Reste à payer : ${rest.toFixed(2)} €`, { align: "right" });
            }

            doc.moveDown(3);
            doc.fontSize(10).text("Merci de votre confiance. Pour toute question, contactez-nous.", { align: "center" });

            doc.end();

            stream.on("finish", () => {
                resolve(filePath);
            });

            stream.on("error", (error) => {
                console.error("Erreur d'écriture du fichier :", error);
                reject(error);
            });

        } catch (error) {
            console.error("Erreur générale lors de la création du PDF :", error);
            reject(error);
        }
    });
}