export interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  post_date: string; // YYYY-MM-DD, user-defined date for the entry
  image_urls: string[];
}
