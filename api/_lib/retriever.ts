/**
 * Dependency-free TF-IDF retriever (unigrams + bigrams, smoothed IDF,
 * L2-normalized vectors, cosine similarity). Ported from the standalone
 * backend but takes the knowledge-base chunks directly so it works inside a
 * serverless function (no filesystem read at request time).
 */

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
  const words = text.toLowerCase().match(/[a-z0-9]+(?:'[a-z]+)?/g) ?? [];
  return words.filter((w) => !STOPWORDS.has(w) && w.length > 1);
}

function ngrams(tokens: string[]): string[] {
  const grams = [...tokens];
  for (let i = 0; i < tokens.length - 1; i++) {
    grams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return grams;
}

function chunkText(c: Chunk): string {
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
  private chunks: Chunk[];
  private idf = new Map<string, number>();
  private docVectors: Map<string, number>[] = [];

  constructor(chunks: Chunk[]) {
    if (!chunks.length) {
      throw new Error("Knowledge base is empty.");
    }
    this.chunks = chunks;
    this.fit();
  }

  private fit(): void {
    const docTermSets = this.chunks.map((c) => ngrams(tokenize(chunkText(c))));

    const df = new Map<string, number>();
    for (const terms of docTermSets) {
      for (const term of new Set(terms)) {
        df.set(term, (df.get(term) ?? 0) + 1);
      }
    }

    const n = this.chunks.length;
    this.idf = new Map();
    for (const [term, docFreq] of df) {
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
      const idfVal = this.idf.get(term);
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
}
