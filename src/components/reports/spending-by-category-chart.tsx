'use client';

import {
  ChartContainer,
} from '@/components/ui/chart';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useMemo } from 'react';
import { useCurrencySymbol } from '@/hooks/use-currency';

interface SpendingByCategoryChartProps {
  transactions: any[];
}

export function SpendingByCategoryChart({ transactions }: SpendingByCategoryChartProps) {
  const currencySymbol = useCurrencySymbol();

  const chartData = useMemo(() => {
    const categoryMap: Record<string, { name: string; value: number; type: string }> = {};

    transactions.forEach((t) => {
      const category = t.category || 'Uncategorized';
      const type = t.type || 'expense';
      const key = `${category}-${type}`;
      
      if (!categoryMap[key]) {
        categoryMap[key] = { name: category, value: 0, type: type };
      }
      categoryMap[key].value += (t.amount || 0);
    });

    return Object.values(categoryMap)
      .filter(d => d.value > 0)
      .sort((a, b) => (a.type === 'income' ? -1 : 1));
  }, [transactions]);

  const totalValue = useMemo(() => chartData.reduce((acc, d) => acc + d.value, 0), [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : '0';
      const symbol = currencySymbol || '₹';
      
      return (
        <div className="bg-[#1a1a1a] text-white p-3 rounded-xl border border-white/10 shadow-2xl text-[11px] font-semibold">
          <div className="mb-1 opacity-70">
            {data.name} ({data.type === 'income' ? 'Income' : 'Expense'})
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: payload[0].color }} 
            />
            <span className="text-xs">
              {symbol}{data.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({percentage}%)
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const getShadedColor = (entry: any, index: number) => {
    // Group categories by type to calculate relative index for shading
    const sameTypeItems = chartData.filter(d => d.type === entry.type);
    const typeIndex = sameTypeItems.indexOf(entry);
    
    if (entry.type === 'income') {
      // Shades of green: Base HSL(142, 70%, 45%)
      // We vary the lightness to create shades
      const lightness = Math.max(25, 45 - (typeIndex * 10));
      return `hsl(142, 70%, ${lightness}%)`;
    } else {
      // Shades of red: Base HSL(0, 84%, 60%)
      const lightness = Math.max(30, 60 - (typeIndex * 10));
      return `hsl(0, 84%, ${lightness}%)`;
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      {chartData.length > 0 ? (
        <ChartContainer
          config={{}}
          className="mx-auto aspect-square h-[320px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={false}
                wrapperStyle={{ outline: 'none' }}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={0} // Full circular pie chart
                outerRadius={110}
                paddingAngle={0}
                stroke="#fff"
                strokeWidth={2}
                startAngle={90}
                endAngle={450}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getShadedColor(entry, index)} 
                    className="hover:opacity-90 transition-all cursor-pointer outline-none"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      ) : (
        <div className="flex flex-col items-center justify-center p-10">
          <div className="w-48 h-48 rounded-full bg-slate-50 border-[10px] border-white shadow-inner flex items-center justify-center relative">
             <div className="absolute inset-4 rounded-full border-2 border-dashed border-slate-200" />
             <div className="flex flex-col items-center gap-1 relative z-10">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Activity</span>
               <div className="h-0.5 w-6 bg-slate-200 rounded-full" />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
