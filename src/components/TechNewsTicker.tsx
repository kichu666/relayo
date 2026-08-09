import { useState, useEffect } from 'react';
import { Newspaper } from 'lucide-react';

interface NewsItem {
  id: string | number;
  title: string;
  url: string;
  source: string;
}

const FALLBACK_HEADLINES: NewsItem[] = [
  { id: 'f1', title: 'WebRTC P2P Data Channels Stream Direct Memory-to-Memory Data', url: 'https://dev.to', source: 'WebDev' },
  { id: 'f2', title: 'Browser BroadcastChannel API Simplifies Multi-Tab Synchronization', url: 'https://dev.to', source: 'JS' },
  { id: 'f3', title: 'SHA-256 Checksums Guarantee 100% Chunk Integrity in P2P Transfers', url: 'https://dev.to', source: 'Security' },
  { id: 'f4', title: 'End-to-End DTLS/SRTP Encryption Standards for Real-Time Media', url: 'https://dev.to', source: 'WebRTC' },
  { id: 'f5', title: 'Zero Server Storage Architecture Ensures Maximum Privacy', url: 'https://dev.to', source: 'Tech' },
];

export function TechNewsTicker() {
  const [headlines, setHeadlines] = useState<NewsItem[]>(FALLBACK_HEADLINES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchTechNews() {
      try {
        const response = await fetch('https://dev.to/api/articles?per_page=12');
        if (!response.ok) throw new Error('API fetch failed');
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0 && isMounted) {
          const parsed: NewsItem[] = data.map((art: any) => ({
            id: art.id,
            title: art.title,
            url: art.url || 'https://dev.to',
            source: art.user?.name || 'Dev.to',
          }));
          setHeadlines(parsed);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('[Relayo Ticker] Dev.to fetch failed, trying HackerNews backup...', err);
      }

      // Backup: Hacker News Top Stories
      try {
        const hnRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        if (!hnRes.ok) throw new Error('HN fetch failed');
        const topIds = await hnRes.json();
        if (Array.isArray(topIds) && topIds.length > 0) {
          const topItems = await Promise.all(
            topIds.slice(0, 10).map((id: number) =>
              fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
                .then((res) => res.json())
                .catch(() => null)
            )
          );

          const validHN = topItems
            .filter((item: any) => item && item.title)
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
              source: 'HackerNews',
            }));

          if (validHN.length > 0 && isMounted) {
            setHeadlines(validHN);
            setLoading(false);
            return;
          }
        }
      } catch (backupErr) {
        console.warn('[Relayo Ticker] Backup HN fetch failed, using fallback list', backupErr);
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    fetchTechNews();
    const interval = setInterval(fetchTechNews, 10 * 60 * 1000); // 10 minutes auto-refresh

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Double items for seamless infinite marquee scrolling
  const marqueeItems = [...headlines, ...headlines];

  return (
    <div className="w-full h-7 sm:h-8 bg-[#070A12] [html[data-theme=light]_&]:bg-[#0B101D] border-b border-[#00e5ff]/20 text-xs flex items-center overflow-hidden relative z-40 select-none">
      {/* Left Fixed Badge */}
      <div className="h-full px-2.5 bg-[#070A12] [html[data-theme=light]_&]:bg-[#0B101D] border-r border-[#00e5ff]/20 flex items-center gap-1.5 shrink-0 z-20 shadow-[4px_0_12px_rgba(7,10,18,0.9)]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e5ff]" />
        </span>
        <Newspaper className="w-3 h-3 text-[#00e5ff]" strokeWidth={2.5} />
        <span className="font-mono text-[10px] font-bold tracking-wider text-[#00e5ff] uppercase whitespace-nowrap">
          Live Tech
        </span>
      </div>

      {/* Ticker Container with Continuous CSS Marquee */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="flex items-center gap-8 animate-ticker whitespace-nowrap hover:[animation-play-state:paused] cursor-pointer pl-4">
          {marqueeItems.map((item, index) => (
            <a
              key={`${item.id}-${index}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-light text-[#00e5ff] hover:underline hover:brightness-125 transition-all"
              style={{ fontWeight: 300 }}
              title={`Read on ${item.source}: ${item.title}`}
            >
              <span className="text-[#00e5ff]">{item.title}</span>
              <span className="text-[#00e5ff]/40 text-[10px] font-normal">•</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
