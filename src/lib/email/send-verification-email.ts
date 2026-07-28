import { resend } from "@/lib/resend";

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Synapse <onboarding@resend.dev>",
    to: [email],
    subject: "Verify your email for Synapse",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Thanks for signing up for Synapse. Click the link below to verify your email address and activate your account.</p>
        <p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px;">
            Verify email
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link expires in 24 hours. If you didn't create a Synapse account, you can ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}
