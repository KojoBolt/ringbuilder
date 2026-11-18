
import { useState } from 'react'
import { Menu, Moon, Sun, X } from 'lucide-react'

type HeaderProps = {
  theme?: 'light' | 'dark'
  onThemeToggle?: () => void
}

const navigation = [
  { label: 'Engagement Rings', href: '#engagement-rings' },
  { label: 'Wedding Bands', href: '#wedding-bands' },
  { label: 'Bespoke', href: '#bespoke' },
  { label: 'Our Story', href: '#our-story' },
]

export default function Header({
  theme = 'light',
  onThemeToggle,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="relative z-50 w-full border-b border-border bg-background text-foreground">
      <div className="mx-auto flex h-[76px] max-w-[1300px] items-center justify-between gap-6 px-5 md:px-8">

        {/* Brand */}
        <a
          href="/"
          aria-label="DR Gold home"
          className="flex w-[155px] shrink-0 items-center"
        >
          <img
            src={`/images/dr-gold-logo-${theme}-theme.png`}
            alt="DR Gold Fine Jewellery"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
        </a>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 lg:flex"
        >
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/75 transition-colors hover:text-gold"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          {onThemeToggle && (
            <button
              type="button"
              onClick={onThemeToggle}
              aria-label={
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary"
            >
              {theme === 'dark' ? (
                <Sun size={18} strokeWidth={1.5} />
              ) : (
                <Moon size={18} strokeWidth={1.5} />
              )}
            </button>
          )}

          <a
            href="#consultation"
            className="hidden border border-foreground px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-gold hover:bg-gold hover:text-gold-foreground sm:inline-flex"
          >
            Book Consultation
          </a>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute left-0 right-0 top-full border-b border-border bg-background px-6 py-5 shadow-lg lg:hidden"
        >
          <div className="flex flex-col gap-5">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-border pb-4 text-xs font-medium uppercase tracking-[0.14em]"
              >
                {item.label}
              </a>
            ))}

            <a
              href="#consultation"
              onClick={() => setMenuOpen(false)}
              className="bg-gold px-5 py-4 text-center text-xs font-semibold uppercase tracking-widest text-gold-foreground sm:hidden"
            >
              Book Consultation
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
