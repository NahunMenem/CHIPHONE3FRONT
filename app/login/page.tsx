"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(username, password);

      // Guardar token
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1C1B] text-white">
      <Card className="w-full max-w-sm bg-[#111111] border-[#3A3A38]">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-white">
            Iniciar sesión
          </CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-white opacity-80">
                Usuario
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 bg-[#1F1F1E] border-[#3A3A38] text-white focus:border-[#6A5D52]"
              />
            </div>

            <div>
              <label className="text-sm text-white opacity-80">
                Contraseña
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 bg-[#1F1F1E] border-[#3A3A38] text-white focus:border-[#6A5D52]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6A5D52] hover:bg-[#5B4F45] text-white"
            >
              {loading ? "Ingresando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
