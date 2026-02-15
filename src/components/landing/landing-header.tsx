import Link from 'next/link';
import { Icons } from '@/components/icons';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-screen-2xl items-center px-4 md:px-6 mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <Icons.Logo className="h-9 w-9" />
          <span className="text-2xl font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent tracking-tight">
            Wallet Tally
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1 text-sm font-medium">
            <Link
              href="#features"
              className="rounded-md px-3 py-2 font-bold transition-all duration-300 bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent hover:bg-clip-border hover:text-white hover:shadow-md"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="rounded-md px-3 py-2 font-bold transition-all duration-300 bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent hover:bg-clip-border hover:text-white hover:shadow-md"
            >
              Testimonials
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
