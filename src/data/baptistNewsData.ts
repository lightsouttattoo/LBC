export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
  imageUrl?: string;
}

export const TYLER_GAULDEN_SERMONS = [
  {
    id: 'sermon_sf_1',
    title: 'Don’t Give Up in the Dark (Steven Furtick)',
    speaker: 'Steven Furtick • Elevation Church',
    date: 'August 2026',
    duration: '48 mins',
    category: 'Faith & Perseverance',
    thumbnailUrl: 'https://img.youtube.com/vi/gRxRFYUs6gY/hqdefault.jpg',
    youtubeId: 'gRxRFYUs6gY',
    videoUrl: 'https://www.youtube.com/watch?v=gRxRFYUs6gY',
    description: 'Anointed sermon by Steven Furtick from Elevation Church on trusting God when you can’t see the outcome and holding onto His promises.',
    scriptureRef: '2 Corinthians 5:7, Psalm 23:4'
  },
  {
    id: 'sermon_te_1',
    title: 'The Power of Divine Kingdom Authority (Dr. Tony Evans)',
    speaker: 'Dr. Tony Evans • Oak Cliff Bible Fellowship',
    date: 'August 2026',
    duration: '42 mins',
    category: 'Kingdom Authority',
    thumbnailUrl: 'https://img.youtube.com/vi/Rd0wx_zfMO0/hqdefault.jpg',
    youtubeId: 'Rd0wx_zfMO0',
    videoUrl: 'https://www.youtube.com/watch?v=Rd0wx_zfMO0',
    description: 'Dr. Tony Evans teaches on unleashing God’s kingdom authority in your personal life, marriage, and spiritual battles.',
    scriptureRef: 'Matthew 16:19, Ephesians 1:19-23'
  },
  {
    id: 'sermon_ew_1',
    title: 'Praise & Anointed Worship Experience (Elevation Worship)',
    speaker: 'Elevation Worship • Elevation Church',
    date: 'August 2026',
    duration: '52 mins',
    category: 'Praise & Worship',
    thumbnailUrl: 'https://img.youtube.com/vi/bV8M0pz80Sg/hqdefault.jpg',
    youtubeId: 'bV8M0pz80Sg',
    videoUrl: 'https://www.youtube.com/watch?v=bV8M0pz80Sg',
    description: 'Anointed praise & worship experience led by Elevation Worship in Christ Jesus.',
    scriptureRef: 'Psalm 150:1-6, Isaiah 61:3'
  },
  {
    id: 'sermon_bp_1',
    title: 'The Holy Spirit & Character of God (Bible Project)',
    speaker: 'Bible Project',
    date: 'August 2026',
    duration: '25 mins',
    category: 'Biblical Theology',
    thumbnailUrl: 'https://img.youtube.com/vi/kmCz4t1Sg9k/hqdefault.jpg',
    youtubeId: 'kmCz4t1Sg9k',
    videoUrl: 'https://www.youtube.com/watch?v=kmCz4t1Sg9k',
    description: 'Visual Bible Project study exploring the character of God and Holy Spirit throughout the Old and New Testaments.',
    scriptureRef: 'Genesis 1:2, Exodus 34:6-7'
  },
  {
    id: 'sermon_2819_1',
    title: 'You Are Still Being Shaped for Purpose (2819 Church)',
    speaker: '2819 Church & Pastor Steven Furtick',
    date: 'August 2026',
    duration: '38 mins',
    category: 'Worship & Grace',
    thumbnailUrl: 'https://img.youtube.com/vi/T7EhKX3ThSA/hqdefault.jpg',
    youtubeId: 'T7EhKX3ThSA',
    videoUrl: 'https://www.youtube.com/watch?v=T7EhKX3ThSA',
    description: 'Powerful teaching from 2819 Church on allowing God the Master Potter to shape your life.',
    scriptureRef: 'Jeremiah 18:1-6, Ephesians 2:10'
  }
];

export const FALLBACK_BAPTIST_NEWS: NewsArticle[] = [
  {
    id: 'news_1',
    title: 'Baptist Press Reports Historic Spike in Summer Youth Revival Baptisms',
    summary: 'Churches across North America report unprecedented decisions for Christ during annual summer camps and outreach vanguards.',
    source: 'Baptist Press News',
    url: 'https://www.baptistpress.com',
    publishedAt: '3 hours ago',
    category: 'Revival & Evangelism',
    imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'news_2',
    title: 'Missionaries Provide Clean Water & Bibles to Over 50 Remote Villages',
    summary: 'Global Baptist mission outreach teams distribute physical clean water wells alongside KJV Holy Bibles in West Africa.',
    source: 'Christian News Network',
    url: 'https://christiannews.net',
    publishedAt: '6 hours ago',
    category: 'Global Missions',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'news_3',
    title: 'Churches Launch Nationwide Emergency Relief for Storm Victims',
    summary: 'Local Baptist Disaster Relief units deliver hot meals, clothing, and prayer support to communities recovering from summer tornados.',
    source: 'Baptist Press Relief',
    url: 'https://www.baptistpress.com',
    publishedAt: 'Yesterday',
    category: 'Disaster Relief',
    imageUrl: 'https://images.unsplash.com/photo-1509021436468-d5103e63986a?auto=format&fit=crop&q=80&w=600'
  }
];

export async function fetchLiveBaptistNews(): Promise<NewsArticle[]> {
  try {
    // Fetch live RSS via RSS2JSON API
    const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.baptistpress.com%2Ffeed%2F');
    if (response.ok) {
      const data = await response.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        return data.items.slice(0, 8).map((item: any, idx: number) => ({
          id: `rss_${idx}_${Date.now()}`,
          title: item.title,
          summary: item.description ? item.description.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...' : 'Latest Christian and Baptist news article.',
          source: 'Baptist Press Feed',
          url: item.link || 'https://www.baptistpress.com',
          publishedAt: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Today',
          category: 'Baptist News Network',
          imageUrl: item.thumbnail || item.enclosure?.link || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=600'
        }));
      }
    }
    return FALLBACK_BAPTIST_NEWS;
  } catch (err) {
    console.warn('RSS Feed note:', err);
    return FALLBACK_BAPTIST_NEWS;
  }
}
