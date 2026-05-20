import oracledb from 'oracledb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WALLET_DIR = 'C:\\Dev\\my-oci-blog\\config\\wallet';

// 读取 _posts 下所有 markdown 文件
function readPosts() {
  const postsDir = path.join(__dirname, '..', '_posts');
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

  return files.map(file => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');

    // 解析 frontmatter
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) throw new Error(`Invalid frontmatter in ${file}`);

    const frontmatter = match[1];
    const body = match[2].trim();

    const get = (key) => {
      const m = frontmatter.match(new RegExp(`^${key}:\\s*['"]?(.+?)['"]?\\s*$`, 'm'));
      return m ? m[1] : '';
    };

    return {
      slug: file.replace('.md', ''),
      title: get('title'),
      excerpt: get('excerpt'),
      cover_image: get('coverImage'),
      author_name: get('name') || 'Admin',
      author_picture: get('picture') || '',
      content: body,
    };
  });
}

async function migrate() {
  const pool = await oracledb.createPool({
    user: 'ADMIN',
    password: process.env.DB_PASSWORD,
    connectionString: 'myociblog_low',
    walletLocation: WALLET_DIR,
    walletPassword: process.env.DB_WALLET_PASSWORD,
    configDir: WALLET_DIR,
    poolMin: 1,
    poolMax: 2,
  });

  const conn = await pool.getConnection();
  const posts = readPosts();

  for (const post of posts) {
    await conn.execute(
      `INSERT INTO posts (slug, title, excerpt, cover_image, author_name, author_picture, content)
       VALUES (:slug, :title, :excerpt, :cover_image, :author_name, :author_picture, :content)`,
      post,
      { autoCommit: true }
    );
    console.log(`✅ Inserted: ${post.slug}`);
  }

  await conn.close();
  await pool.close();
  console.log('🎉 Migration done!');
}

migrate().catch(console.error);