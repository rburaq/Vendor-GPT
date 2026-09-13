/**
 * Retrieval layer for the Vendor-GPT RAG chatbot.
 *
 * Node has no equivalent of scikit-learn on the shelf, so this is a small,
 * dependency-free TF-IDF implementation (unigrams + bigrams, smoothed IDF,
 * L2-normalized vectors, cosine similarity via dot product) -- the same
 * approach scikit-learn's TfidfVectorizer uses by default. That keeps the
 * behavior consistent with the original Python version.
 *
 * This is deliberately lightweight (no external embedding API, no vector DB)
 * because the KB here is small and curated -- a few dozen chunks of
 * marketing/product copy. If the KB grows into the hundreds of chunks or you
 * need genuine semantic (not just lexical) matching, swap this out for an
 * embeddings-based retriever behind the same `Retriever` interface -- nothing
 * else in the service has to change.
 */

import fs from "node:fs";

export interface Chunk {
  id: string;
  category: string;
  title: string;
  content: string;
}

export interface RetrievedChunk {
  chunk: Chunk;
  score: number;
}

export interface Retriever {
  query(text: string, topK?: number): RetrievedChunk[];
}

// Compact English stopword list -- enough to keep common words from
// dominating the vector space; doesn't need to be exhaustive.
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "than", "so", "of",
  "to", "in", "on", "at", "for", "with", "without", "by", "from", "as",
  "is", "are", "was", "were", "be", "been", "being", "it", "its", "this",
  "that", "these", "those", "you", "your", "yours", "i", "we", "our",
  "they", "them", "their", "he", "she", "his", "her", "do", "does", "did",
  "can", "could", "will", "would", "should", "have", "has", "had", "not",
  "no", "what", "which", "who", "how", "when", "where", "why", "about",
  "into", "up", "out", "over", "under", "again", "further", "just", "also",
]);

function tokenize(text: string): string[] {
  const words = text
    .toLowerCase()
    .match(/[a-z0-9]+(?:'[a-z]+)?/g) ?? [];
  return words.filter((w) => !STOPWORDS.has(w) && w.length > 1);
}

/** unigrams + bigrams from a pre-filtered token sequence. */
function ngrams(tokens: string[]): string[] {
  const grams = [...tokens];
  for (let i = 0; i < tokens.length - 1; i++) {
    grams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return grams;
}

function chunkText(c: Chunk): string {
  // Title folded in so title-only matches (e.g. "Growth plan") score well.
  return `${c.title}. ${c.content}`;
}

function l2Normalize(vec: Map<string, number>): Map<string, number> {
  let sumSquares = 0;
  for (const v of vec.values()) sumSquares += v * v;
  const norm = Math.sqrt(sumSquares) || 1;
  const out = new Map<string, number>();
  for (const [k, v] of vec) out.set(k, v / norm);
  return out;
}

function dot(a: Map<string, number>, b: Map<string, number>): number {
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  let sum = 0;
  for (const [k, v] of small) {
    const bv = large.get(k);
    if (bv !== undefined) sum += v * bv;
  }
  return sum;
}

export class TfidfRetriever implements Retriever {
  private chunks: Chunk[] = [];
  private idf = new Map<string, number>();
  private docVectors: Map<string, number>[] = [];

  constructor(private kbPath: string) {
    this.load();
  }

  private load(): void {
    const raw = JSON.parse(fs.readFileSync(this.kbPath, "utf-8")) as Chunk[];
    if (!raw.length) {
      throw new Error(`Knowledge base at ${this.kbPath} is empty.`);
    }
    this.chunks = raw;
    this.fit();
  }

  private fit(): void {
    const docTermSets = this.chunks.map((c) => ngrams(tokenize(chunkText(c))));

    // Document frequency per term.
    const df = new Map<string, number>();
    for (const terms of docTermSets) {
      for (const term of new Set(terms)) {
        df.set(term, (df.get(term) ?? 0) + 1);
      }
    }

    const n = this.chunks.length;
    this.idf = new Map();
    for (const [term, docFreq] of df) {
      // Smoothed IDF, matching scikit-learn's default (smooth_idf=True).
      this.idf.set(term, Math.log((1 + n) / (1 + docFreq)) + 1);
    }

    this.docVectors = docTermSets.map((terms) => {
      const tf = new Map<string, number>();
      for (const term of terms) tf.set(term, (tf.get(term) ?? 0) + 1);
      const tfidf = new Map<string, number>();
      for (const [term, count] of tf) {
        const idfVal = this.idf.get(term) ?? 0;
        tfidf.set(term, count * idfVal);
      }
      return l2Normalize(tfidf);
    });
  }

  private vectorize(text: string): Map<string, number> {
    const terms = ngrams(tokenize(text));
    const tf = new Map<string, number>();
    for (const term of terms) tf.set(term, (tf.get(term) ?? 0) + 1);
    const tfidf = new Map<string, number>();
    for (const [term, count] of tf) {
      const idfVal = this.idf.get(term); // unseen terms simply don't contribute
      if (idfVal !== undefined) tfidf.set(term, count * idfVal);
    }
    return l2Normalize(tfidf);
  }

  query(text: string, topK = 4): RetrievedChunk[] {
    const queryVec = this.vectorize(text);
    const scored = this.chunks.map((chunk, i) => ({
      chunk,
      score: dot(queryVec, this.docVectors[i]),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.filter((r) => r.score > 0).slice(0, topK);
  }

  /** Re-read the KB file and refit (e.g. after editing the KB on disk). */
  reload(): void {
    this.load();
  }
}
