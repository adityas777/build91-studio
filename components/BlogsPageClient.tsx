'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, Linkedin, X } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { BlogPost } from '@/lib/blogData';

const POSTS_PER_PAGE = 3;

export function BlogsPageClient() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
          const data = await res.json();
          setBlogs(data);
        }
      } catch (err) {
        console.error('Failed to load blogs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedBlog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedBlog]);

  const totalPages = Math.ceil(blogs.length / POSTS_PER_PAGE);
  const displayedBlogs = blogs.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#05071a] text-white selection:bg-violet-glow/20 selection:text-white">
      {/* Hero Section */}
      <section className="bg-[#05071a] text-white relative overflow-hidden pt-28 md:pt-36 pb-8 md:pb-12 border-b border-white/10">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-30" />
        <div className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-96 w-96 rounded-full bg-violet-glow/15 blur-[140px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-gold/10 blur-[140px]" />

        <div className="container-page">
          <AnimatedSection className="max-w-4xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-gold border border-gold/30 rounded-full px-3 py-1 bg-gold/5">
              Blogs & Updates
            </span>
            <h1 className="text-display mt-6 text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl text-white">
              Insights &{' '}
              <span className="text-accent-italic text-gradient">industry</span>{' '}
              perspectives{' '}
              <span className="text-accent-italic text-gradient-gold">
                unveiled.
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">
              Explore our latest ideas, technical updates, and strategies on the future of digital real estate sales, 3D rendering, and immersive tech.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-10 md:py-14 bg-ink-900/40 border-t border-white/5">
        <div className="container-page max-w-6xl mx-auto px-4">
          <AnimatedSection className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Top Blogs and Resources
            </h2>
          </AnimatedSection>

          {loading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse rounded-2xl bg-white/[0.02] border border-white/10 h-[450px]" />
              ))}
            </div>
          ) : (
            <>
              {/* Blogs Grid */}
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {displayedBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    onClick={() => setSelectedBlog(blog)}
                    className="group cursor-pointer flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-violet-glow/40 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Cover Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-850 border-b border-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute left-4 top-4 rounded-full bg-[#05071a]/80 backdrop-blur-sm px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-violet-soft border border-white/5">
                        {blog.category}
                      </div>
                      {blog.source === 'linkedin' && (
                        <div
                          className="absolute right-4 top-4 rounded-full bg-[#05071a]/80 backdrop-blur-sm p-1.5 text-[#0A66C2] border border-white/5"
                          title="From LinkedIn"
                        >
                          <Linkedin className="h-3.5 w-3.5" fill="currentColor" />
                        </div>
                      )}
                    </div>

                    {/* Meta & Info */}
                    <div className="flex flex-1 flex-col p-6">
                      {/* Author */}
                      <div className="flex items-center gap-3 mb-4">
                        {blog.author.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={blog.author.avatar}
                            alt={blog.author.name}
                            className="h-8 w-8 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                            {blog.author.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white/80">{blog.author.name}</span>
                          <span className="text-[10px] text-white/45 font-medium">
                            {blog.createdAt} &middot; {blog.readTime}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold leading-snug text-white group-hover:text-gold transition-colors duration-200 line-clamp-2">
                        {blog.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="mt-3 flex-1 text-xs leading-relaxed text-white/60 line-clamp-3">
                        {blog.excerpt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    aria-label="Previous page"
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`h-8 w-8 text-xs font-semibold rounded-full transition-all ${
                        currentPage === idx + 1
                          ? 'bg-gold text-ink-950 shadow-sm font-bold'
                          : 'border border-white/10 text-white/60 hover:bg-white/5'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    aria-label="Next page"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Readable Blog Modal/Overlay */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex justify-center py-6 px-4">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#05071a] border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            
            {/* Modal Header Controls */}
            <div className="sticky top-0 bg-[#05071a] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
              <button
                onClick={() => setSelectedBlog(null)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blogs
              </button>
              <button
                onClick={() => setSelectedBlog(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                aria-label="Close blog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Blog Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 thin-scrollbar">
              <div className="max-w-2xl mx-auto">
                {/* Meta details */}
                <div className="flex items-center gap-3 mb-6">
                  {selectedBlog.author.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedBlog.author.avatar}
                      alt={selectedBlog.author.name}
                      className="h-10 w-10 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center font-bold text-white/60">
                      {selectedBlog.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white/80">{selectedBlog.author.name}</span>
                    <span className="text-xs text-white/45 font-medium">
                      {selectedBlog.createdAt} &middot; {selectedBlog.readTime}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl leading-tight">
                  {selectedBlog.title}
                </h1>

                {/* Subtitle */}
                {selectedBlog.subtitle && (
                  <p className="mt-4 text-base md:text-lg text-white/70 font-medium leading-relaxed">
                    {selectedBlog.subtitle}
                  </p>
                )}

                {/* LinkedIn source link */}
                {selectedBlog.source === 'linkedin' && selectedBlog.externalUrl && (
                  <a
                    href={selectedBlog.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A66C2] hover:text-[#0A66C2]/80 transition-colors"
                  >
                    <Linkedin className="h-3.5 w-3.5" fill="currentColor" />
                    View original post on LinkedIn
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}

                {/* Cover Image */}
                <div className="mt-8 mb-4 relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-ink-900 border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedBlog.image}
                    alt={selectedBlog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* First paragraph excerpt text / intro context caption */}
                <p className="text-center text-xs text-white/45 italic mb-8">
                  {selectedBlog.excerpt}
                </p>

                {/* Body Content Blocks */}
                <div className="prose prose-invert max-w-none mt-8 text-white/70 leading-relaxed space-y-6">
                  {selectedBlog.content.map((block, idx) => {
                    switch (block.type) {
                      case 'paragraph':
                        return (
                          <p key={idx} className="text-sm md:text-base leading-relaxed text-white/75">
                            {block.text}
                          </p>
                        );
                      case 'heading':
                        return (
                          <h2 key={idx} className="text-xl md:text-2xl font-bold text-white pt-4">
                            {block.text}
                          </h2>
                        );
                      case 'image':
                        return (
                          <div key={idx} className="my-8">
                            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-ink-900 border border-white/10 shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={block.src}
                                alt={block.caption || 'Blog illustration'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {block.caption && (
                              <p className="text-center text-xs text-white/45 italic mt-2">
                                {block.caption}
                              </p>
                            )}
                          </div>
                        );
                      case 'list':
                        return (
                          <ul key={idx} className="list-disc pl-5 space-y-2 text-sm md:text-base text-white/75">
                            {block.items.map((item, itemIdx) => (
                              <li key={itemIdx} className="leading-relaxed">
                                {item}
                              </li>
                            ))}
                          </ul>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
