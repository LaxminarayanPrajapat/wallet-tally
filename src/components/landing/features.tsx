import {
  Clock,
  Eye,
  FileDown,
  History,
  List,
  PieChart,
  PlusCircle,
  Tags,
  Wallet,
} from 'lucide-react';

const featuresData = [
  {
    icon: PlusCircle,
    title: 'Simple Recording',
    description:
      "Add your daily cash transactions with just a few clicks. Whether it's income or expense, recording is quick and easy.",
  },
  {
    icon: Wallet,
    title: 'Instant Balance',
    description:
      'Get your current cash balance instantly. See how much money you have after each transaction.',
  },
  {
    icon: List,
    title: 'Easy Tracking',
    description:
      'Keep track of all your cash movements. Know exactly where your money comes from and where it goes.',
  },
  {
    icon: Tags,
    title: 'Custom Categories',
    description:
      'Create your own personalized categories for both income and expenses. You have the freedom to organize transactions exactly how you want them.',
  },
  {
    icon: Eye,
    title: 'Clear Overview',
    description:
      'See your total income and expenses at a glance. Simple dashboard shows your financial status clearly.',
  },
  {
    icon: History,
    title: 'Transaction History',
    description:
      'Access all your past transactions easily. Never forget any cash movement with complete transaction records.',
  },
  {
    icon: Clock,
    title: 'Editable Time Period',
    description:
      'Modify or remove transactions within a 24-hour window. This promotes accuracy while ensuring your long-term financial history remains secure and untampered.',
  },
  {
    icon: FileDown,
    title: 'PDF Export',
    description:
      'Export your transactions to PDF with custom date ranges. Perfect for record-keeping.',
  },
  {
    icon: PieChart,
    title: 'Pie Chart Visualization',
    description:
      'Visualize your spending patterns with interactive pie charts. See where your money goes at a glance with beautiful graphical representations.',
  },
];

export function Features() {
  return (
    <section id="features" className="bg-muted/30 pt-20 sm:pt-32 pb-10 sm:pb-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16 sm:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Why Choose Wallet Tally?
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-card rounded-2xl border p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.03]"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
