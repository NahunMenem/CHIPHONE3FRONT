"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const API = process.env.NEXT_PUBLIC_API_URL!;

type Egreso = {
  id: number;
  fecha: string;
  monto: number;
  descripcion: string;
  tipo_pago: string;
};

export default function EgresosPage() {
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [fecha, setFecha] = useState("");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoPago, setTipoPago] = useState("efectivo");
  const [loading, setLoading] = useState(false);

  // =====================
  // FETCH
  // =====================
  const cargarEgresos = async () => {
    try {
      const res = await fetch(`${API}/egresos`, { credentials: "include" });
      if (!res.ok) throw new Error();
      setEgresos(await res.json());
    } catch {
      toast.error("Error al cargar egresos");
    }
  };

  useEffect(() => {
    cargarEgresos();
  }, []);

  // =====================
  // ACCIONES
  // =====================
  const registrarEgreso = async () => {
    if (!fecha || !monto || !descripcion) {
      toast.error("Completá todos los campos");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/egresos`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha,
          monto: Number(monto),
          descripcion,
          tipo_pago: tipoPago,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Egreso registrado");
      setFecha("");
      setMonto("");
      setDescripcion("");
      setTipoPago("efectivo");
      cargarEgresos();
    } catch {
      toast.error("No se pudo registrar el egreso");
    } finally {
      setLoading(false);
    }
  };

  const eliminarEgreso = async (id: number) => {
    if (!confirm("¿Eliminar este egreso?")) return;

    try {
      const res = await fetch(`${API}/egresos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      toast.success("Egreso eliminado");
      cargarEgresos();
    } catch {
      toast.error("No se pudo eliminar el egreso");
    }
  };

  // =====================
  // UI
  // =====================
  return (
    <div className="min-h-screen p-6 bg-[#1C1C1B] text-white space-y-6">
      <h1 className="text-2xl font-bold">Egresos</h1>

      {/* FORMULARIO */}
      <Card className="bg-[#2A2A29] border-[#3A3A38]">
        <CardHeader>
          <CardTitle className="text-white">Registrar egreso</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="bg-[#1F1F1E] border-[#3A3A38] text-white"
          />

          <Input
            type="number"
            placeholder="Monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="bg-[#1F1F1E] border-[#3A3A38] text-white"
          />

          <Input
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="bg-[#1F1F1E] border-[#3A3A38] text-white"
          />

          <Select value={tipoPago} onValueChange={setTipoPago}>
            <SelectTrigger className="bg-[#1F1F1E] border-[#3A3A38] text-white">
              <SelectValue placeholder="Método de pago" />
            </SelectTrigger>
            <SelectContent className="bg-[#2A2A29] border-[#3A3A38] text-white">
              <SelectItem value="efectivo">Efectivo</SelectItem>
              <SelectItem value="transferencia">Transferencia</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={registrarEgreso}
            disabled={loading}
            className="md:col-span-4 bg-[#6A5D52] hover:bg-[#5B5047] text-white"
          >
            Registrar egreso
          </Button>
        </CardContent>
      </Card>

      {/* LISTADO */}
      <Card className="bg-[#111111] border-[#3A3A38]">
        <CardHeader>
          <CardTitle className="text-white">Listado de egresos</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-white text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#3A3A38]">
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Monto</th>
                <th className="p-3 text-left">Descripción</th>
                <th className="p-3 text-left">Tipo de pago</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {egresos.map((e) => (
                <tr key={e.id} className="border-b border-[#2A2A29]">
                  <td className="p-3">
                    {new Date(e.fecha).toLocaleDateString("es-AR")}
                  </td>
                  <td className="p-3 font-semibold">
                    ${e.monto.toLocaleString("es-AR")}
                  </td>
                  <td className="p-3">{e.descripcion}</td>
                  <td className="p-3">{e.tipo_pago}</td>
                  <td className="p-3">
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => eliminarEgreso(e.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
