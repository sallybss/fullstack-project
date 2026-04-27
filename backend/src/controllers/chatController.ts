import { type Request, type Response } from "express";
import Joi from "joi";
import OpenAI from "openai";

const chatSchema = Joi.object({
  message: Joi.string().trim().min(1).max(1000).required(),
});

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

function extractReplyText(response: OpenAI.Responses.Response): string {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const textParts = response.output
    .flatMap((item) => {
      if (item.type !== "message") {
        return [];
      }

      return item.content.flatMap((contentItem) => {
        if (contentItem.type !== "output_text") {
          return [];
        }

        return typeof contentItem.text === "string" ? [contentItem.text] : [];
      });
    })
    .map((part) => part.trim())
    .filter(Boolean);

  return textParts.join("\n\n");
}

export async function chatWithAssistant(req: Request, res: Response) {
  try {
    const { error, value } = chatSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0]?.message || "Message is required" });
    }

    const openai = getOpenAIClient();
    if (!openai) {
      console.error("chatWithAssistant failed: OpenAI API key is not configured.");
      return res.status(500).json({ error: "Something went wrong. Please try again later." });
    }

    const response = await openai.responses.create({
      model: "gpt-5-nano",
      reasoning: {
        effort: "minimal",
      },
      text: {
        verbosity: "low",
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are the FoodFinder assistant. Help users with recipes, cooking tips, ingredient substitutions, meal ideas, and simple kitchen guidance. Keep answers concise, practical, and friendly.",
            },
          ],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: value.message }],
        },
      ],
      max_output_tokens: 400,
    });

    const reply = extractReplyText(response);
    if (!reply) {
      console.error("chatWithAssistant received empty model response:", JSON.stringify(response, null, 2));
      return res.status(502).json({ error: "The assistant returned an empty response." });
    }

    return res.status(200).json({
      error: null,
      data: {
        reply,
      },
    });
  } catch (error) {
    console.error("chatWithAssistant failed:", error);
    return res.status(500).json({ error: "Failed to get chatbot response." });
  }
}
