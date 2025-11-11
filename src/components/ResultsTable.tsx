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
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl md:text-2xl font-bold text-card-foreground text-center">
        {title}
      </h3>
      <div className="overflow-x-auto rounded-lg border border-border shadow-soft">
        <Table>
          <TableHeader>
            <TableRow className="bg-table-header hover:bg-table-header border-b-2 border-border">
              <TableHead className="font-bold text-table-header-foreground">Modelo</TableHead>
              <TableHead className="font-bold text-table-header-foreground text-right">Inicial</TableHead>
              <TableHead className="font-bold text-table-header-foreground text-center">Plazo</TableHead>
              <TableHead className="font-bold text-table-header-foreground text-right">TR@BCV</TableHead>
              <TableHead className="font-bold text-table-header-foreground text-right">TPP@BCV</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id} className="hover:bg-muted/30 transition-colors border-b border-border/50">
                <TableCell className="font-medium text-card-foreground">{result.modelo}</TableCell>
                <TableCell className="text-right font-mono text-card-foreground">
                  ${result.inicial.toLocaleString('es-VE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TableCell>
                <TableCell className="text-center text-card-foreground">
                  {result.plazo}
                </TableCell>
                <TableCell className="text-right font-mono text-card-foreground">
                  Bs. {result.tr_bcv.toLocaleString('es-VE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TableCell>
                <TableCell className="text-right font-mono text-card-foreground">
                  Bs. {result.tpp_bcv.toLocaleString('es-VE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};