import type { Review } from "./scraper/parse.js";
import { loadExisting, lookbackReviews, mergeReviews } from "./scraper/store.js";

/** Saved reviews, newest first, trimmed to the fields a summary needs. */
export function recentReviews(root: string, hours: number, limit: number, maxRating?: number) {
  const cap = Math.max(1, Math.min(limit, 200));
  let [reviews] = mergeReviews(loadExisting(root), []);
  if (hours > 0) {
    reviews = lookbackReviews(reviews, hours);
  }
  if (maxRating !== undefined) {
    reviews = reviews.filter((review: Review) => review.rating !== null && review.rating <= maxRating);
  }
  return reviews.slice(0, cap).map((review) => ({
    id: review.id,
    branch: review.branch_name,
    branch_address: review.branch_address,
    rating: review.rating,
    author: review.author,
    text: review.text,
    url: review.url,
    published_at: review.published_at,
    edited_at: review.edited_at ?? null,
    likes_count: review.likes_count ?? 0,
    photos_count: review.photos_count ?? 0,
    replies_count: review.replies_count,
    replies: review.replies,
  }));
}
