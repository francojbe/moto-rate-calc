import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Motorcycle } from '@/types/motorcycle';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

export default function Admin() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Motorcycle>>({
    modelo: '',
    inicial: 0,
    cuota_cruda: 0,
    plazo: 12,
    tipo: 'BARATICO',
  });

  const fetchMotorcycles = async () => {
    try {
      const { data, error } = await supabase
        .from('motorcycles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMotorcycles((data || []) as Motorcycle[]);
    } catch (error) {
      console.error('Error fetching motorcycles:', error);
      toast.error('Error al cargar las motocicletas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotorcycles();
  }, []);

  const resetForm = () => {
    setFormData({
      modelo: '',
      inicial: 0,
      cuota_cruda: 0,
      plazo: 12,
      tipo: 'BARATICO',
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.modelo || !formData.inicial || !formData.cuota_cruda) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    try {
      if (editingId) {
        // Update existing motorcycle
        const { error } = await supabase
          .from('motorcycles')
          .update({
            modelo: formData.modelo,
            inicial: formData.inicial,
            cuota_cruda: formData.cuota_cruda,
            plazo: formData.plazo,
            tipo: formData.tipo,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Motocicleta actualizada');
      } else {
        // Insert new motorcycle
        const { error } = await supabase
          .from('motorcycles')
          .insert([{
            modelo: formData.modelo!,
            inicial: formData.inicial!,
            cuota_cruda: formData.cuota_cruda!,
            plazo: formData.plazo!,
            tipo: formData.tipo!,
          }]);

        if (error) throw error;
        toast.success('Motocicleta agregada');
      }

      resetForm();
      fetchMotorcycles();
    } catch (error) {
      console.error('Error saving motorcycle:', error);
      toast.error('Error al guardar la motocicleta');
    }
  };

  const handleEdit = (motorcycle: Motorcycle) => {
    setFormData(motorcycle);
    setEditingId(motorcycle.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta motocicleta?')) return;

    try {
      const { error } = await supabase
        .from('motorcycles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Motocicleta eliminada');
      fetchMotorcycles();
    } catch (error) {
      console.error('Error deleting motorcycle:', error);
      toast.error('Error al eliminar la motocicleta');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Panel de Administración
            </h2>
            <p className="text-muted-foreground mt-2">
              Gestiona las motocicletas disponibles para financiamiento
            </p>
          </div>

          {/* Form */}
          <Card className="p-6 shadow-medium">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    placeholder="Ej: Honda XR 190"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inicial">Inicial (USD)</Label>
                  <Input
                    id="inicial"
                    type="number"
                    step="0.01"
                    value={formData.inicial || ''}
                    onChange={(e) => setFormData({ ...formData, inicial: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cuota_cruda">Cuota Cruda</Label>
                  <Input
                    id="cuota_cruda"
                    type="number"
                    step="0.01"
                    value={formData.cuota_cruda || ''}
                    onChange={(e) => setFormData({ ...formData, cuota_cruda: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plazo">Plazo</Label>
                  <Select
                    value={formData.plazo?.toString()}
                    onValueChange={(value) => setFormData({ ...formData, plazo: parseInt(value) as 6 | 12 })}
                  >
                    <SelectTrigger id="plazo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 meses</SelectItem>
                      <SelectItem value="12">12 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value as 'BARATICO' | 'SEMI NUEVAS' | 'NUEVAS' })}
                  >
                    <SelectTrigger id="tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BARATICO">BARATICO</SelectItem>
                      <SelectItem value="SEMI NUEVAS">SEMI NUEVAS</SelectItem>
                      <SelectItem value="NUEVAS">NUEVAS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-primary hover:bg-primary-glow">
                  {editingId ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Actualizar
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </>
                  )}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Table */}
          <Card className="overflow-hidden shadow-medium">
            <div className="bg-gradient-to-r from-primary to-primary-light p-4">
              <h3 className="text-xl font-bold text-primary-foreground">
                Motocicletas Registradas
              </h3>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Cargando...
                </div>
              ) : motorcycles.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No hay motocicletas registradas
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary">
                      <TableHead className="font-bold">Modelo</TableHead>
                      <TableHead className="font-bold text-right">Inicial (USD)</TableHead>
                      <TableHead className="font-bold text-right">Cuota Cruda</TableHead>
                      <TableHead className="font-bold text-center">Plazo</TableHead>
                      <TableHead className="font-bold text-center">Tipo</TableHead>
                      <TableHead className="font-bold text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {motorcycles.map((moto) => (
                      <TableRow key={moto.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{moto.modelo}</TableCell>
                        <TableCell className="text-right font-mono">${moto.inicial.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{moto.cuota_cruda.toFixed(2)}</TableCell>
                        <TableCell className="text-center">{moto.plazo} meses</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            moto.tipo === 'NUEVAS' 
                              ? 'bg-success/10 text-success' 
                              : moto.tipo === 'SEMI NUEVAS'
                              ? 'bg-accent/10 text-accent'
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {moto.tipo}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(moto)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(moto.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}