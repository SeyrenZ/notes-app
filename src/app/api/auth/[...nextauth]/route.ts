import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Please provide NEXTAUTH_SECRET environment variable");
}

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("Please provide NEXT_PUBLIC_API_URL environment variable");
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("Attempting login with:", { email: credentials?.email });

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/nextauth/callback/credentials`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
              }),
            }
          );

          console.log("Response status:", response.status);
          const responseData = await response.json();
          console.log("Response data:", responseData);

          if (!response.ok) {
            throw new Error(responseData.detail || "Authentication failed");
          }

          // Ensure the response has the required user data
          if (!responseData.id || !responseData.email) {
            console.error("Invalid user data received:", responseData);
            throw new Error("Invalid user data received from server");
          }

          // Return the user object in the format NextAuth expects
          return {
            id: responseData.id,
            email: responseData.email,
            name: responseData.name || responseData.email,
            accessToken: responseData.access_token,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    verifyRequest: "/email-verification",
    newUser: "/register",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
      }

      // For Google auth
      if (account?.provider === "google") {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/nextauth/callback/google`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: account.providerAccountId,
                email: user?.email,
                name: user?.name,
                picture: user?.image,
              }),
            }
          );

          if (response.ok) {
            const userData = await response.json();
            token.id = userData.id;
            token.accessToken = userData.accessToken;
          } else {
            console.error("Failed to verify Google user with backend");
          }
        } catch (error) {
          console.error("Error during Google auth verification:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode
});

export { handler as GET, handler as POST };
