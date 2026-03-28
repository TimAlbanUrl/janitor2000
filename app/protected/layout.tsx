import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";
import { Package, Users, LayoutDashboard } from "lucide-react";

export default function ProtectedLayout({
                                          children,
                                        }: {
  children: React.ReactNode;
}) {
  return (
      <main className="min-h-screen flex flex-col bg-background">
        {/* --- BARRE DE NAVIGATION --- */}
        <nav className="w-full flex justify-center border-b h-16 sticky top-0 bg-background/80 backdrop-blur-md z-50">
          <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5 text-sm">

            {/* Logo et Liens du menu */}
            <div className="flex gap-8 items-center font-semibold">
              <Link href="/protected" className="font-bold text-xl tracking-tighter flex gap-2 items-center">
                <span className="text-primary">Janitor</span>2000
              </Link>

              <div className="hidden md:flex gap-6 text-muted-foreground">
                <Link href="/protected" className="hover:text-foreground flex items-center gap-2 transition-colors">
                  <LayoutDashboard size={16} /> Tableau de bord
                </Link>
                <Link href="/protected/clients" className="hover:text-foreground flex items-center gap-2 transition-colors">
                  <Users size={16} /> Mes Clients
                </Link>
                <Link href="/protected/shop" className="hover:text-foreground flex items-center gap-2 transition-colors">
                  <Package size={16} /> Boutique
                </Link>
              </div>
            </div>

            {/* Profil et Thème */}
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <Suspense>
                <AuthButton />
              </Suspense>
            </div>
          </div>
        </nav>

        <div className="flex-1 w-full flex flex-col items-center">
          <div className="w-full max-w-6xl p-5 flex-1 flex flex-col">
            {children}
          </div>
        </div>
      </main>
  );
}