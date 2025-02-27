import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { reactResetPasswordEmail } from "./email/reset-password";
// import { reactVerifyEmailEmail } from "./email/verify-email";
import { resend } from "./email/resend";
import { account, db, session, user, verification } from "../db";

const from = process.env.BETTER_AUTH_EMAIL || "delivered@resend.dev";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema: { account, session, user, verification },
    }),
    emailAndPassword: {
        enabled: true, // Enables email/password auth out of the box
        requireEmailVerification: !(process.env.VERIFY_EMAIL === "false"),
        async sendResetPassword({ user, url }) {
            await resend.emails.send({
                from,
                to: user.email,
                subject: "Reset your passwordd",
                text: `Hey ${user}, here is your password reset link: ${url}`,
                // Doesn't work with edge runtime atm.
                // See https://github.com/resend/react-email/issues/1630
                // react: reactResetPasswordEmail({
                //     username: user.name,
                //     resetLink: url,
                // }),
            });
        },
    },
    emailVerification: {
        async sendVerificationEmail({ user, url }) {
            await resend.emails.send({
                from,
                to: user.email,
                subject: "Verify your email address",
                text: `Hey ${user}, verify your email address, please: ${url}`,
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
