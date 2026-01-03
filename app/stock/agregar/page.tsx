"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import ProductoModal, { ProductoForm } from "./ProductoModal";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API = process.env.NEXT_PUBLIC_API_URL!;

// =====================================================
// TYPES
// =====================================================
type Producto = ProductoForm & { id: number };

// =====================================================
// COMPONENT
// =====================================================
export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [productoEdit, setProductoEdit] = useState<Producto | null>(null);

  // 👇 ROLE
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  // =====================================================
  // FETCH
  // =====================================================
  const cargarProductos = async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (busqueda) params.append("busqueda", busqueda);

    const res = await fetch(`${API}/productos?${params.toString()}`);
    const data = await res.json();
    setProductos(data.items ?? []);
  };

  const cargarCategorias = async () => {
    const res = await fetch(`${API}/categorias`);
    setCategorias(await res.json());
  };

  useEffect(() => {
    const t = setTimeout(cargarProductos, 400);
    return () => clearTimeout(t);
  }, [busqueda, page]);

  useEffect(() => {
    cargarCategorias();
  }, []);

  // =====================================================
  // EXPORTAR EXCEL
  // =====================================================
  const exportarStockExcel = async () => {
    try {
      const res = await fetch(`${API}/exportar_stock`);
      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "stock.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Stock exportado a Excel");
    } catch {
      toast.error("Error al exportar stock");
    }
  };

  // =====================================================
  // CATEGORÍAS
  // =====================================================
  const agregarCategoria = async () => {
    if (!nuevaCategoria.trim()) return;

    const res = await fetch(`${API}/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nuevaCategoria }),
    });

    if (res.ok) {
      toast.success("Categoría agregada");
      setNuevaCategoria("");
      cargarCategorias();
    } else {
      toast.error("Error al agregar categoría");
    }
  };

  const eliminarCategoria = async (nombre: string) => {
    if (!confirm(`¿Eliminar categoría "${nombre}"?`)) return;

    const res = await fetch(`${API}/categorias/${nombre}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Categoría eliminada");
      cargarCategorias();
    } else {
      toast.error("No se pudo eliminar la categoría");
    }
  };

  // =====================================================
  // PRODUCTOS
  // =====================================================
  const eliminarProducto = async (id: number) => {
    if (!confirm("¿Eliminar producto?")) return;

    const res = await fetch(`${API}/productos/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Producto eliminado");
      cargarProductos();
    } else {
      toast.error("Error al eliminar producto");
    }
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="min-h-screen bg-[#1C1C1B] text-[#E2E2DE] space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight">
          Stock / Productos
        </h1>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-[#979086] text-[#E2E2DE] hover:bg-[#2A2A29]"
            onClick={exportarStockExcel}
          >
            Exportar Excel
          </Button>

          <Button
            className="bg-[#6A5D52] hover:bg-[#5A4F45] text-white"
            onClick={() => {
              setProductoEdit(null);
              setModalOpen(true);
            }}
          >
            Agregar producto
          </Button>
        </div>
      </div>

      {/* BUSCADOR */}
      <Card className="bg-[#E2E2DE] border-[#979086]">
        <CardContent className="p-4">
          <Input
            placeholder="Buscar por nombre, código o número…"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPage(1);
            }}
            className="bg-white text-[#1C1C1B] border-[#979086]"
          />
        </CardContent>
      </Card>

      {/* CATEGORÍAS */}
      <Card className="bg-[#E2E2DE] border-[#979086]">
        <CardHeader>
          <CardTitle className="text-sm text-[#1C1C1B]">
            Gestión de categorías
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nueva categoría"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              className="bg-white text-[#1C1C1B] border-[#979086]"
            />
            <Button
              className="bg-[#6A5D52] hover:bg-[#5A4F45] text-white"
              onClick={agregarCategoria}
            >
              Agregar
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categorias.map((c) => (
              <div
                key={c}
                className="flex items-center gap-2 rounded-full
                           bg-[#B7AC9B] px-3 py-1 text-xs text-[#1C1C1B]"
              >
                {c}
                <button
                  onClick={() => eliminarCategoria(c)}
                  className="opacity-60 hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TABLA */}
      <Card className="bg-[#E2E2DE] border-[#979086]">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#B7AC9B]">
                {[
                  "ID",
                  "Nombre",
                  "Código",
                  "Núm",
                  "Categoría",
                  "Color",
                  "Batería",
                  "Condición",
                  "Stock",
                  "Precio",
                  ...(role === "admin" ? ["Costo"] : []),
                  "Revendedor",
                  "Acciones",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="text-xs font-semibold uppercase text-[#1C1C1B]"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {productos.map((p) => (
                <TableRow
                  key={p.id}
                  className="hover:bg-[#EDEBE6] text-[#1C1C1B]"
                >
                  <TableCell>{p.id}</TableCell>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell>{p.codigo_barras}</TableCell>
                  <TableCell>{p.num}</TableCell>
                  <TableCell>{p.categoria}</TableCell>
                  <TableCell>{p.color}</TableCell>
                  <TableCell>{p.bateria}</TableCell>
                  <TableCell>{p.condicion}</TableCell>
                  <TableCell>{p.stock}</TableCell>

                  <TableCell className="font-semibold">
                    ${p.precio}
                  </TableCell>

                  {role === "admin" && (
                    <TableCell className="text-[#6A5D52]">
                      ${p.precio_costo}
                    </TableCell>
                  )}

                  <TableCell>${p.precio_revendedor}</TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#979086]"
                      onClick={() => {
                        setProductoEdit(p);
                        setModalOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => eliminarProducto(p.id)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PAGINACIÓN */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente
        </Button>
      </div>

      {/* MODAL */}
      <ProductoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={cargarProductos}
        categorias={categorias}
        producto={productoEdit}
      />
    </div>
  );
}
