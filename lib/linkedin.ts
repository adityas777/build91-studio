import 'server-only';
import { cache } from 'react';
import { BlogContentBlock, BlogPost } from './blogData';

// LinkedIn's REST API requires a "LinkedIn-Version" header (format YYYYMM) and
// only accepts versions within a rolling ~12 month window. Computing it from
// the current date (2 months back, for safety margin against not-yet-rolled-out
// versions) keeps this from going stale the way a hardcoded string would.
const LINKEDIN_VERSION = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() - 2);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
})();

// Posts whose text/title overlaps a hand-written static article (lib/blogData.ts)
// are skipped so the same story doesn't show up twice on the Blogs page.
const DUPLICATE_KEYWORDS = [
  'color drenching',
  'top interior design trends for 2025',
  'drone cinematics',
  'expert interior design secrets',
  'behind the scenes: the rendering process',
];

type LinkedInPostRaw = {
  id: string;
  createdAt: number;
  commentary?: string;
  content?: {
    media?: { id: string };
    article?: { title: string; description?: string; source: string; thumbnail?: string };
    reference?: { id: string };
  };
};

// LinkedIn's commentary field embeds inline markup for hashtags/mentions, e.g.
// `{hashtag|\#|Build91}` and `{mention|urn:li:person:xxx|Name}` — strip it to
// plain readable text before displaying.
function cleanCommentary(raw: string): string {
  return raw
    .replace(/\{hashtag\|\\#\|([^}]+)\}/g, '#$1')
    .replace(/\{mention\|[^|]+\|([^}]+)\}/g, '$1')
    .replace(/\\([()#])/g, '$1')
    .trim();
}

function isDuplicateOfStaticBlog(text: string): boolean {
  const lower = text.toLowerCase();
  return DUPLICATE_KEYWORDS.some((kw) => lower.includes(kw));
}

function isJobReference(content: LinkedInPostRaw['content']): boolean {
  return !!content?.reference?.id?.startsWith('urn:li:job:');
}

const HASHTAG_ONLY_LINE = /^(#\S+\s*)+$/;
const BULLET_PATTERN = /^(?:[-*•‣●◦]|🔹|▪️)\s*/u;

function isHashtagOnlyLine(line: string): boolean {
  return HASHTAG_ONLY_LINE.test(line);
}

function isBulletLine(line: string): boolean {
  return BULLET_PATTERN.test(line);
}

function stripBullet(line: string): string {
  return line.replace(BULLET_PATTERN, '').trim();
}

// Turns a LinkedIn caption into the same paragraph/list block shape the
// static articles use, so it renders in the same in-house reader modal.
// `firstLine` (the line already used as the post's title) is skipped here
// so it isn't repeated as both the H1 and the opening paragraph. Runs of 2+
// consecutive bullet-style lines (🔹, ▪️, -, •...) become a `list` block;
// everything else becomes its own `paragraph` block. Hashtag-only lines
// (LinkedIn bunches these at the end of a post) are dropped entirely.
function buildContentBlocks(commentary: string, firstLine: string): BlogContentBlock[] {
  const lines = commentary.split('\n').map((l) => l.trim());
  const blocks: BlogContentBlock[] = [];
  let pendingList: string[] = [];
  let skippedTitle = false;

  const flushList = () => {
    if (pendingList.length >= 2) {
      blocks.push({ type: 'list', items: pendingList });
    } else if (pendingList.length === 1) {
      blocks.push({ type: 'paragraph', text: pendingList[0] });
    }
    pendingList = [];
  };

  for (const line of lines) {
    if (!line || isHashtagOnlyLine(line)) continue;

    if (!skippedTitle && line === firstLine) {
      skippedTitle = true;
      continue;
    }

    if (isBulletLine(line)) {
      pendingList.push(stripBullet(line));
      continue;
    }

    flushList();
    blocks.push({ type: 'paragraph', text: line });
  }
  flushList();

  return blocks;
}

function buildExcerpt(blocks: BlogContentBlock[]): string {
  const text = blocks
    .map((b) => (b.type === 'paragraph' ? b.text : b.type === 'list' ? b.items.join(' ') : ''))
    .filter(Boolean)
    .join(' ');
  if (!text) return 'Read the full post on LinkedIn.';
  return text.length > 160 ? `${text.slice(0, 157).trim()}…` : text;
}

async function resolveImageUrl(urn: string, token: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://api.linkedin.com/rest/images/${encodeURIComponent(urn)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': LINKEDIN_VERSION,
      },
      next: { revalidate: 14400 },
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    return typeof data.downloadUrl === 'string' ? data.downloadUrl : undefined;
  } catch {
    return undefined;
  }
}

async function resolveVideoThumbnail(urn: string, token: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://api.linkedin.com/rest/videos/${encodeURIComponent(urn)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': LINKEDIN_VERSION,
      },
      next: { revalidate: 14400 },
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    return typeof data.thumbnail === 'string' ? data.thumbnail : undefined;
  } catch {
    return undefined;
  }
}

// Fetches the org's LinkedIn posts and maps qualifying ones onto the BlogPost
// shape so they can be appended to the static blog list. Never throws — on any
// failure (missing token, API error, network issue) it returns an empty array,
// which just means the static blogs show with nothing extra appended.
export const fetchLinkedInPosts = cache(async (): Promise<BlogPost[]> => {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const orgId = process.env.LINKEDIN_ORGANIZATION_ID;

  if (!token || !orgId || token.includes('placeholder')) {
    return [];
  }

  try {
    const author = encodeURIComponent(`urn:li:organization:${orgId}`);
    const res = await fetch(
      `https://api.linkedin.com/rest/posts?author=${author}&q=author&count=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': LINKEDIN_VERSION,
        },
        next: { revalidate: 14400 },
      }
    );

    if (!res.ok) {
      console.warn(`[linkedin] API returned status ${res.status}`);
      return [];
    }

    const data = await res.json();
    const elements: LinkedInPostRaw[] = Array.isArray(data.elements) ? data.elements : [];

    // Only posts with an actual image/video or article link qualify — this
    // drops hiring posts, internal shoutouts, and plain-text-only posts that
    // don't belong on the public marketing site's Blogs page.
    const candidates = elements.filter((el) => {
      if (!el.content || isJobReference(el.content)) return false;
      if (!el.content.media && !el.content.article) return false;

      const commentary = cleanCommentary(el.commentary || '');
      if (!commentary || isDuplicateOfStaticBlog(commentary)) return false;
      if (el.content.article && isDuplicateOfStaticBlog(el.content.article.title || '')) return false;

      return true;
    });

    const resolved = await Promise.all(
      candidates.map(async (el): Promise<BlogPost | null> => {
        let image: string | undefined;

        if (el.content!.media) {
          const mediaUrn = el.content!.media.id;
          image = mediaUrn.startsWith('urn:li:video:')
            ? await resolveVideoThumbnail(mediaUrn, token)
            : await resolveImageUrl(mediaUrn, token);
        } else if (el.content!.article?.thumbnail) {
          image = await resolveImageUrl(el.content!.article.thumbnail, token);
        }

        // Skip rather than show a broken/imageless card.
        if (!image) return null;

        const commentary = cleanCommentary(el.commentary || '');
        const firstLine =
          commentary.split('\n').map((l) => l.trim()).find((l) => l.length > 0 && !isHashtagOnlyLine(l)) ||
          commentary;
        const title = firstLine.length > 90 ? `${firstLine.slice(0, 87).trim()}…` : firstLine;
        const content = buildContentBlocks(commentary, firstLine);
        const excerpt = buildExcerpt(content);

        return {
          id: el.id,
          title,
          subtitle: '',
          excerpt,
          author: { name: 'Build91 Studio', avatar: '/images/Build91Logo_circle.png' },
          createdAt: new Date(el.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          readTime: 'LinkedIn Post',
          image,
          category: 'LinkedIn',
          content,
          source: 'linkedin',
          externalUrl: `https://www.linkedin.com/feed/update/${el.id}`,
        };
      })
    );

    return resolved.filter((p): p is BlogPost => p !== null);
  } catch (err) {
    console.error('[linkedin] Failed to fetch LinkedIn posts:', err);
    return [];
  }
});
