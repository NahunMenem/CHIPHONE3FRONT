"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL!;

// =======================
// TYPES
// =======================
type Producto = {
  nombre: string;
  precio: number;
  unidades: number;     // ✅ CORRECTO
  porcentaje: number;
};

type Response = {
  total_ventas: number;
  productos: Producto[];
};

// =======================
// COMPONENT
// =======================
export default function ProductosMasVendidosPage() {
  const [data, setData] = useState<Response | null>(null);

  const cargarDatos = async () => {
    const res = await fetch(`${API}/productos_mas_vendidos`, {
      credentials: "include",
    });
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  if (!data) return null;

  // =======================
  // DATA PARA GRÁFICO
  // =======================
  const chartData = data.productos.map((p) => ({
    nombre: p.nombre,
    unidades: p.unidades,
  }));

  return (
    <div className="min-h-screen p-6 bg-[#1C1C1B] text-white space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Trophy className="text-yellow-400" />
        Productos más vendidos – Top 15
      </h1>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#111111] border-[#3A3A38]">
          <CardHeader>
            <CardTitle className="text-sm text-white opacity-80">
              Total unidades vendidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">
              {data.total_ventas.toLocaleString("es-AR")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#3A3A38]">
          <CardHeader>
            <CardTitle className="text-sm text-white opacity-80">
              Producto líder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white opacity-80">
              {data.productos[0]?.nombre}
            </p>
            <p className="text-sm text-white opacity-80">
              {data.productos[0]?.unidades} unidades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICO */}
      <Card className="bg-[#111111] border-[#3A3A38]">
        <CardHeader>
          <CardTitle className="text-white">
            Ranking por unidades vendidas
          </CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" stroke="#ffffff" />
              <YAxis
                type="category"
                dataKey="nombre"
                width={180}
                stroke="#ffffff"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111111",
                  border: "1px solid #333333",
                  color: "#ffffff",
                }}
              />
              <Bar
                dataKey="unidades"     // ✅ CORRECTO
                fill="#6A5D52"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* LISTADO */}
      <Card className="bg-[#111111] border-[#3A3A38]">
        <CardHeader>
          <CardTitle className="text-white">
            Detalle Top 15
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-white text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#3A3A38]">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Producto</th>
                <th className="p-3 text-left">Precio</th>
                <th className="p-3 text-left">Unidades</th>
                <th className="p-3 text-left">% del total</th>
              </tr>
            </thead>
            <tbody>
              {data.productos.map((p, i) => (
                <tr
                  key={p.nombre}
                  className="border-b border-[#2A2A29]"
                >
                  <td className="p-3 font-bold text-yellow-400">
                    {i + 1}
                  </td>
                  <td className="p-3 font-semibold">{p.nombre}</td>
                  <td className="p-3">
                    ${p.precio.toLocaleString("es-AR")}
                  </td>
                  <td className="p-3 font-bold">
                    {p.unidades}
                  </td>
                  <td className="p-3">
                    {p.porcentaje}%
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
