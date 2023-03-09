import type { SocialObjects } from "./types";

export const SITE = {
  website: "https://models.sgenoud.com/",
  author: "Steve Genoud",
  desc: "My 3D models",
  title: "My 3D models",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 5,
};

export const LOGO_IMAGE = {
  enable: true,
  svg: true,
  width: 46,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Mastodon",
    href: "https://toot.cafe/@stevegenoud",
    linkTitle: `Contact me on Mastodon`,
    isMe: true,
    active: true,
  },
  {
    name: "Github",
    href: "https://github.com/sgenoud",
    linkTitle: `My Github account`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:steve+models@sgenoud.com",
    linkTitle: `Send me an email`,
    active: true,
  },
];
