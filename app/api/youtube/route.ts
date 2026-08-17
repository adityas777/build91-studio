import { NextResponse } from 'next/server';

export const revalidate = 7200; // Cache response for 2 hours

export async function GET() {
  try {
    // Source: "Build91 Studio - Walkthrough Videos Playlist"
    // https://www.youtube.com/playlist?list=PLPjZzLK2hYa4
    // YouTube exposes a per-playlist RSS feed (same <entry> schema as the
    // channel feed), so videos are curated by the playlist rather than being
    // every latest upload from the channel.
    const playlistId = 'PLPjZzLK2hYa4';
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;

    const res = await fetch(feedUrl, {
      next: { revalidate: 7200 }, // 2 hours
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch YouTube RSS feed: ${res.statusText}`);
    }

    const xmlText = await res.text();
    const entries = xmlText.split('<entry>');
    
    // Slice off the header block before the first <entry> tag
    const videos = entries.slice(1).map((entry) => {
      const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
      const linkMatch = entry.match(/<link[^>]+href="([^"]+)"/);
      const descMatch = entry.match(/<media:description>([^<]+)<\/media:description>/);
      const thumbMatch = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/);

      const videoId = videoIdMatch ? videoIdMatch[1].trim() : '';
      let title = titleMatch ? titleMatch[1].trim() : '';
      const link = linkMatch ? linkMatch[1].trim() : '';
      const description = descMatch ? descMatch[1].trim() : '';
      const thumbnail = thumbMatch ? thumbMatch[1].trim() : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      const isShort = link.includes('/shorts/');

      // Decode XML entities simple fallback
      title = title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");

      return {
        videoId,
        title,
        link,
        description,
        thumbnail,
        isShort,
      };
    });

    // Return the top 10 videos
    return NextResponse.json(videos.slice(0, 10));
  } catch (error: any) {
    console.error('Error fetching YouTube feed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
