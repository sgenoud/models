import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@config";
import slugify from "@utils/slugify";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
const parser = new MarkdownIt();

export async function get() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: posts.map(post => ({
      link: `posts/${slugify(post.data)}`,
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.pubDatetime),
      content: sanitizeHtml(parser.render(post.body)),
    })),
  });
}
