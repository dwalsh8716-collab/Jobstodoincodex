import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  type: z.enum(["client", "candidate", "job"]).default("client"),
  name: z.string().trim().min(2, "Please add your name."),
  email: z.string().trim().email("Please add a valid email address."),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  linkedin: z.string().trim().optional(),
  briefType: z.string().trim().min(2, "Please choose an enquiry type."),
  message: z.string().trim().min(10, "Please add a little more detail."),
  consent: z.preprocess(
    (value) => (value === true ? "yes" : value),
    z.literal("yes", { errorMap: () => ({ message: "Consent is required." }) })
  ),
  website: z.string().optional(),
  jobTitle: z.string().trim().optional()
});

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

async function requestToObject(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as Record<string, unknown>;
  }

  return formDataToObject(await request.formData());
}

async function sendWithResend(payload: z.infer<typeof contactSchema>) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "website@essentialresourcing.co.uk";

  if (!apiKey || !to) {
    return { sent: false, reason: "Email delivery is not configured. Add RESEND_API_KEY and CONTACT_TO_EMAIL." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Essential Resourcing ${payload.type} enquiry from ${payload.name}`,
      text: [
        `Type: ${payload.type}`,
        payload.jobTitle ? `Job: ${payload.jobTitle}` : "",
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        payload.phone ? `Phone: ${payload.phone}` : "",
        payload.company ? `Company: ${payload.company}` : "",
        payload.linkedin ? `LinkedIn: ${payload.linkedin}` : "",
        `Brief type: ${payload.briefType}`,
        "",
        payload.message
      ]
        .filter(Boolean)
        .join("\n")
    })
  });

  if (!response.ok) {
    throw new Error("Email provider rejected the message.");
  }

  return { sent: true };
}

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await requestToObject(request));

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: parsed.error.errors[0]?.message || "Please check the form."
      },
      { status: 400 }
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true, message: "Thanks. Your enquiry has been received." });
  }

  try {
    const result = await sendWithResend(parsed.data);
    return NextResponse.json({
      ok: true,
      message: result.sent
        ? "Thanks. Your enquiry has been sent."
        : "Thanks. Your enquiry has been validated. Email delivery still needs to be configured before launch."
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "The form could not be sent."
      },
      { status: 502 }
    );
  }
}
