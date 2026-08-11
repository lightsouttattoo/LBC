// Video URL parser and embed generator supporting YouTube, Vimeo, Rumble, Dailymotion, & Direct MP4/WebM

export interface VideoInfo {
  provider: 'youtube' | 'vimeo' | 'rumble' | 'dailymotion' | 'direct' | 'unknown';
  id?: string;
  embedUrl?: string;
  directUrl?: string;
  thumbnailUrl?: string;
}

export function parseVideoUrl(inputUrl?: string, defaultYtId?: string): VideoInfo {
  if (!inputUrl && defaultYtId) {
    return {
      provider: 'youtube',
      id: defaultYtId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${defaultYtId}?rel=0&enablejsapi=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${defaultYtId}/hqdefault.jpg`
    };
  }

  if (!inputUrl) {
    return { provider: 'unknown' };
  }

  const url = inputUrl.trim();

  // 1. YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return {
      provider: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&enablejsapi=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    };
  }

  // Pure 11-char YouTube ID string
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return {
      provider: 'youtube',
      id: url,
      embedUrl: `https://www.youtube-nocookie.com/embed/${url}?rel=0&enablejsapi=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${url}/hqdefault.jpg`
    };
  }

  // 2. Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1];
    return {
      provider: 'vimeo',
      id,
      embedUrl: `https://player.vimeo.com/video/${id}?autoplay=0&title=0&byline=0`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=800'
    };
  }

  // 3. Rumble
  if (url.includes('rumble.com')) {
    if (url.includes('/embed/')) {
      return {
        provider: 'rumble',
        embedUrl: url,
        thumbnailUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800'
      };
    }
    const rumbleMatch = url.match(/rumble\.com\/(?:v|embed\/)?([a-zA-Z0-9_-]+)/);
    const rId = rumbleMatch ? rumbleMatch[1] : '';
    return {
      provider: 'rumble',
      id: rId,
      embedUrl: rId ? `https://rumble.com/embed/${rId}/` : url,
      thumbnailUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800'
    };
  }

  // 4. Dailymotion
  const dailyMatch = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dailyMatch && dailyMatch[1]) {
    const id = dailyMatch[1];
    return {
      provider: 'dailymotion',
      id,
      embedUrl: `https://www.dailymotion.com/embed/video/${id}`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=800'
    };
  }

  // 5. Direct MP4 / WebM / Blob / Data URL / Stream
  return {
    provider: 'direct',
    directUrl: url,
    embedUrl: url,
    thumbnailUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800'
  };
}
