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

export const Calculator = ({ onCalculate }: CalculatorProps) => {
  const [bcvRate, setBcvRate] = useState<number>(0);
  const [binanceRate, setBinanceRate] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    try {
      // Fetch both rates in parallel
      const [bcvResponse, binanceResponse] = await Promise.all([
        supabase.functions.invoke<ExchangeRate>('get-bcv-rate'),
        supabase.functions.invoke<ExchangeRate>('get-binance-rate')
      ]);

      if (bcvResponse.error) {
        toast.error('Error al obtener tasa BCV: ' + bcvResponse.error.message);
      } else if (bcvResponse.data?.rate) {
        setBcvRate(bcvResponse.data.rate);
      }

      if (binanceResponse.error) {
        toast.error('Error al obtener tasa Binance: ' + binanceResponse.error.message);
      } else if (binanceResponse.data?.rate) {
        setBinanceRate(binanceResponse.data.rate);
      }

      setLastUpdate(new Date());
      toast.success('Tasas actualizadas correctamente');
    } catch (error) {
      console.error('Error fetching rates:', error);
      toast.error('Error al actualizar las tasas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch rates on component mount
    fetchRates();

    // Set up interval to fetch rates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCalculate = () => {
    if (bcvRate > 0 && binanceRate > 0) {
      onCalculate(bcvRate, binanceRate);
      toast.success('Cálculo realizado');
    } else {
      toast.error('Por favor, actualiza las tasas primero');
    }
  };

  return (
    <Card className="p-6 shadow-medium bg-gradient-to-br from-card to-secondary border-border">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="bg-accent/10 p-2 rounded-lg">
              <CalcIcon className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Calculadora de Cuotas
              </h2>
              <p className="text-sm text-muted-foreground">
                Las tasas se actualizan automáticamente cada 5 minutos
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bcv-rate" className="text-sm font-semibold">
              Tasa BCV (Bs.)
            </Label>
            <div className="flex gap-2">
              <Input
                id="bcv-rate"
                type="number"
                step="0.01"
                value={bcvRate || ''}
                onChange={(e) => setBcvRate(parseFloat(e.target.value) || 0)}
                className="text-lg font-mono"
                placeholder="0.00"
              />
              <Button
                onClick={fetchRates}
                disabled={loading}
                variant="outline"
                size="icon"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Haz clic para obtener la tasa oficial del BCV
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="binance-rate" className="text-sm font-semibold">
              Precio Binance P2P (Bs.)
            </Label>
            <div className="flex gap-2">
              <Input
                id="binance-rate"
                type="number"
                step="0.01"
                value={binanceRate || ''}
                onChange={(e) => setBinanceRate(parseFloat(e.target.value) || 0)}
                className="text-lg font-mono"
                placeholder="0.00"
              />
              <Button
                onClick={fetchRates}
                disabled={loading}
                variant="outline"
                size="icon"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Haz clic en el botón para obtener el precio actual de Binance P2P
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={fetchRates}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar Ambas Tasas
          </Button>

          <Button
            onClick={handleCalculate}
            disabled={loading || bcvRate === 0 || binanceRate === 0}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Calcular Cuotas
          </Button>
        </div>
      </div>
    </Card>
  );
};