export interface Motorcycle {
  id: string;
  modelo: string;
  inicial: number;
  cuota_cruda: number;
  plazo: 6 | 12;
  tipo: 'BARATICO' | 'SEMI NUEVAS' | 'NUEVAS';
  created_at?: string;
  updated_at?: string;
}

export interface ExchangeRate {
  rate: number;
  source: string;
  timestamp: string;
  error?: string;
}

export interface CalculationResult extends Motorcycle {
  tr_bcv: number;
  tpp_bcv: number;
}