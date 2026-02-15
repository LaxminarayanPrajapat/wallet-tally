import { IncomeVsExpenseChart } from '@/components/reports/income-vs-expense-chart';
import { SpendingByCategoryChart } from '@/components/reports/spending-by-category-chart';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Visualize your financial patterns.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SpendingByCategoryChart />
        <IncomeVsExpenseChart />
      </div>
    </div>
  );
}
