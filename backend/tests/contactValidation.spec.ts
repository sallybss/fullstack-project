import { expect, test } from "@playwright/test";

test("contact endpoint rejects an invalid contact message", async ({ request }) => {
  const response = await request.post("/api/contact", {
    data: {
      name: "A",
      email: "not-an-email",
      subject: "Hi",
      message: "Too short",
    },
  });
  const body = await response.json();

  expect(response.status()).toBe(400);
  expect(body.error).toBeTruthy();
});
