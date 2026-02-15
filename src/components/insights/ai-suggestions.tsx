'use client';

import { getCostCuttingSuggestions } from '@/ai/flows/ai-cost-cutting-suggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { transactions } from '@/lib/data';
import { Lightbulb, LoaderCircle } from 'lucide-react';
import React from 'react';

export function AiSuggestions() {
  const [suggestions, setSuggestions] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleGetSuggestions = async () => {
    setLoading(true);
    setSuggestions('');
    try {
      const spendingData = JSON.stringify(transactions);
      const result = await getCostCuttingSuggestions({ spendingData });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      setSuggestions(
        'Sorry, there was an error generating suggestions. Please try again later.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost-Cutting Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-muted bg-background/50 p-8 text-center">
          <Lightbulb className="h-12 w-12 text-accent" />
          <p className="max-w-md text-muted-foreground">
            Analyze your spending patterns with AI to find personalized ways to
            save money.
          </p>
          <Button onClick={handleGetSuggestions} disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Get Suggestions'
            )}
          </Button>
        </div>

        {suggestions && (
          <div className="mt-6 rounded-lg bg-muted p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Here are your suggestions:
            </h3>
            <div
              className="prose prose-sm max-w-none text-foreground dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: suggestions.replace(/\n/g, '<br />'),
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
