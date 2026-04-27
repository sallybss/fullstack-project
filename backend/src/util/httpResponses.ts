import { type Response } from "express";

export function sendInternalError(res: Response, logMessage: string, error: unknown): void {
  console.error(logMessage, error);
  res.status(500).json({ error: "Something went wrong. Please try again later." });
}
