import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { NAV_LINKS, SERVICE_PILLARS, SITE } from '@/lib/constants';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden border-t border-white/10 bg-ink-900">
      {/* Subtle render image bleed — cinematic, low-opacity backdrop.
          REPLACE: drop a hero render at /public/images/footer-render.png
          (1920×600 ideal) and the URL below will pick it up automatically. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(/images/footer-render.png), linear-gradient(180deg,#0A0E2A,#05071A)",
          backgroundSize: 'cover, auto',
          backgroundPosition: 'center, center',
          backgroundRepeat: 'no-repeat',
          filter: 'saturate(1.1)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-ink-900 via-ink-900/80 to-ink-900/40"
      />

      {/* Animated wave SVG echoing the catalog */}
      <div className="pointer-events-none absolute -top-1 left-0 right-0 h-12 opacity-60">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="footer-wave" x1="0" x2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#E0B872" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40"
            stroke="url(#footer-wave)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>

      <div className="container-page relative pt-12 pb-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src={SITE.logo}
                alt={SITE.name}
                width={56}
                height={56}
                className="h-12 w-12 rounded-full ring-1 ring-white/15"
              />
              <span className="text-sm font-medium tracking-[0.2em] text-white/80">
                BUILD<span className="text-violet-soft">91</span>
                <span className="text-accent-italic ml-1 text-white/55">studio</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              The complete digital sales suite for real estate. We turn
              blueprints into immersive experiences that sell.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-all hover:border-violet-glow/50 hover:text-violet-soft"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={SITE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-all hover:border-violet-glow/50 hover:text-violet-soft"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={SITE.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-all hover:border-violet-glow/50 hover:text-violet-soft"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="section-eyebrow mb-5">Explore</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/70 transition-colors hover:text-white underline underline-offset-2 decoration-white/20"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="section-eyebrow mb-5">Core Services</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li>3D Architectural Rendering</li>
              <li>3D Interior Rendering Services</li>
              <li>3D Exterior Rendering Services</li>
              <li>3D Product Rendering Services</li>
              <li>3D Visualization Services</li>
              <li className="h-1" />
              <li>3D 360° Virtual Tours</li>
              <li>3D Video Walkthroughs</li>
              <li>Drone Aerial 360 Views</li>
              <li>Location Intelligence Video</li>
              <li>Digital Launchpad</li>
              <li className="h-1" />
              <li>2D Drawings</li>
              <li>Elevation Drawings</li>
              <li>3D Floor Plans</li>
              <li>3D Cut-Sections</li>
              <li>Isometric Drawings</li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="section-eyebrow mb-5">Services</h4>
            <ul className="space-y-3">
              {SERVICE_PILLARS.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/services#${s.id}`}
                    className="text-sm text-white/70 transition-colors hover:text-white underline underline-offset-2 decoration-white/20"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
              <li className="py-1" aria-hidden="true">
                <div className="border-t border-white/10 w-full" />
              </li>
              <li className="text-xs uppercase font-semibold tracking-wider text-gold/80 pt-1">
                Portfolio Collections
              </li>
              <li>
                <Link
                  href="/portfolio/interiors"
                  className="text-sm text-white/70 transition-colors hover:text-white underline underline-offset-2 decoration-white/20"
                >
                  Interiors Renders
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio/exteriors"
                  className="text-sm text-white/70 transition-colors hover:text-white underline underline-offset-2 decoration-white/20"
                >
                  Exteriors & Facades
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio/amenities"
                  className="text-sm text-white/70 transition-colors hover:text-white underline underline-offset-2 decoration-white/20"
                >
                  Amenities & Clubhouses
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio/isometric"
                  className="text-sm text-white/70 transition-colors hover:text-white underline underline-offset-2 decoration-white/20"
                >
                  Isometric Floor Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio#3d-tour"
                  className="text-sm text-white/70 transition-colors hover:text-white underline underline-offset-2 decoration-white/20"
                >
                  3D Virtual Tour
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="section-eyebrow mb-5">Contact</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-violet-soft" />
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, '')}`}
                  className="hover:text-white underline underline-offset-2 decoration-white/20"
                >
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-violet-soft" />
                <a
                  href={`mailto:${SITE.email}`}
                  className="hover:text-white underline underline-offset-2 decoration-white/20"
                >
                  {SITE.email}
                </a>
              </li>
              {SITE.offices.map((o) => (
                <li key={o.city} className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-soft" />
                  <span>
                    {o.city}, {o.country}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row md:items-center">
          <div className="flex flex-col gap-1.5">
            <p>© {year} {SITE.name}. All rights reserved.</p>
            <p className="text-white/35">Made with love by Turbo7X</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/privacy"
              className="hover:text-white/70 underline underline-offset-2 decoration-white/20"
            >
              Privacy Policy
            </Link>
            <Link
              href="/sitemap.xml"
              target="_blank"
              className="hover:text-white/70 underline underline-offset-2 decoration-white/20"
            >
              Sitemap
            </Link>
            <Link
              href="/terms"
              className="hover:text-white/70 underline underline-offset-2 decoration-white/20"
            >
              Terms
            </Link>
            <Link
              href="/shipping-policy"
              className="hover:text-white/70 underline underline-offset-2 decoration-white/20"
            >
              Shipping Policy
            </Link>
            <Link
              href="/refund-policy"
              className="hover:text-white/70 underline underline-offset-2 decoration-white/20"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
