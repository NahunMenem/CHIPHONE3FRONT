"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageCircle, X } from "lucide-react";

type Producto = {
  id: number;
  nombre: string;
  categoria: string;
  precio: number | string | null;
  stock: number;
  foto_url: string;
};

const WHATSAPP_NUMBER = "543804315721";

export default function TiendaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoria = searchParams.get("categoria");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Imagen ampliada
  const [imagenAbierta, setImagenAbierta] = useState<string | null>(null);
  const [nombreImagen, setNombreImagen] = useState<string>("");

  useEffect(() => {
    fetchTienda();
  }, [categoria]);

  const fetchTienda = async () => {
    setLoading(true);

    const url = categoria
      ? `${process.env.NEXT_PUBLIC_API_URL}/tienda?categoria=${encodeURIComponent(
          categoria
        )}`
      : `${process.env.NEXT_PUBLIC_API_URL}/tienda`;

    const res = await fetch(url);
    const data = await res.json();

    setProductos(data.productos || []);
    setCategorias(data.categorias || []);
    setLoading(false);
  };

  const cambiarCategoria = (cat: string | null) => {
    if (!cat) router.push("/tienda");
    else router.push(`/tienda?categoria=${encodeURIComponent(cat)}`);
  };

  // ===============================
  // 💰 FORMATEADOR DE PRECIO
  // ===============================
  const formatPrecio = (precio: unknown) => {
    const n = Number(precio);
    if (isNaN(n)) return "$0";
    return `$${n.toLocaleString("es-AR")}`;
  };

  const contactarWhatsApp = (producto: Producto) => {
    const mensaje = `Hola, estoy interesado en este producto: ${producto.nombre}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#1C1C1B] text-[#E2E2DE] space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tienda
        </h1>

        {/* Filtro categoría */}
        <select
          value={categoria ?? ""}
          onChange={(e) => cambiarCategoria(e.target.value || null)}
          className="
            bg-[#2A2A29]
            border border-[#979086]
            rounded-lg px-4 py-2 text-sm
            text-[#E2E2DE]
          "
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-72 bg-[#2A2A29] rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* SIN PRODUCTOS */}
      {!loading && productos.length === 0 && (
        <div className="text-center text-[#979086]">
          No hay productos disponibles
        </div>
      )}

      {/* PRODUCTOS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {productos.map((p) => (
          <div
            key={p.id}
            className="
              bg-[#2A2A29]
              rounded-xl
              border border-[#3A3A38]
              overflow-hidden
              hover:border-[#6A5D52]
              transition
            "
          >
            {/* Imagen (click para ampliar) */}
            <div
              className="relative aspect-square bg-black cursor-zoom-in"
              onClick={() => {
                setImagenAbierta(p.foto_url || "/placeholder.png");
                setNombreImagen(p.nombre);
              }}
            >
              <Image
                src={p.foto_url || "/placeholder.png"}
                alt={p.nombre}
                fill
                className="object-contain p-4 hover:scale-105 transition"
              />
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
              <h2 className="font-medium text-sm line-clamp-2">
                {p.nombre}
              </h2>

              <div className="flex justify-between items-center">
                <span className="text-[#B7AC9B] font-semibold">
                  {formatPrecio(p.precio)}
                </span>

                <span className="text-xs text-[#979086]">
                  Stock: {p.stock ?? 0}
                </span>
              </div>

              <button
                onClick={() => contactarWhatsApp(p)}
                className="
                  w-full mt-2 flex items-center justify-center gap-2
                  bg-[#6A5D52] hover:bg-[#5A4F45]
                  text-white text-sm py-2 rounded-lg
                  transition
                "
              >
                <MessageCircle className="w-4 h-4" />
                Consultar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL IMAGEN GRANDE */}
      {imagenAbierta && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setImagenAbierta(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setImagenAbierta(null)}
              className="
                absolute -top-10 right-0
                text-white hover:text-[#B7AC9B]
              "
            >
              <X size={28} />
            </button>

            <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden">
              <Image
                src={imagenAbierta}
                alt={nombreImagen}
                fill
                className="object-contain"
              />
            </div>

            <p className="mt-3 text-center text-sm text-[#B7AC9B]">
              {nombreImagen}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
