import NextAuth, { AuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs"; 
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

// Custom Type สำหรับ Session ให้รองรับ user.id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("❌ Missing Google OAuth credentials in .env file");
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john@doe.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอก Email และ Password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password || !(await bcrypt.compare(credentials.password, user.password))) {
          throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = Number(user.id); // แปลง id เป็น Number (ให้ตรงกับ Prisma)
        token.picture = user.image; // เพิ่ม image เข้า token
      }
      return token;
    },
    
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = String(token.id); //แปลง id กลับเป็น String
        session.user.image = token.picture; //เพิ่ม image เข้า session
      }
      return session;
    },
  },
  
};

// API Route Handler ที่รองรับ TypeScript
const handler = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);

export { handler as GET, handler as POST };
