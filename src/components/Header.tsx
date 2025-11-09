import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import glikLogo from '@/assets/glik-logo.png';

export const Header = () => {
  return <header className="bg-gradient-to-r from-primary to-accent shadow-medium sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={glikLogo} 
              alt="Glik Logo" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Calculadora de Financiamiento</h1>
              <p className="text-xs text-primary-foreground/80">
                Sistema de cálculo con diferencial BCV/Binance
              </p>
            </div>
          </Link>

          <Link to="/admin">
            <Button variant="secondary" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Administrar Motos
            </Button>
          </Link>
        </div>
      </div>
    </header>;
};