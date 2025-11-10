import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RefreshCw, Calculator as CalcIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExchangeRate } from '@/types/motorcycle';
interface CalculatorProps {
  onCalculate: (bcvRate: number, binanceRate: number) => void;
}
export const Calculator = ({
  onCalculate
}: CalculatorProps) => {
  const [bcvRate, setBcvRate] = useState<number>(0);
  const [binanceRate, setBinanceRate] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const loadRatesFromDB = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('bcv_rate, binance_rate, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        toast.error('Error al cargar las tasas: ' + error.message);
        return;
      }

      if (data) {
        setBcvRate(data.bcv_rate);
        setBinanceRate(data.binance_rate);
        setLastUpdate(new Date(data.created_at));
      }
    } catch (error) {
      console.error('Error loading rates:', error);
      toast.error('Error al cargar las tasas');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Load rates from database on component mount
    loadRatesFromDB();
  }, []);
  const handleCalculate = () => {
    if (bcvRate > 0 && binanceRate > 0) {
      onCalculate(bcvRate, binanceRate);
      toast.success('Cálculo realizado');
    } else {
      toast.error('Por favor, actualiza las tasas primero');
    }
  };
  return <Card className="p-6 shadow-soft bg-muted/30 border-border">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-sm text-card-foreground">
            Las tasas se actualizan automáticamente todos los días a las 8:00 AM (hora Venezuela)
          </p>
          {lastUpdate && (
            <p className="text-xs text-card-foreground/70">
              Última actualización: {lastUpdate.toLocaleString('es-VE')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bcv-rate" className="text-sm font-semibold text-card-foreground">
              Tasa BCV (Bs.)
            </Label>
            <Input 
              id="bcv-rate" 
              type="number" 
              step="0.01" 
              value={bcvRate || ''} 
              onChange={e => setBcvRate(parseFloat(e.target.value) || 0)} 
              className="text-lg font-mono bg-card text-card-foreground" 
              placeholder="0.00" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="binance-rate" className="text-sm font-semibold text-card-foreground">
              Precio Binance P2P (Bs.)
            </Label>
            <Input 
              id="binance-rate" 
              type="number" 
              step="0.01" 
              value={binanceRate || ''} 
              onChange={e => setBinanceRate(parseFloat(e.target.value) || 0)} 
              className="text-lg font-mono bg-card text-card-foreground" 
              placeholder="0.00" 
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">

          <Button onClick={handleCalculate} disabled={loading || bcvRate === 0 || binanceRate === 0} className="w-full bg-success hover:bg-success/90 text-success-foreground font-bold text-base py-6">
            Calcular Cuotas
          </Button>
        </div>
      </div>
    </Card>;
};