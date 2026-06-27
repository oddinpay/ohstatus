import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import cf from "@sveltejs/adapter-cloudflare";

/** @type {import('@sveltejs/kit').Config} */
const adapterOptions = {
  precompress: true,
};

const config = {
  extensions: [".svelte", ".svx", ".md"],
  preprocess: [vitePreprocess()],

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    // Extract adapter options for maintainability
    adapter: cf(adapterOptions),

    alias: {
      $assets: "./src/lib/assets",
      $data: "./src/lib/data",
      $helpers: "./src/lib/helpers",
      $lib: "./src/lib",
    },
    csrf: {
      trustedOrigins: ["https://status.oddinpay.com"],
    },
  },
};

export default config;
