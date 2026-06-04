/** URL media sosial — set di .env.local (runtime di production) */
export const SOCIAL_LINKS = {
  instagram:
    process.env.INSTAGRAM_URL?.trim() ||
    process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ||
    "",
  youtube:
    process.env.YOUTUBE_URL?.trim() ||
    process.env.NEXT_PUBLIC_YOUTUBE_URL?.trim() ||
    "",
};
