import { useState, useEffect } from 'react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Calculator } from '@/components/Calculator';
import { ResultsTable } from '@/components/ResultsTable';
import { supabase } from '@/integrations/supabase/client';
import { Motorcycle, CalculationResult } from '@/types/motorcycle';
import glikLogo from '@/assets/glik-logo.png';

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
      
      // Formula: TPP@BCV = TR@BCV - 15% (descuento del 15%)
      const tpp_bcv = tr_bcv * 0.85;

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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* White content card matching Glik style */}
          <div className="bg-card rounded-2xl shadow-strong p-8 md:p-12">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="bg-primary p-3 rounded-xl inline-block">
                  <img 
                    src={glikLogo} 
                    alt="Glik Logo" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-card-foreground mb-3">
                Calculo Diferencial Cambiario
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Precios actualizados en tiempo real para tu conveniencia.
              </p>
            </div>

            {/* Calculator Section */}
            <Calculator onCalculate={calculateResults} />

            {/* Results Info */}
            {results.length > 0 && (
              <div className="mt-8 mb-6">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className="text-card-foreground text-sm md:text-base">
                    <span className="font-semibold">Tasa BCV actual:</span>{' '}
                    <span className="text-success font-bold">Bs. {bcvRate.toFixed(2)}</span>
                  </p>
                  <p className="text-muted-foreground text-xs md:text-sm mt-1">
                    Binance: {binanceRate.toFixed(2)} Bs/USDT | Diferencial: {(binanceRate / bcvRate).toFixed(4)}
                  </p>
                </div>
              </div>
            )}

            {/* Results Section */}
            {results.length > 0 && (
              <div className="space-y-8 mt-8">
                <ResultsTable 
                  results={results6Nuevas} 
                  title="6 MESES NUEVA" 
                />
                <ResultsTable 
                  results={results12Nuevas} 
                  title="12 MESES - NUEVAS" 
                />
                <ResultsTable 
                  results={results12SemiNuevas} 
                  title="12 MESES - SEMI NUEVAS" 
                />
                <ResultsTable 
                  results={results12Baratico} 
                  title="12 MESES - BARATICO" 
                />
              </div>
            )}

            {results.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-base md:text-lg">
                  Presiona "Calcular" para ver los resultados de financiamiento
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}