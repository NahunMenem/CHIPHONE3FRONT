"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL!;

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7"];

export default function DashboardPage() {
  const hoy = new Date().toISOString().split("T")[0];

  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);

  const [dashboard, setDashboard] = useState<any>(null);
  const [caja, setCaja] = useState<any>(null);

  const cargarTodo = async () => {
    const qs = `?fecha_desde=${desde}&fecha_hasta=${hasta}`;

    const [d, c] = await Promise.all([
      fetch(`${API}/dashboard${qs}`, { credentials: "include" }).then(r => r.json()),
      fetch(`${API}/caja${qs}`, { credentials: "include" }).then(r => r.json()),
    ]);

    setDashboard(d);
    setCaja(c);
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  if (!dashboard || !caja) return null;

  // =========================
  // DATA
  // =========================
  const tortaDistribucion = dashboard.distribucion_ventas.map((d: any) => ({
    name: d.tipo,
    value: d.total,
  }));

  const tortaPagos = Object.entries(caja.neto_por_pago).map(
    ([tipo, total]: any) => ({
      name: tipo,
      value: total,
    })
  );

  const barrasResumen = [
    { name: "Ventas", total: dashboard.total_ventas },
    { name: "Costos", total: dashboard.total_costo },
    { name: "Egresos", total: dashboard.total_egresos },
    { name: "Ganancia", total: dashboard.ganancia },
  ];

  return (
    <div className="min-h-screen p-6 bg-[#1C1C1B] text-white space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard General</h1>

      {/* FILTROS */}
      <div className="flex gap-4">
        <Input
          type="date"
          value={desde}
          onChange={e => setDesde(e.target.value)}
          className="bg-[#1F1F1E] border-[#3A3A38] text-white placeholder:text-gray-400"
        />
        <Input
          type="date"
          value={hasta}
          onChange={e => setHasta(e.target.value)}
          className="bg-[#1F1F1E] border-[#3A3A38] text-white placeholder:text-gray-400"
        />
        <button
          onClick={cargarTodo}
          className="px-4 rounded bg-[#6A5D52] hover:bg-[#5B5047] text-white font-semibold"
        >
          Aplicar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPI title="Ventas Totales" value={dashboard.total_ventas} color="text-blue-400" />
        <KPI title="Costos" value={dashboard.total_costo} color="text-amber-400" />
        <KPI title="Egresos" value={dashboard.total_egresos} color="text-red-400" />
        <KPI
          title="Ganancia Neta"
          value={dashboard.ganancia}
          color={dashboard.ganancia >= 0 ? "text-green-400" : "text-red-500"}
        />
        <KPI
          title="Reparaciones"
          value={dashboard.total_ventas_reparaciones}
          color="text-purple-400"
        />
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TORTA DISTRIBUCIÓN */}
        <ChartCard title="Productos vs Reparaciones">
          <PieChartComp data={tortaDistribucion} />
        </ChartCard>

        {/* TORTA MÉTODO DE PAGO */}
        <ChartCard title="Ganancia Neta por Método de Pago">
          <PieChartComp data={tortaPagos} />
        </ChartCard>

        {/* BARRAS */}
        <ChartCard title="Resumen Económico">
          <ResponsiveContainer>
            <BarChart data={barrasResumen}>
              <XAxis dataKey="name" stroke="#ffffff" />
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
        </ChartCard>
      </div>
    </div>
  );
}

// =========================
// COMPONENTES
// =========================
function KPI({ title, value, color }: any) {
  return (
    <Card className="bg-[#111111] border-[#3A3A38] text-white">
      <CardHeader>
        <CardTitle className="text-sm text-white opacity-80">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${color}`}>
          ${value.toLocaleString("es-AR")}
        </p>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: any) {
  return (
    <Card className="bg-[#111111] border-[#3A3A38] text-white">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72 text-white">
        {children}
      </CardContent>
    </Card>
  );
}

function PieChartComp({ data }: any) {
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
        >
          {data.map((_: any, i: number) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#111111",
            border: "1px solid #333333",
            color: "#ffffff",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
