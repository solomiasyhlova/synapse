import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { createVerificationToken } from "@/lib/auth/verification-token";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    try {
      const token = await createVerificationToken(email);
      await sendVerificationEmail(email, token);
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    return NextResponse.json(
      { success: true, data: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
