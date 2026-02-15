import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
        <p className="text-sm font-medium">
          © 2026 Wallet Tally. All rights reserved.
        </p>
        <nav className="flex items-center gap-2">
          <Link
            href="/terms"
            className="rounded-md px-3 py-2 text-sm font-bold transition-colors hover:bg-white/10"
          >
            Terms & Conditions
          </Link>
          <Link
            href="/privacy"
            className="rounded-md px-3 py-2 text-sm font-bold transition-colors hover:bg-white/10"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="rounded-md px-3 py-2 text-sm font-bold transition-colors hover:bg-white/10"
          >
            Support
          </Link>
        </nav>
      </div>
    </footer>
  );
}
