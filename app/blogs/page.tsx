import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { fetchLinkedInPosts } from '@/lib/linkedin';

export const metadata: Metadata = {
  title: 'Blogs',
  description: 'Insights, ideas and news from Build91 Studio on real estate technology, 3D renders, and digital launch strategies.',
};

export const revalidate = 14400; // Revalidate every 4 hours

export default async function BlogsPage() {
  const posts = await fetchLinkedInPosts();

  return (
    <>
      <section className="section-base section-warm overflow-hidden pb-16 pt-40 md:pb-20 md:pt-48">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-45" />
        <div className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-96 w-96 rounded-full bg-violet-glow/20 blur-[140px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-gold/15 blur-[140px]" />

        <div className="container-page">
          <AnimatedSection className="max-w-4xl">
            <span className="section-eyebrow">Blogs & Updates</span>
            <h1 className="text-display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Insights &{' '}
              <span className="text-accent-italic text-gradient">industry</span>{' '}
              perspectives{' '}
              <span className="text-accent-italic text-gradient-gold">
                unveiled.
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
              Explore our latest ideas, technical updates, and LinkedIn posts on the future of digital real estate sales.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-base section-neutral overflow-hidden py-16 md:py-24">
        <div className="container-page">
          <AnimatedSection>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <a
                  key={post.id}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all hover:border-violet-glow/40 hover:bg-white/[0.04]"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-ink-800 border-b border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image}
                      alt="LinkedIn Post Visual"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-ink-950/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-soft border border-white/5">
                      LinkedIn Update
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-xs text-white/40">{post.createdAt}</span>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-white/70 line-clamp-4">
                      {post.commentary}
                    </p>
                    <div className="mt-6 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gold group-hover:text-white transition-colors">
                      Read on LinkedIn
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
