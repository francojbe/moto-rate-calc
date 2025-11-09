import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bike, Settings } from 'lucide-react';
export const Header = () => {
  return <header className="bg-gradient-to-r from-primary via-primary-glow to-primary-light shadow-medium sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-primary-foreground/10 p-2 rounded-lg group-hover:bg-primary-foreground/20 transition-colors">
              <Bike className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Calculadora de Financiamiento</h1>
              <p className="text-xs text-primary-foreground/80">
                Calculadora de Financiamiento
              </p>
            </div>
          </Link>

          <Link to="/admin">
            <Button variant="secondary" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>;
};