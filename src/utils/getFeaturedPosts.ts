import type { CollectionEntry } from "astro:content";

const getFeaturedPosts = (posts: CollectionEntry<"blog">[]) =>
  posts
    .filter(({ data }) => data.featured)
    .sort(
      (a, b) =>
        Math.floor(new Date(b.data.pubDatetime).getTime() / 1000) -
        Math.floor(new Date(a.data.pubDatetime).getTime() / 1000)
    );

export default getFeaturedPosts;
