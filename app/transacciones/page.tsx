"use client";

import { useState } from "react";
import { Trash2, FileDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const API = process.env.NEXT_PUBLIC_API_URL!;

type Venta = {
  id: number;
  producto: string;
  cantidad: number;
  num?: string | null;
  precio_unitario: number;
  tipo_precio: string;
  total: number | null;
  fecha: string;
  tipo_pago: string;
  dni_cliente: string;
};

export default function TransaccionesPage() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [manuales, setManuales] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // 🔍 BUSCAR (FIX TIMEZONE)
  // =====================================================
  const buscar = async () => {
    if (!desde || !hasta) {
      toast.error("Seleccioná fecha desde y hasta");
      return;
    }

    const desdeISO = `${desde}T00:00:00`;
    const hastaISO = `${hasta}T23:59:59`;

    setLoading(true);
    try {
      const res = await fetch(
        `${API}/transacciones?desde=${encodeURIComponent(
          desdeISO
        )}&hasta=${encodeURIComponent(hastaISO)}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Error backend:", text);
        throw new Error();
      }

      const data = await res.json();
      setVentas(data.ventas || []);
      setManuales(data.manuales || []);
    } catch {
      toast.error("Error al cargar transacciones");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // 📤 EXPORTAR EXCEL (FIX TIMEZONE)
  // =====================================================
  const exportarExcel = () => {
    if (!desde || !hasta) {
      toast.error("Seleccioná fechas");
      return;
    }

    const desdeISO = `${desde}T00:00:00`;
    const hastaISO = `${hasta}T23:59:59`;

    window.open(
      `${API}/transacciones/exportar?desde=${encodeURIComponent(
        desdeISO
      )}&hasta=${encodeURIComponent(hastaISO)}`,
      "_blank"
    );
  };

  // =====================================================
  // ❌ ANULAR VENTA
  // =====================================================
  const anularVenta = async (id: number) => {
    if (!confirm("¿Anular esta venta?")) return;
    try {
      const res = await fetch(`${API}/transacciones/${id}/anular`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast.success("Venta anulada");
      buscar();
    } catch {
      toast.error("No se pudo anular la venta");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[#1C1C1B] text-white space-y-6">
      <h1 className="text-2xl font-bold">Transacciones</h1>

      {/* FILTROS */}
      <Card className="bg-[#2A2A29] border-[#3A3A38]">
        <CardContent className="p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-sm">Desde</label>
            <Input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="bg-[#1F1F1E] border-[#3A3A38] text-white"
            />
          </div>

          <div>
            <label className="text-sm">Hasta</label>
            <Input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="bg-[#1F1F1E] border-[#3A3A38] text-white"
            />
          </div>

          <Button onClick={buscar} disabled={loading} className="bg-[#6A5D52]">
            Buscar
          </Button>

          <Button
            variant="outline"
            onClick={exportarExcel}
            className="border-[#6A5D52] text-black hover:bg-[#6A5D52]"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </CardContent>
      </Card>

      {/* VENTAS */}
      <Card className="bg-[#111111] border-[#3A3A38]">
        <CardHeader>
          <CardTitle>Ventas</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#3A3A38]">
                {[
                  "Producto",
                  "Cantidad",
                  "Núm",
                  "Precio Unit.",
                  "Tipo Precio",
                  "Total",
                  "Fecha",
                  "Pago",
                  "DNI",
                  "Acciones",
                ].map((h) => (
                  <th key={h} className="p-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-[#2A2A29] hover:bg-[#1F1F1E]"
                >
                  <td className="p-3">{v.producto}</td>
                  <td className="p-3">{v.cantidad}</td>
                  <td className="p-3">{v.num || "-"}</td>
                  <td className="p-3">
                    ${v.precio_unitario.toLocaleString("es-AR")}
                  </td>
                  <td className="p-3">{v.tipo_precio}</td>
                  <td className="p-3 font-semibold">
                    ${(v.total || 0).toLocaleString("es-AR")}
                  </td>
                  <td className="p-3">
                    {new Date(v.fecha).toLocaleString("es-AR")}
                  </td>
                  <td className="p-3">{v.tipo_pago}</td>
                  <td className="p-3">{v.dni_cliente}</td>
                  <td className="p-3">
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => anularVenta(v.id)}
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

      <Separator className="bg-[#3A3A38]" />
    </div>
  );
}
