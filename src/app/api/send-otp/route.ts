import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Missing email or code" }, { status: 400 });
    }

    console.log(`[SKET-OK EMAIL SERVICE] Sending OTP ${code} to ${email}...`);

    const apiKey = process.env.RESEND_API_KEY || "";
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: "SKET-OK <onboarding@resend.dev>",
      to: [email],
      subject: `Kod weryfikacyjny SKET-OK: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #12161f; color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #7b72b5;">
          <h2 style="color: #9d8ec7; text-transform: uppercase; margin-bottom: 8px;">SKET-OK Odzyskiwanie Hasła</h2>
          <p style="color: #cccccc; font-size: 14px;">Twój kod weryfikacyjny do zmiany hasła dla konta <strong>${email}</strong>:</p>
          <div style="font-size: 36px; font-weight: bold; color: #f59e0b; letter-spacing: 6px; margin: 24px 0; background: #1a202c; padding: 15px 25px; border-radius: 12px; display: inline-block; border: 1px solid #f59e0b;">
            ${code}
          </div>
          <p style="color: #888888; font-size: 12px; margin-top: 20px;">Kod jest ważny przez 15 minut. Jeśli to nie Ty prosiłeś o zmianę, zignoruj tę wiadomość.</p>
        </div>
      `,
    });

    if (error) {
      console.error("[RESEND SDK ERROR]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log("[RESEND SDK SUCCESS]:", data);
    return NextResponse.json({ success: true, delivered: true, data });
  } catch (error) {
    console.error("Error in send-otp API:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
