"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function signInAction(
    prevState: { error: string | null },
    formData: FormData,
) {
    try {
        const email = formData.get("email") as string | null;
        const password = formData.get("password") as string | null;
        const rememberMe = !!formData.get("remember");

        if (!email || !password) {
            return { error: "Email and password are required" };
        }

        await auth.api.signInEmail({
            body: { email, password, rememberMe },
        });

        redirect("/dashboard");
    } catch (error) {
        // Generic error message
        if (!(error instanceof Error)) {
            return { error: "Failed to sign in. Please try again later" };
        }

        // Rethrow redirect
        if (error.message.includes("NEXT_REDIRECT")) {
            throw error;
        }

        // Reword message from auth API
        if (
            error.message.includes(
                "API Error: UNAUTHORIZED Invalid email or password",
            )
        ) {
            return { error: "Invalid email or password" };
        }

        // Return the error message from auth API
        return { error: error.message };
    }
}
