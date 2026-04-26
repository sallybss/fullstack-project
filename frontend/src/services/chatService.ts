const API_URL = import.meta.env.VITE_API_URL;

type ChatResponsePayload = {
  error: string | null;
  data?: {
    reply?: string;
  };
};

export async function sendChatMessage(message: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  const payload = (await response.json().catch(() => null)) as ChatResponsePayload | null;

  if (!response.ok) {
    throw new Error(payload?.error || "Failed to send chat message.");
  }

  const reply = payload?.data?.reply?.trim();
  if (!reply) {
    throw new Error("The assistant returned an empty response.");
  }

  return reply;
}
