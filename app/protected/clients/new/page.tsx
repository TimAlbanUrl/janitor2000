import { CustomerForm } from "@/components/customer-form";

export default function NouveauClientPage() {
    return (
        <div className="p-6">
            <CustomerForm /> {/* Sans initialData = Mode Création */}
        </div>
    );
}