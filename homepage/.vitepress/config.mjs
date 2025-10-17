import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "Nipah Malaysia F DMS",
  description: "Nipah Malaysia F DMS Project",
  base: "/Nipah_Malaysia_F_DMS/",
  markdown: {
    theme: "aurora-x",
  },
  head: [
    [
      "script",
      {
        async: "",
        src: "https://www.googletagmanager.com/gtag/js?id=G-SSJ0GP6KE5",
      },
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag("js", new Date());
      gtag("config", "G-SSJ0GP6KE5");`,
    ],
  ],
});
