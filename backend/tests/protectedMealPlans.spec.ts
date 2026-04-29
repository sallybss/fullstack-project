import { expect, test } from "@playwright/test";

test("protected meal-plan endpoint rejects requests without a token", async ({ request }) => {
  const response = await request.get("/api/meal-plans");
  const body = await response.json();

  expect(response.status()).toBe(401);
  expect(body.error).toBe("Access Denied. Missing token.");
});
