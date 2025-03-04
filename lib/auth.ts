import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { reactResetPasswordEmail } from "./email/reset-password";
// import { reactVerifyEmailEmail } from "./email/verify-email";
import { resend } from "./email/resend";
import { hash, verify } from "./auth-hasher";
import { account, db, session, user, verification } from "../db";

const from = process.env.BETTER_AUTH_EMAIL || "delivered@resend.dev";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema: { account, session, user, verification },
    }),
    plugins: [nextCookies()],
    emailAndPassword: {
        enabled: true, // Enables email/password auth out of the box
        requireEmailVerification: !(process.env.VERIFY_EMAIL === "false"),
        async sendResetPassword({ user, url }) {
            await resend.emails.send({
                from,
                to: user.email,
                subject: "Reset your password",
                text: `Hey ${user.name}, here is your password reset link: ${url}`,
                // Doesn't work with edge runtime atm.
                // See https://github.com/resend/react-email/issues/1630
                // react: reactResetPasswordEmail({
                //     username: user.name,
                //     resetLink: url,
                // }),
            });
        },
        // Custom hasher to avoid hitting CPU limit
        password: { hash, verify },
    },
    emailVerification: {
        async sendVerificationEmail({ user, url }) {
            await resend.emails.send({
                from,
                to: user.email,
                subject: "Verify your email address",
                text: `Hey ${user.name}, verify your email address, please: ${url}`,
                // Doesn't work with edge runtime atm.
                // See https://github.com/resend/react-email/issues/1630
                // react: reactVerifyEmailEmail({
                //     username: user.name,
                //     verificationLink: url,
                // }),
            });
        },
    },
});

export const baseURL =
    process.env.NODE_ENV === "development"
        ? process.env.BETTER_AUTH_URL || "http://localhost:3000"
        : process.env.BETTER_AUTH_URL ||
          process.env.CF_PAGES_URL ||
          process.env.VERCEL_URL ||
          process.env.NEXT_PUBLIC_APP_URL;
