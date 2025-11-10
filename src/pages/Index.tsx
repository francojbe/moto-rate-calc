import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Calculator } from '@/components/Calculator';
import { ResultsTable } from '@/components/ResultsTable';
import { supabase } from '@/integrations/supabase/client';
import { Motorcycle, CalculationResult } from '@/types/motorcycle';

export default function Index() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [bcvRate, setBcvRate] = useState<number>(0);
  const [binanceRate, setBinanceRate] = useState<number>(0);

  useEffect(() => {
    fetchMotorcycles();
  }, []);

  const fetchMotorcycles = async () => {
    try {
      const { data, error } = await supabase
        .from('motorcycles')
        .select('*')
        .order('modelo', { ascending: true });

      if (error) throw error;
      setMotorcycles((data || []) as Motorcycle[]);
    } catch (error) {
      console.error('Error fetching motorcycles:', error);
    }
  };

  const calculateResults = (bcv: number, binance: number) => {
    setBcvRate(bcv);
    setBinanceRate(binance);

    const diferencial = binance / bcv;

    const calculatedResults: CalculationResult[] = motorcycles.map((moto) => {
      // Formula: TR@BCV = ((Cuota_Cruda_USD × Diferencial × 1.05) + 1.20) × Tasa_BCV
      const tr_bcv = ((moto.cuota_cruda * diferencial * 1.05) + 1.20) * bcv;
      
      // Formula: TPP@BCV = TR@BCV - 15%
      const tpp_bcv = tr_bcv - 15;

      return {
        ...moto,
        tr_bcv,
        tpp_bcv,
      };
    });

    setResults(calculatedResults);
  };

  // Filter results by plazo and tipo
  const results12Baratico = results.filter(r => r.plazo === 12 && r.tipo === 'BARATICO');
  const results12SemiNuevas = results.filter(r => r.plazo === 12 && r.tipo === 'SEMI NUEVAS');
  const results12Nuevas = results.filter(r => r.plazo === 12 && r.tipo === 'NUEVAS');
  const results6Nuevas = results.filter(r => r.plazo === 6 && r.tipo === 'NUEVAS');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Calculator Section */}
          <Calculator onCalculate={calculateResults} />

          {/* Results Section */}
          {results.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Resultados del Cálculo</h2>
                <p className="text-muted-foreground mt-2">
                  BCV: {bcvRate.toFixed(2)} Bs/USD | Binance: {binanceRate.toFixed(2)} Bs/USDT | 
                  Diferencial: {(binanceRate / bcvRate).toFixed(4)}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResultsTable 
                  results={results12Baratico} 
                  title="12 Meses - BARATICO" 
                />
                <ResultsTable 
                  results={results12SemiNuevas} 
                  title="12 Meses - SEMI NUEVAS" 
                />
                <ResultsTable 
                  results={results12Nuevas} 
                  title="12 Meses - NUEVAS" 
                />
                <ResultsTable 
                  results={results6Nuevas} 
                  title="6 Meses - NUEVAS" 
                />
              </div>
            </div>
          )}

          {results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Presiona "Calcular" para ver los resultados de financiamiento
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}