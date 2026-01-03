"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MessageCircle, X } from "lucide-react";

// ===============================
// TYPES
// ===============================
type Producto = {
  id: number;
  nombre: string;
  categoria: string;
  precio: number | string | null;
  stock: number;
  foto_url: string;
};

const WHATSAPP_NUMBER = "543804315721";

// ===============================
// COMPONENT
// ===============================
export default function TiendaPage() {
  const router = useRouter();

  const [categoria, setCategoria] = useState<string | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [imagenAbierta, setImagenAbierta] = useState<string | null>(null);
  const [nombreImagen, setNombreImagen] = useState<string>("");

  // ===============================
  // LEER QUERY MANUAL (CLIENT ONLY)
  // ===============================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("categoria");
    setCategoria(cat);
  }, []);

  useEffect(() => {
    fetchTienda();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria]);

  const fetchTienda = async () => {
    setLoading(true);

    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) {
      console.error("Falta NEXT_PUBLIC_API_URL");
      setLoading(false);
      return;
    }

    const url = categoria
      ? `${base}/tienda?categoria=${encodeURIComponent(categoria)}`
      : `${base}/tienda`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setProductos(data.productos || []);
      setCategorias(data.categorias || []);
    } catch (e) {
      console.error("Error cargando tienda", e);
    } finally {
      setLoading(false);
    }
  };

  const cambiarCategoria = (cat: string | null) => {
    if (!cat) {
      router.push("/tienda");
      setCategoria(null);
    } else {
      router.push(`/tienda?categoria=${encodeURIComponent(cat)}`);
      setCategoria(cat);
    }
  };

  const formatPrecio = (precio: unknown) => {
    const n = Number(precio);
    if (isNaN(n)) return "$0";
    return `$${n.toLocaleString("es-AR")}`;
  };

  const contactarWhatsApp = (producto: Producto) => {
    const mensaje = `Hola, estoy interesado en este producto: ${producto.nombre}`;
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-[#1C1C1B] text-[#E2E2DE] p-6 space-y-6">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Tienda</h1>

        <select
          value={categoria ?? ""}
          onChange={(e) => cambiarCategoria(e.target.value || null)}
          className="bg-[#2A2A29] border border-[#979086] rounded-lg px-4 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Cargando productos…</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((p) => (
          <div key={p.id} className="bg-[#2A2A29] rounded-xl overflow-hidden">
            <div
              className="relative aspect-square bg-black cursor-pointer"
              onClick={() => {
                setImagenAbierta(p.foto_url || "/placeholder.png");
                setNombreImagen(p.nombre);
              }}
            >
              <Image
                src={p.foto_url || "/placeholder.png"}
                alt={p.nombre}
                fill
                className="object-contain p-4"
              />
            </div>

            <div className="p-4 space-y-2">
              <h2 className="text-sm font-medium">{p.nombre}</h2>

              <div className="flex justify-between text-sm">
                <span>{formatPrecio(p.precio)}</span>
                <span>Stock: {p.stock ?? 0}</span>
              </div>

              <button
                onClick={() => contactarWhatsApp(p)}
                className="w-full bg-[#6A5D52] text-white py-2 rounded-lg"
              >
                <MessageCircle className="inline w-4 h-4 mr-2" />
                Consultar
              </button>
            </div>
          </div>
        ))}
      </div>

      {imagenAbierta && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center"
          onClick={() => setImagenAbierta(null)}
        >
          <div className="relative w-full max-w-xl">
            <button
              className="absolute -top-10 right-0 text-white"
              onClick={() => setImagenAbierta(null)}
            >
              <X size={28} />
            </button>
            <Image
              src={imagenAbierta}
              alt={nombreImagen}
              width={800}
              height={800}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}