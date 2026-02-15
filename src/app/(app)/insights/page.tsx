import { AiSuggestions } from '@/components/insights/ai-suggestions';

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground">
          Get personalized suggestions to improve your finances.
        </p>
      </div>
      <AiSuggestions />
    </div>
  );
}
