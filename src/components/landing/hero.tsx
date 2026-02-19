
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import './animations.css';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import placeholderData from '@/app/lib/placeholder-images.json';

const allIcons = placeholderData.placeholderImages;
const row1Icons = allIcons.slice(0, 8);
const row2Icons = allIcons.slice(8, 16);

const IconRow = ({
  icons,
  direction = 'left',
}: {
  icons: typeof row1Icons;
  direction?: 'left' | 'right';
}) => (
  <div
    className={cn(
      'flex w-max',
      direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'
    )}
  >
    {[...icons, ...icons, ...icons].map((icon, index) => (
      <div key={`${icon.id}-${index}`} className="mx-16 h-40 w-40 shrink-0 opacity-40 transition-opacity">
        <Image
          src={icon.imageUrl}
          alt={icon.description}
          width={160}
          height={160}
          data-ai-hint={icon.imageHint}
          unoptimized
        />
      </div>
    ))}
  </div>
);

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] w-full flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background Marquee Container */}
      <div className="absolute inset-0 z-0 flex flex-col justify-center gap-0 blur-[1px] opacity-40 pointer-events-none">
        <IconRow icons={row1Icons} direction="right" />
        <IconRow icons={row2Icons} direction="left" />
      </div>

      {/* Foreground Content Overlaid on Marquee */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl space-y-8 bg-background/10 backdrop-blur-[1px] py-20 rounded-3xl">
        <h1 className="text-5xl font-bold sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent leading-tight tracking-tight">
          Track Your Cash Flow
        </h1>
        <p className="max-w-2xl text-lg sm:text-xl text-primary font-medium leading-relaxed">
          The simplest way to manage your personal finances. Record daily cash transactions, and get insights to grow your savings.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 pt-4">
          <Button
            size="lg"
            asChild
            className="text-lg px-10 py-7 text-white bg-gradient-to-tr from-primary to-accent shadow-xl transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link href="/register">Start Saving Now</Link>
          </Button>
          <Button
            size="lg"
            asChild
            className="text-lg px-10 py-7 text-white bg-gradient-to-tr from-primary to-accent shadow-xl transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link href="/login">Login to Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
