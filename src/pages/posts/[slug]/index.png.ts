import type { APIRoute } from "astro";
import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { generateOgImageForPost } from "@utils/generateOgImages";

export async function getStaticPaths() {
  const allPosts = await getCollection("blog");
  const posts = allPosts.filter(({ data }) => !data.draft && !data.ogImage);

  return posts.map(post => ({
    params: { slug: post.slug },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(await generateOgImageForPost(props as CollectionEntry<"blog">), {
    headers: { "Content-Type": "image/png" },
  });
