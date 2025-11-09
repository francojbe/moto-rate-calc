import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { CalculationResult } from '@/types/motorcycle';

interface ResultsTableProps {
  results: CalculationResult[];
  title: string;
}

export const ResultsTable = ({ results, title }: ResultsTableProps) => {
  if (results.length === 0) {
    return (
      <Card className="p-6 shadow-soft">
        <h3 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-center text-muted-foreground">No hay datos disponibles</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-medium border-border">
      <div className="bg-gradient-to-r from-primary to-primary-light p-4">
        <h3 className="text-xl font-bold text-primary-foreground text-center">
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary hover:bg-secondary">
              <TableHead className="font-bold">Modelo</TableHead>
              <TableHead className="font-bold text-right">Inicial (USD)</TableHead>
              <TableHead className="font-bold text-center">Plazo</TableHead>
              <TableHead className="font-bold text-right">TR@BCV</TableHead>
              <TableHead className="font-bold text-right">TPP@BCV</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{result.modelo}</TableCell>
                <TableCell className="text-right font-mono">
                  ${result.inicial.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {result.plazo} meses
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-success font-semibold">
                  {result.tr_bcv.toLocaleString('es-VE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} Bs
                </TableCell>
                <TableCell className="text-right font-mono text-accent font-semibold">
                  {result.tpp_bcv.toLocaleString('es-VE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} Bs
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};