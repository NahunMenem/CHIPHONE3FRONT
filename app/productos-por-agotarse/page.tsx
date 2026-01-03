"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_URL!;

type Producto = {
  id: number;
  nombre: string;
  codigo_barras: string;
  stock: number;
  precio: number;
  precio_costo: number;
};

export default function ProductosPorAgotarsePage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const totalPages = Math.ceil(total / limit);

  const cargarProductos = async () => {
    try {
      const res = await fetch(
        `${API}/productos_por_agotarse?page=${page}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();

      setProductos(data.productos);
      setTotal(data.total);
    } catch {
      toast.error("Error al cargar productos por agotarse");
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [page]);

  return (
    <div className="min-h-screen p-6 bg-[#1C1C1B] text-white space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <AlertTriangle className="text-yellow-400" />
        Productos por agotarse
      </h1>

      <Card className="bg-[#111111] border-[#3A3A38]">
        <CardHeader>
          <CardTitle className="text-white">
            Stock crítico (≤ 30 unidades)
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          {productos.length === 0 ? (
            <p className="text-green-400 font-semibold">
              No hay productos con stock crítico 🎉
            </p>
          ) : (
            <table className="w-full text-white text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#3A3A38]">
                  <th className="p-3 text-left">Producto</th>
                  <th className="p-3 text-left">Código</th>
                  <th className="p-3 text-left">Stock</th>
                  <th className="p-3 text-left">Precio</th>
                  <th className="p-3 text-left">Costo</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-[#2A2A29] ${
                      p.stock === 0 ? "bg-red-950/30" : "bg-yellow-950/20"
                    }`}
                  >
                    <td className="p-3 font-semibold">{p.nombre}</td>
                    <td className="p-3">{p.codigo_barras || "-"}</td>
                    <td
                      className={`p-3 font-bold ${
                        p.stock === 0
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {p.stock}
                    </td>
                    <td className="p-3">
                      ${p.precio.toLocaleString("es-AR")}
                    </td>
                    <td className="p-3">
                      ${p.precio_costo.toLocaleString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="text-white border-[#3A3A38]"
          >
            <ChevronLeft size={18} />
          </Button>

          <span className="text-white">
            Página {page} de {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="text-white border-[#3A3A38]"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      )}
    </div>
  );
}
