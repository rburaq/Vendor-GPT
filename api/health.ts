/**
 * Vercel serverless function: GET /api/health
 * Quick check that the function deployed and whether GROQ_API_KEY is set.
 */

export default function handler(_req: any, res: any) {
  res.status(200).json({
    status: "ok",
    groq_configured: Boolean(process.env.GROQ_API_KEY),
  });
}
