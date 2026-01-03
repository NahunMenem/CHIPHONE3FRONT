"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL!;

type CajaResponse = {
  fecha_desde: string;
  fecha_hasta: string;
  neto_por_pago: Record<string, number>;
};

export default function CajaPage() {
  const hoy = new Date().toISOString().split("T")[0];

  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [data, setData] = useState<CajaResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // =====================
  // FETCH
  // =====================
  const cargarCaja = async () => {
    setLoading(true);
    try {
      const qs = `?fecha_desde=${desde}&fecha_hasta=${hasta}`;
      const res = await fetch(`${API}/caja${qs}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCaja();
  }, []);

  if (!data) return null;

  // =====================
  // DATA
  // =====================
  const chartData = Object.entries(data.neto_por_pago).map(
    ([tipo, total]) => ({
      tipo,
      total,
    })
  );

  const totalGeneral = chartData.reduce(
    (acc, v) => acc + v.total,
    0
  );

  // =====================
  // UI
  // =====================
  return (
    <div className="min-h-screen p-6 bg-[#1C1C1B] text-white space-y-6">
      <h1 className="text-2xl font-bold text-white">Caja</h1>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-4 items-end">
        <Input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          className="bg-[#1F1F1E] border-[#3A3A38] text-white"
        />
        <Input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          className="bg-[#1F1F1E] border-[#3A3A38] text-white"
        />
        <Button
          onClick={cargarCaja}
          disabled={loading}
          className="bg-[#6A5D52] hover:bg-[#5B5047] text-white"
        >
          Aplicar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {chartData.map((m) => (
          <Card
            key={m.tipo}
            className="bg-[#111111] border-[#3A3A38]"
          >
            <CardHeader>
              <CardTitle className="text-sm text-white opacity-80">
                {m.tipo.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${
                  m.total >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                ${m.total.toLocaleString("es-AR")}
              </p>
            </CardContent>
          </Card>
        ))}

        {/* TOTAL */}
        <Card className="bg-[#111111] border-[#3A3A38]">
          <CardHeader>
            <CardTitle className="text-sm text-white opacity-80">
              TOTAL CAJA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-bold ${
                totalGeneral >= 0
                  ? "text-green-400"
                  : "text-red-500"
              }`}
            >
              ${totalGeneral.toLocaleString("es-AR")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICO */}
      <Card className="bg-[#111111] border-[#3A3A38]">
        <CardHeader>
          <CardTitle className="text-white">
            Neto por método de pago
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <XAxis dataKey="tipo" stroke="#ffffff" />
              <YAxis stroke="#ffffff" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111111",
                  border: "1px solid #333333",
                  color: "#ffffff",
                }}
              />
              <Bar
                dataKey="total"
                fill="#6A5D52"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
