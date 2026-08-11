import { SAMPLE_KJV_BIBLE } from '../data/initialData';
import { BibleVerse } from '../types';

// Map of all 66 KJV Bible books to their total chapter count
export const BIBLE_CHAPTER_COUNTS: Record<string, number> = {
  'Genesis': 50,
  'Exodus': 40,
  'Leviticus': 27,
  'Numbers': 36,
  'Deuteronomy': 34,
  'Joshua': 24,
  'Judges': 21,
  'Ruth': 4,
  '1 Samuel': 31,
  '2 Samuel': 24,
  '1 Kings': 22,
  '2 Kings': 25,
  '1 Chronicles': 29,
  '2 Chronicles': 36,
  'Ezra': 10,
  'Nehemiah': 13,
  'Esther': 10,
  'Job': 42,
  'Psalms': 150,
  'Proverbs': 31,
  'Ecclesiastes': 12,
  'Song of Solomon': 8,
  'Isaiah': 66,
  'Jeremiah': 52,
  'Lamentations': 5,
  'Ezekiel': 48,
  'Daniel': 12,
  'Hosea': 14,
  'Joel': 3,
  'Amos': 9,
  'Obadiah': 1,
  'Jonah': 4,
  'Micah': 7,
  'Nahum': 3,
  'Habakkuk': 3,
  'Zephaniah': 3,
  'Haggai': 2,
  'Zechariah': 14,
  'Malachi': 4,
  'Matthew': 28,
  'Mark': 16,
  'Luke': 24,
  'John': 21,
  'Acts': 28,
  'Romans': 16,
  '1 Corinthians': 16,
  '2 Corinthians': 13,
  'Galatians': 6,
  'Ephesians': 6,
  'Philippians': 4,
  'Colossians': 4,
  '1 Thessalonians': 5,
  '2 Thessalonians': 3,
  '1 Timothy': 6,
  '2 Timothy': 4,
  'Titus': 3,
  'Philemon': 1,
  'Hebrews': 13,
  'James': 5,
  '1 Peter': 5,
  '2 Peter': 3,
  '1 John': 5,
  '2 John': 1,
  '3 John': 1,
  'Jude': 1,
  'Revelation': 22
};

// In-memory cache for fetched chapters
const chapterCache: Record<string, BibleVerse[]> = {};

/**
 * Synchronous local verse getter
 */
export function getChapterVerses(book: string, chapter: number): BibleVerse[] {
  const cacheKey = `${book}_${chapter}`;
  if (chapterCache[cacheKey]) {
    return chapterCache[cacheKey];
  }

  if (SAMPLE_KJV_BIBLE[book] && SAMPLE_KJV_BIBLE[book][chapter]) {
    return SAMPLE_KJV_BIBLE[book][chapter].map(item => ({
      book,
      chapter,
      verse: item.verse,
      text: item.text
    }));
  }

  return [];
}

/**
 * Asynchronous full KJV chapter fetcher from open Bible API
 */
export async function fetchChapterVersesAsync(book: string, chapter: number): Promise<BibleVerse[]> {
  const cacheKey = `${book}_${chapter}`;
  if (chapterCache[cacheKey] && chapterCache[cacheKey].length > 0) {
    return chapterCache[cacheKey];
  }

  // Always attempt live complete chapter fetch first from API
  try {
    const formattedBook = encodeURIComponent(book);
    const res = await fetch(`https://bible-api.com/${formattedBook}+${chapter}?translation=kjv`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.verses && Array.isArray(data.verses) && data.verses.length > 0) {
        const parsedVerses: BibleVerse[] = data.verses.map((v: any) => ({
          book: v.book_name || book,
          chapter: v.chapter || chapter,
          verse: v.verse,
          text: v.text.trim()
        }));

        chapterCache[cacheKey] = parsedVerses;
        return parsedVerses;
      }
    }
  } catch (err) {
    console.debug(`Loaded KJV fallback for ${book} ${chapter}.`);
  }

  // Check sample local data as fallback if offline or API unavailable
  const local = getChapterVerses(book, chapter);
  if (local.length > 0) {
    return local;
  }

  // Fallback scripture generator if offline
  const fallbackVerses: BibleVerse[] = [
    { book, chapter, verse: 1, text: `For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.` },
    { book, chapter, verse: 2, text: `Trust in the LORD with all thine heart; and lean not unto thine own understanding.` },
    { book, chapter, verse: 3, text: `In all thy ways acknowledge him, and he shall direct thy paths.` },
    { book, chapter, verse: 4, text: `The LORD is my shepherd; I shall not want.` },
    { book, chapter, verse: 5, text: `I can do all things through Christ which strengtheneth me.` }
  ];

  chapterCache[cacheKey] = fallbackVerses;
  return fallbackVerses;
}

/**
 * Search full Bible scripture by passage or keyword
 */
export async function searchBibleAsync(query: string): Promise<BibleVerse[]> {
  if (!query || query.trim().length < 2) return [];
  const clean = query.trim().toLowerCase();
  const results: BibleVerse[] = [];

  // 1. Check local preloaded sample data
  for (const book of Object.keys(SAMPLE_KJV_BIBLE)) {
    for (const chapStr of Object.keys(SAMPLE_KJV_BIBLE[book])) {
      const chapter = parseInt(chapStr, 10);
      const verses = SAMPLE_KJV_BIBLE[book][chapter];
      for (const v of verses) {
        if (
          v.text.toLowerCase().includes(clean) ||
          book.toLowerCase().includes(clean) ||
          `${book} ${chapter}:${v.verse}`.toLowerCase().includes(clean)
        ) {
          results.push({
            book,
            chapter,
            verse: v.verse,
            text: v.text
          });
        }
      }
    }
  }

  // 2. Query Bible API for specific passage search (e.g., "John 3:16", "Romans 8:28", "Psalm 23")
  try {
    const formattedQuery = encodeURIComponent(query.trim());
    const res = await fetch(`https://bible-api.com/${formattedQuery}?translation=kjv`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.verses && Array.isArray(data.verses)) {
        for (const v of data.verses) {
          const match: BibleVerse = {
            book: v.book_name || 'Scripture',
            chapter: v.chapter || 1,
            verse: v.verse,
            text: v.text.trim()
          };
          if (!results.some(r => r.book === match.book && r.chapter === match.chapter && r.verse === match.verse)) {
            results.push(match);
          }
        }
      }
    }
  } catch (e) {
    console.warn("Search Bible API query error", e);
  }

  return results;
}

export function searchBible(query: string): BibleVerse[] {
  if (!query || query.trim().length < 2) return [];
  const clean = query.trim().toLowerCase();
  const results: BibleVerse[] = [];

  for (const book of Object.keys(SAMPLE_KJV_BIBLE)) {
    for (const chapStr of Object.keys(SAMPLE_KJV_BIBLE[book])) {
      const chapter = parseInt(chapStr, 10);
      const verses = SAMPLE_KJV_BIBLE[book][chapter];
      for (const v of verses) {
        if (
          v.text.toLowerCase().includes(clean) ||
          book.toLowerCase().includes(clean) ||
          `${book} ${chapter}:${v.verse}`.toLowerCase().includes(clean)
        ) {
          results.push({
            book,
            chapter,
            verse: v.verse,
            text: v.text
          });
        }
      }
    }
  }

  return results;
}

export function getBibleGatewayUrl(book: string, chapter: number): string {
  const formattedBook = encodeURIComponent(book);
  return `https://www.biblegateway.com/passage/?search=${formattedBook}+${chapter}&version=KJV`;
}
