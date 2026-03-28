import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, CheckCircle, Package, Users } from "lucide-react";

export default function Home() {
  return (
      <main className="min-h-screen flex flex-col items-center bg-background">
        <div className="flex-1 w-full flex flex-col items-center">

          {/* === BARRE DE NAVIGATION === */}
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 sticky top-0 bg-background/80 backdrop-blur-md z-50">
            <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5 text-sm">
              <div className="flex gap-2 items-center font-bold text-xl tracking-tighter">
                <span className="text-primary">Janitor</span>2000
              </div>
              <div className="flex items-center gap-4">
                <Suspense>
                  <AuthButton />
                </Suspense>
              </div>
            </div>
          </nav>

          <div className="flex-1 flex flex-col w-full">

            {/* === SECTION HERO (En-tête principal) === */}
            <section className="w-full py-24 lg:py-32 flex flex-col items-center justify-center text-center px-4">
              <div className="max-w-3xl space-y-8">
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight">
                  Gérez votre <span className="text-primary">conciergerie</span> avec excellence.
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  L&#39;outil tout-en-un pour les concierges modernes. Gérez vos clients, passez des commandes et suivez vos livraisons depuis une seule interface intuitive.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                  <Link href="/auth/sign-up">
                    <Button size="lg" className="w-full sm:w-auto gap-2 text-lg px-8">
                      Commencer gratuitement <ArrowRight size={18} />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                      Me connecter
                    </Button>
                  </Link>
                </div>
              </div>
            </section>

            {/* === SECTION FONCTIONNALITÉS === */}
            <section className="w-full py-20 bg-muted/30 border-y">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-16">Tout ce dont vous avez besoin</h2>

                <div className="grid md:grid-cols-3 gap-12">
                  {/* Feature 1 */}
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-primary/10 text-primary rounded-full">
                      <Users size={32} />
                    </div>
                    <h3 className="text-xl font-semibold">Gestion des clients</h3>
                    <p className="text-muted-foreground">
                      Gardez une trace de tous vos clients, leurs préférences et leur historique en un seul endroit.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-primary/10 text-primary rounded-full">
                      <Package size={32} />
                    </div>
                    <h3 className="text-xl font-semibold">Commandes fluides</h3>
                    <p className="text-muted-foreground">
                      Accédez à un catalogue complet et passez commande pour vos clients en quelques clics.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-primary/10 text-primary rounded-full">
                      <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-semibold">Suivi en temps réel</h3>
                    <p className="text-muted-foreground">
                      Suivez l&#39;état des expéditions, de la validation jusqu&#39;à la livraison finale.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* === PIED DE PAGE (Footer) === */}
          <footer className="w-full flex flex-col sm:flex-row items-center justify-between border-t max-w-6xl mx-auto p-6 text-sm text-muted-foreground gap-4">
            <p>© 2026 Janitor 2000. Tous droits réservés.</p>
            <div className="flex items-center gap-6">
              <ThemeSwitcher />
            </div>
          </footer>

        </div>
      </main>
  );
}