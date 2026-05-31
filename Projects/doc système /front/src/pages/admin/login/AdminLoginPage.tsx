import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Droplets,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { useAdminAuth } from "@/features/admin-auth/AdminAuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    "/admin";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login({
        email: email.trim(),
        password,
      });

      navigate(redirectTo, { replace: true });
    } catch (error) {
      const rawMessage =
        typeof error === "object" &&
        error &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Connexion impossible. Vérifiez vos identifiants.";

      const message =
        rawMessage === "Failed to fetch" ||
        rawMessage === "An unexpected error occurred" ||
        rawMessage === "Unexpected error" ||
        rawMessage === "Une erreur est survenue lors de la requête."
          ? "Connexion impossible. Vérifiez que le service admin est disponible."
          : rawMessage;

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#faf8f7] px-6 py-12">
      <Card className="w-full max-w-xs rounded-3xl border border-red-100/70 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:max-w-sm md:max-w-md">
        <CardContent className="px-6 py-8 sm:px-8 md:px-10">
          <div className="flex flex-col items-center text-center">
            <DropMark />
            <h1 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.05em] text-slate-950">
              Espace administrateur
            </h1>
            <p className="mt-2 text-pretty text-sm leading-6 text-slate-500">
              Connectez-vous pour accéder au back-office du centre.
            </p>
          </div>

          <form className="mt-7 flex flex-col gap-5 text-start" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label htmlFor="admin-email">Email</Label>
                <div className="relative mt-2.5">
                  <Input
                    id="admin-email"
                    className="peer ps-9"
                    placeholder="admin@cts.local"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                    <Mail size={16} aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="admin-password">Mot de passe</Label>
                <div className="relative mt-2.5">
                  <Input
                    id="admin-password"
                    className="ps-9 pe-9"
                    placeholder="Entrez votre mot de passe"
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                    <LockKeyhole size={16} aria-hidden="true" />
                  </div>
                  <button
                    className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={() => setIsPasswordVisible((prevState) => !prevState)}
                    aria-label={
                      isPasswordVisible
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    aria-pressed={isPasswordVisible}
                    aria-controls="admin-password"
                  >
                    {isPasswordVisible ? (
                      <EyeOff size={16} aria-hidden="true" />
                    ) : (
                      <Eye size={16} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="remember-me"
                  checked={rememberSession}
                  onCheckedChange={(checked) => setRememberSession(checked === true)}
                />
                <Label htmlFor="remember-me">Se souvenir de moi pendant 30 jours</Label>
              </div>
            </div>

            {errorMessage ? (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            ) : null}

            <Button type="submit" disabled={isSubmitting || !email.trim() || !password}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function DropMark() {
  return (
    <div className="flex size-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-brand-red">
      <Droplets className="size-6" strokeWidth={1.9} />
    </div>
  );
}
