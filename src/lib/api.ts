import { query } from './db';

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author_name: string;
  author_picture: string;
  date_posted: string;
};

export async function getAllPosts(): Promise<Post[]> {
  const rows = await query<Record<string, unknown>>(`
    SELECT id, slug, title, excerpt, cover_image,
           author_name, author_picture,
           TO_CHAR(date_posted, 'YYYY-MM-DD') AS date_posted
    FROM posts
    WHERE published = 1
    ORDER BY date_posted DESC
  `);

  // Oracle 返回大写列名，转成小写
  return rows.map(row => ({
    id: row['ID'] as number,
    slug: row['SLUG'] as string,
    title: row['TITLE'] as string,
    excerpt: row['EXCERPT'] as string,
    content: row['CONTENT'] as string,
    cover_image: row['COVER_IMAGE'] as string,
    author_name: row['AUTHOR_NAME'] as string,
    author_picture: row['AUTHOR_PICTURE'] as string,
    date_posted: row['DATE_POSTED'] as string,
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const rows = await query<Record<string, unknown>>(
    `SELECT id, slug, title, excerpt, content, cover_image,
            author_name, author_picture,
            TO_CHAR(date_posted, 'YYYY-MM-DD') AS date_posted
     FROM posts
     WHERE slug = :slug AND published = 1`,
    [slug]
  );
  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row['ID'] as number,
    slug: row['SLUG'] as string,
    title: row['TITLE'] as string,
    excerpt: row['EXCERPT'] as string,
    content: row['CONTENT'] as string,
    cover_image: row['COVER_IMAGE'] as string,
    author_name: row['AUTHOR_NAME'] as string,
    author_picture: row['AUTHOR_PICTURE'] as string,
    date_posted: row['DATE_POSTED'] as string,
  };
}