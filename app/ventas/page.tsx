"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle, ShoppingCart } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const API = process.env.NEXT_PUBLIC_API_URL!;

// =====================
// TYPES
// =====================
type Producto = {
  id: number;
  nombre: string;
  precio: number;
  precio_revendedor: number;
  stock: number;
};

type CarritoItem = {
  id: number | null;
  nombre: string;
  precio: number;
  cantidad: number;
  tipo_precio: string;
};

export default function VentasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [total, setTotal] = useState(0);

  const [busqueda, setBusqueda] = useState("");
  const [tipoPrecio, setTipoPrecio] =
    useState<"venta" | "revendedor">("venta");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [dniCliente, setDniCliente] = useState("");

  // 🔹 VENTA MANUAL
  const [ventaManual, setVentaManual] = useState({
    nombre: "",
    precio: "",
    cantidad: "1",
  });

  // =====================
  // FETCH
  // =====================
  const cargarProductos = async () => {
    const params = new URLSearchParams();
    if (busqueda) params.append("busqueda", busqueda);

    const res = await fetch(`${API}/productos?${params}`, {
      credentials: "include",
    });
    const data = await res.json();
    setProductos(data.items ?? []);
  };

  const cargarCarrito = async () => {
    const res = await fetch(`${API}/carrito`, {
      credentials: "include",
    });
    const data = await res.json();
    setCarrito(data.items);
    setTotal(data.total);
  };

  useEffect(() => {
    cargarProductos();
  }, [busqueda]);

  useEffect(() => {
    cargarCarrito();
  }, []);

  // =====================
  // ACCIONES
  // =====================
  const agregarProducto = async (p: Producto) => {
    const precio =
      tipoPrecio === "venta" ? p.precio : p.precio_revendedor;

    const res = await fetch(`${API}/carrito/agregar`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        producto_id: p.id,
        cantidad: 1,
        precio,
        tipo_precio: tipoPrecio,
      }),
    });

    if (!res.ok) {
      toast.error("Stock insuficiente");
      return;
    }

    cargarCarrito();
  };

  const agregarVentaManual = async () => {
    if (!ventaManual.nombre || !ventaManual.precio) {
      toast.error("Completar nombre y precio");
      return;
    }

    const res = await fetch(`${API}/carrito/agregar-manual`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: ventaManual.nombre,
        precio: ventaManual.precio,
        cantidad: ventaManual.cantidad || 1,
      }),
    });

    if (!res.ok) {
      toast.error("Error al agregar venta manual");
      return;
    }

    toast.success("Venta manual agregada");
    setVentaManual({ nombre: "", precio: "", cantidad: "1" });
    cargarCarrito();
  };

  const registrarVenta = async () => {
    if (!carrito.length) {
      toast.error("El carrito está vacío");
      return;
    }

    if (!dniCliente) {
      toast.error("Ingresar DNI del cliente");
      return;
    }

    const res = await fetch(`${API}/ventas/registrar`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni_cliente: dniCliente,
        metodo_pago: metodoPago,
      }),
    });

    if (!res.ok) {
      toast.error("Error al registrar la venta");
      return;
    }

    toast.success("Venta registrada correctamente");
    setDniCliente("");
    cargarCarrito();
    cargarProductos();
  };

  const vaciarCarrito = async () => {
    await fetch(`${API}/carrito/vaciar`, {
      method: "POST",
      credentials: "include",
    });
    cargarCarrito();
  };

  // =====================
  // UI
  // =====================
  return (
    <div className="min-h-screen p-6 bg-[#1C1C1B] text-[#E2E2DE] [&_*]:text-[#E2E2DE] space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <ShoppingCart />
        <h1 className="text-2xl font-bold">Registrar venta</h1>
      </div>

      {/* BUSCADOR */}
      <Input
        placeholder="Buscar producto o código de barras"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="bg-[#2A2A29] border-[#3A3A38] placeholder:text-[#979086]"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRODUCTOS */}
        <Card className="bg-[#2A2A29] border-[#3A3A38]">
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[65vh] overflow-y-auto">
            {productos.map((p) => {
              const precio =
                tipoPrecio === "venta"
                  ? p.precio
                  : p.precio_revendedor;

              return (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3 rounded border border-[#3A3A38] hover:bg-[#1F1F1E]"
                >
                  <div>
                    <p className="font-medium">{p.nombre}</p>
                    <div className="flex gap-2 text-xs">
                      <span>${precio.toLocaleString("es-AR")}</span>
                      <Badge className="bg-[#6A5D52]">
                        Stock {p.stock}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    size="icon"
                    className="bg-[#6A5D52] hover:bg-[#5B5047]"
                    disabled={p.stock <= 0}
                    onClick={() => agregarProducto(p)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* CARRITO */}
        <Card className="lg:col-span-2 bg-[#111111] border-[#3A3A38]">
          <CardHeader>
            <CardTitle>Carrito</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {carrito.map((i, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  {i.nombre} × {i.cantidad}
                </span>
                <span>
                  ${(i.precio * i.cantidad).toLocaleString("es-AR")}
                </span>
              </div>
            ))}

            <Separator className="bg-[#3A3A38]" />

            {/* VENTA MANUAL */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Venta manual</p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                  placeholder="Descripción"
                  value={ventaManual.nombre}
                  onChange={(e) =>
                    setVentaManual({
                      ...ventaManual,
                      nombre: e.target.value,
                    })
                  }
                  className="bg-[#2A2A29] border-[#3A3A38] placeholder:text-[#979086]"
                />

                <Input
                  type="number"
                  placeholder="Precio"
                  value={ventaManual.precio}
                  onChange={(e) =>
                    setVentaManual({
                      ...ventaManual,
                      precio: e.target.value,
                    })
                  }
                  className="bg-[#2A2A29] border-[#3A3A38] placeholder:text-[#979086]"
                />

                <Input
                  type="number"
                  min="1"
                  placeholder="Cant."
                  value={ventaManual.cantidad}
                  onChange={(e) =>
                    setVentaManual({
                      ...ventaManual,
                      cantidad: e.target.value,
                    })
                  }
                  className="bg-[#2A2A29] border-[#3A3A38] placeholder:text-[#979086]"
                />

                <Button
                  className="bg-[#6A5D52] hover:bg-[#5B5047]"
                  onClick={agregarVentaManual}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </div>

            <Separator className="bg-[#3A3A38]" />

            {/* CONFIGURACIÓN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={tipoPrecio}
                onValueChange={(v) => setTipoPrecio(v as any)}
              >
                <SelectTrigger className="bg-[#2A2A29] border-[#3A3A38]">
                  <SelectValue placeholder="Tipo de precio" />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2A29] border-[#3A3A38]">
                  <SelectItem value="venta">Precio venta</SelectItem>
                  <SelectItem value="revendedor">
                    Precio revendedor
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={metodoPago} onValueChange={setMetodoPago}>
                <SelectTrigger className="bg-[#2A2A29] border-[#3A3A38]">
                  <SelectValue placeholder="Método de pago" />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2A29] border-[#3A3A38]">
                  {["efectivo", "debito", "credito", "transferencia"].map(
                    (m) => (
                      <SelectItem key={m} value={m}>
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              <Input
                placeholder="DNI cliente"
                value={dniCliente}
                onChange={(e) => setDniCliente(e.target.value)}
                className="bg-[#2A2A29] border-[#3A3A38] placeholder:text-[#979086]"
              />
            </div>

            {/* TOTAL */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-3xl font-bold">
                ${total.toLocaleString("es-AR")}
              </span>
            </div>

            {/* ACCIONES */}
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 bg-[#6A5D52] hover:bg-[#5B5047]"
                size="lg"
                onClick={registrarVenta}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Confirmar venta
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={vaciarCarrito}
              >
                <Trash2 />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
