import { type Request, type Response } from "express";
import Joi from "joi";
import nodemailer from "nodemailer";

const contactSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().max(255).required(),
  subject: Joi.string().trim().min(3).max(150).required(),
  message: Joi.string().trim().min(10).max(1000).required(),
});

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_APP_PASSWORD,
      },
    });
  }

  return transporter;
}

export async function submitContactMessage(req: Request, res: Response) {
  try {
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0]?.message || "Invalid contact form data" });
    }

    const recipient = process.env.CONTACT_EMAIL;
    const appPassword = process.env.CONTACT_EMAIL_APP_PASSWORD;

    if (!recipient || !appPassword) {
      return res.status(500).json({ error: "Contact email is not configured on the server." });
    }

    await getTransporter().sendMail({
      from: `"FoodFinder Contact" <${recipient}>`,
      to: recipient,
      replyTo: `${value.name} <${value.email}>`,
      subject: `[FoodFinder] ${value.subject}`,
      text: [
        `Name: ${value.name}`,
        `Email: ${value.email}`,
        `Subject: ${value.subject}`,
        "",
        value.message,
      ].join("\n"),
      html: `
        <p><strong>Name:</strong> ${escapeHtml(value.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(value.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(value.subject)}</p>
        <hr />
        <p>${escapeHtml(value.message).replace(/\n/g, "<br />")}</p>
      `,
    });

    return res.status(200).json({ error: null, data: { success: true } });
  } catch (error) {
    console.error("submitContactMessage failed:", error);
    return res.status(500).json({ error: "Failed to send contact message." });
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
