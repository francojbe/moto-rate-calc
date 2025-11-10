import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Menu, Shield } from 'lucide-react';
import glikLogo from '@/assets/glik-logo.png';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
export const Header = () => {
  return <header className="bg-transparent sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-2 rounded-lg">
              <img src={glikLogo} alt="Glik Logo" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Calculadora de Financiamiento</h1>
              <p className="text-xs text-slate-100">
                Sistema de cálculo con diferencial BCV/Binance
              </p>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="default" className="gap-2 shadow-md hover:shadow-lg transition-shadow">
                <Menu className="w-5 h-5 text-white" />
                Menú
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-lg z-50">
              <DropdownMenuItem asChild>
                <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-white">Administrar Motos</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>;
};