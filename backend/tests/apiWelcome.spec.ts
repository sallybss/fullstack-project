import { expect, test } from "@playwright/test";

test("api endpoint returns the router welcome message", async ({ request }) => {
  const response = await request.get("/api");
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body).toEqual({ message: "Welcome to the recipe-sharing API" });
});
