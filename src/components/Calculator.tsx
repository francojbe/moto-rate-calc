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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalcIcon className="w-6 h-6 text-primary" />
            Calculadora de Financiamiento
          </h2>
          {lastUpdate && (
            <span className="text-sm text-muted-foreground">
              Última actualización: {lastUpdate.toLocaleTimeString('es-VE')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bcv-rate" className="text-sm font-semibold">
              Tasa BCV (VES/USD)
            </Label>
            <Input
              id="bcv-rate"
              type="number"
              step="0.01"
              value={bcvRate || ''}
              onChange={(e) => setBcvRate(parseFloat(e.target.value) || 0)}
              className="text-lg font-mono"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="binance-rate" className="text-sm font-semibold">
              Tasa Binance P2P (VES/USDT)
            </Label>
            <Input
              id="binance-rate"
              type="number"
              step="0.01"
              value={binanceRate || ''}
              onChange={(e) => setBinanceRate(parseFloat(e.target.value) || 0)}
              className="text-lg font-mono"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={fetchRates}
            disabled={loading}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar Tasas
          </Button>

          <Button
            onClick={handleCalculate}
            disabled={loading || bcvRate === 0 || binanceRate === 0}
            className="flex-1 sm:flex-none bg-primary hover:bg-primary-glow"
          >
            <CalcIcon className="w-4 h-4 mr-2" />
            Calcular
          </Button>
        </div>
      </div>
    </Card>
  );
};