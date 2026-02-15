'use server';

/**
 * @fileOverview Provides AI-powered suggestions for cost cutting based on spending patterns.
 *
 * - getCostCuttingSuggestions - A function that generates cost cutting suggestions.
 * - CostCuttingSuggestionsInput - The input type for the getCostCuttingSuggestions function.
 * - CostCuttingSuggestionsOutput - The return type for the getCostCuttingSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CostCuttingSuggestionsInputSchema = z.object({
  spendingData: z.string().describe('The user spending data in JSON format.'),
});
export type CostCuttingSuggestionsInput = z.infer<typeof CostCuttingSuggestionsInputSchema>;

const CostCuttingSuggestionsOutputSchema = z.object({
  suggestions: z.string().describe('AI-powered suggestions on areas to cut costs.'),
});
export type CostCuttingSuggestionsOutput = z.infer<typeof CostCuttingSuggestionsOutputSchema>;

export async function getCostCuttingSuggestions(input: CostCuttingSuggestionsInput): Promise<CostCuttingSuggestionsOutput> {
  return costCuttingSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'costCuttingSuggestionsPrompt',
  input: {schema: CostCuttingSuggestionsInputSchema},
  output: {schema: CostCuttingSuggestionsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the following spending data and provide suggestions on areas where the user can cut costs.

Spending Data: {{{spendingData}}}

Provide specific and actionable advice.
`,
});

const costCuttingSuggestionsFlow = ai.defineFlow(
  {
    name: 'costCuttingSuggestionsFlow',
    inputSchema: CostCuttingSuggestionsInputSchema,
    outputSchema: CostCuttingSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
