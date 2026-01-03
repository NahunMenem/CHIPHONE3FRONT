"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const API = process.env.NEXT_PUBLIC_API_URL!;

export type ProductoForm = {
  id?: number;
  nombre: string;
  codigo_barras: string;
  num: string;
  color: string;
  bateria: string;
  condicion: string;
  categoria: string;
  stock: number;
  precio: number;
  precio_costo: number;
  precio_revendedor: number;
  foto_url?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categorias: string[];
  producto?: ProductoForm | null;
};

export default function ProductoModal({
  open,
  onClose,
  onSuccess,
  categorias,
  producto,
}: Props) {
  const editando = Boolean(producto?.id);

  const [form, setForm] = useState<ProductoForm>({
    nombre: "",
    codigo_barras: "",
    num: "",
    color: "",
    bateria: "",
    condicion: "",
    categoria: "",
    stock: 0,
    precio: 0,
    precio_costo: 0,
    precio_revendedor: 0,
  });

  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (producto) setForm(producto);
  }, [producto]);

  const subirImagen = async (): Promise<string | null> => {
    if (!imagenFile) return form.foto_url ?? null;

    const fd = new FormData();
    fd.append("file", imagenFile);

    const res = await fetch(`${API}/upload-imagen`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.url;
  };

  const guardar = async () => {
    try {
      if (!form.nombre || !form.categoria || !form.condicion) {
        toast.error("Nombre, categoría y condición son obligatorios");
        return;
      }

      setLoading(true);
      const fotoUrl = await subirImagen();

      const payload = { ...form, foto_url: fotoUrl };

      const res = await fetch(
        editando
          ? `${API}/productos/${producto!.id}`
          : `${API}/productos`,
        {
          method: editando ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();

      toast.success(editando ? "Producto actualizado" : "Producto creado");
      onSuccess();
      onClose();
    } catch {
      toast.error("Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          max-w-3xl
          bg-[#1C1C1B]
          text-[#E2E2DE]
          border border-[#2A2A29]
        "
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {editando ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["Nombre", "nombre"],
            ["Código barras", "codigo_barras"],
            ["Núm", "num"],
            ["Color", "color"],
            ["Batería", "bateria"],
          ].map(([label, key]) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-[#B7AC9B]">
                {label}
              </Label>
              <Input
                className="bg-[#E2E2DE] text-[#1C1C1B] border-[#979086]"
                value={(form as any)[key]}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
              />
            </div>
          ))}

          <div className="space-y-1">
            <Label className="text-xs text-[#B7AC9B]">
              Categoría
            </Label>
            <Select
              value={form.categoria}
              onValueChange={(v) =>
                setForm({ ...form, categoria: v })
              }
            >
              <SelectTrigger className="bg-[#E2E2DE] text-[#1C1C1B] border-[#979086]">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-[#B7AC9B]">
              Condición
            </Label>
            <Select
              value={form.condicion}
              onValueChange={(v) =>
                setForm({ ...form, condicion: v })
              }
            >
              <SelectTrigger className="bg-[#E2E2DE] text-[#1C1C1B] border-[#979086]">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sellado">Sellado</SelectItem>
                <SelectItem value="Usado">Usado</SelectItem>
                <SelectItem value="As is">As is</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-[#B7AC9B]">
              Imagen
            </Label>
            <Input
              type="file"
              accept="image/*"
              className="bg-[#E2E2DE] text-[#1C1C1B] border-[#979086]"
              onChange={(e) =>
                setImagenFile(e.target.files?.[0] || null)
              }
            />
          </div>

          {[
            ["Stock", "stock"],
            ["Precio", "precio"],
            ["Costo", "precio_costo"],
            ["Revendedor", "precio_revendedor"],
          ].map(([label, key]) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-[#B7AC9B]">
                {label}
              </Label>
              <Input
                type="number"
                className="bg-[#E2E2DE] text-[#1C1C1B] border-[#979086]"
                value={(form as any)[key]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]: Number(e.target.value),
                  })
                }
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-6">
          <Button
            onClick={guardar}
            disabled={loading}
            className="bg-[#6A5D52] hover:bg-[#5A4F45] text-white"
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
