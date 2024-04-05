import rss from "@astrojs/rss";
import sanitizeHtml from "sanitize-html";
import { getCollection } from "astro:content";
import getSortedPosts from "@utils/getSortedPosts";
import { SITE } from "@config";

import MarkdownIt from "markdown-it";
const parser = new MarkdownIt();

export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(({ data, slug, body }) => ({
      link: `posts/${slug}/`,
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
      content: sanitizeHtml(parser.render(body)),
    })),
  });
}
