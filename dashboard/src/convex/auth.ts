import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      authorization: {
        params: {
          hd: process.env.DOMAIN,
        },
      },

      profile(profile) {
        const allowedDomain = `@${process.env.DOMAIN}`;

        if (!profile.email || !profile.email.endsWith(allowedDomain)) {
          throw new Error("Unauthorized domain");
        }

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
});
