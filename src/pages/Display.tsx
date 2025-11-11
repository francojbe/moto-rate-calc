import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Motorcycle, CalculationResult } from '@/types/motorcycle';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Autoplay from 'embla-carousel-autoplay';
import { Header } from '@/components/Header';
export default function Display() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [bcvRate, setBcvRate] = useState<number>(0);
  const [binanceRate, setBinanceRate] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [groupedResults, setGroupedResults] = useState<Array<{
    title: string;
    results: CalculationResult[];
  }>>([]);
  const autoplayPlugin = useRef(Autoplay({
    delay: 5000,
    stopOnInteraction: false,
    stopOnMouseEnter: false,
    stopOnFocusIn: false
  }));
  useEffect(() => {
    fetchData();
    // Auto-refresh every hour
    const interval = setInterval(fetchData, 3600000);
    return () => clearInterval(interval);
  }, []);
  const fetchData = async () => {
    // Fetch motorcycles
    const {
      data: motorcyclesData
    } = await supabase.from('motorcycles').select('*').order('modelo');
    if (motorcyclesData) {
      setMotorcycles(motorcyclesData);
    }

    // Fetch latest rates
    const {
      data: ratesData
    } = await supabase.from('exchange_rates').select('*').order('created_at', {
      ascending: false
    }).limit(1).single();
    if (ratesData) {
      setBcvRate(ratesData.bcv_rate);
      setBinanceRate(ratesData.binance_rate);
      setLastUpdate(new Date(ratesData.created_at).toLocaleString('es-VE'));
      calculateAndGroupResults(motorcyclesData || [], ratesData.bcv_rate, ratesData.binance_rate);
    }
  };
  const calculateAndGroupResults = (bikes: Motorcycle[], bcv: number, binance: number) => {
    const diferencial = binance / bcv;
    const results: CalculationResult[] = bikes.map(moto => {
      // Formula: TR@BCV = ((Cuota_Cruda_USD × Diferencial × 1.05) + 1.20) × Tasa_BCV
      const tr_bcv = (moto.cuota_cruda * diferencial * 1.05 + 1.20) * bcv;

      // Formula: TPP@BCV = TR@BCV - 15% (descuento del 15%)
      const tpp_bcv = tr_bcv * 0.85;
      
      return {
        ...moto,
        tr_bcv,
        tpp_bcv
      };
    });

    // Group by plazo and tipo
    const grouped = results.reduce((acc, result) => {
      const key = `${result.plazo}-${result.tipo}`;
      if (!acc[key]) {
        acc[key] = {
          title: `${result.plazo} meses - ${result.tipo.toUpperCase()}`,
          results: []
        };
      }
      acc[key].results.push(result);
      return acc;
    }, {} as Record<string, {
      title: string;
      results: CalculationResult[];
    }>);
    const sortedGroups = Object.values(grouped).sort((a, b) => {
      const plazoA = parseInt(a.title.split(' ')[0]);
      const plazoB = parseInt(b.title.split(' ')[0]);
      if (plazoA !== plazoB) return plazoA - plazoB;
      return a.title.localeCompare(b.title);
    });
    setGroupedResults(sortedGroups);
  };
  const diferencial = bcvRate > 0 ? (binanceRate / bcvRate).toFixed(4) : '0';
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <Header />
      
      {/* Rates Info */}
      <div className="py-4 px-12 bg-card/50 backdrop-blur-sm border-b-2 border-border">
        <div className="flex gap-8 text-2xl font-semibold justify-center">
          <div className="bg-primary/10 px-6 py-3 rounded-lg border border-primary/20">
            <span className="text-muted-foreground">BCV:</span>{' '}
            <span className="text-primary">{bcvRate.toFixed(2)} Bs/$</span>
          </div>
          
          
        </div>
      </div>

      {/* Carousel */}
      <main className="flex-1 flex items-center justify-center p-12">
        <div className="w-full max-w-[1800px]">
          {groupedResults.length > 0 ? <Carousel plugins={[autoplayPlugin.current]} className="w-full" opts={{
          loop: true,
          align: 'center'
        }}>
              <CarouselContent>
                {groupedResults.map((group, index) => <CarouselItem key={index}>
                    <div className="space-y-8 animate-fade-in">
                      <h2 className="text-5xl font-bold text-center text-foreground mb-8">
                        {group.title}
                      </h2>
                      <div className="rounded-2xl border-4 border-border shadow-2xl overflow-hidden bg-card">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-table-header hover:bg-table-header border-b-4 border-border">
                              <TableHead className="font-bold text-2xl text-table-header-foreground py-6">
                                Modelo
                              </TableHead>
                              <TableHead className="font-bold text-2xl text-table-header-foreground text-right py-6">
                                Inicial
                              </TableHead>
                              <TableHead className="font-bold text-2xl text-table-header-foreground text-center py-6">
                                Plazo
                              </TableHead>
                              <TableHead className="font-bold text-2xl text-table-header-foreground text-right py-6">
                                TR@BCV
                              </TableHead>
                              <TableHead className="font-bold text-2xl text-table-header-foreground text-right py-6">
                                TPP@BCV
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.results.map(result => <TableRow key={result.id} className="hover:bg-muted/30 transition-colors border-b-2 border-border/50">
                                <TableCell className="font-medium text-2xl text-card-foreground py-6">
                                  {result.modelo}
                                </TableCell>
                                <TableCell className="text-right font-mono text-2xl text-card-foreground py-6">
                                  ${result.inicial.toLocaleString('es-VE', {
                            maximumFractionDigits: 2
                          })}
                                </TableCell>
                                <TableCell className="text-center text-2xl text-card-foreground py-6">
                                  {result.plazo}
                                </TableCell>
                                <TableCell className="text-right font-mono text-2xl text-card-foreground py-6">
                                  Bs. {result.tr_bcv.toLocaleString('es-VE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                                </TableCell>
                                <TableCell className="text-right font-mono text-2xl text-card-foreground py-6">
                                  Bs. {result.tpp_bcv.toLocaleString('es-VE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                                </TableCell>
                              </TableRow>)}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CarouselItem>)}
              </CarouselContent>
            </Carousel> : <div className="text-center text-4xl text-muted-foreground">
              Cargando datos...
            </div>}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-12 bg-card/50 backdrop-blur-sm border-t-2 border-border">
        <div className="flex justify-between items-center max-w-[1800px] mx-auto text-xl text-muted-foreground">
          <p>Última actualización: {lastUpdate}</p>
          <p className="font-semibold">Glik - Arrendamiento de Motos</p>
        </div>
      </footer>
    </div>;
}