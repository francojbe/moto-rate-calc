import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import glikLogo from '@/assets/glik-logo.png';

export const Header = () => {
  return <header className="bg-transparent sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-2 rounded-lg">
              <img 
                src={glikLogo} 
                alt="Glik Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Calculadora de Financiamiento</h1>
              <p className="text-xs text-muted-foreground">
                Sistema de cálculo con diferencial BCV/Binance
              </p>
            </div>
          </Link>

          <Link to="/admin">
            <Button variant="default" size="default" className="gap-2 shadow-md hover:shadow-lg transition-shadow">
              <Settings className="w-5 h-5" />
              Administrar Motos
            </Button>
          </Link>
        </div>
      </div>
    </header>;
};