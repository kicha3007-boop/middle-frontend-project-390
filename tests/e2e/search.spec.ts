import { expect, test } from "@playwright/test";

import { json, mockApi } from "./mockApi";

test("home page opens without errors and shows heading", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await mockApi(page);

  await page.goto("/");

  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();
  await expect(heading).not.toBeEmpty();
  expect(errors).toEqual([]);
});

test("home page shows flights for default search", async ({ page }) => {
  const log = await mockApi(page);

  await page.goto("/");

  await expect(page.getByTestId("flight-result-item")).toHaveCount(2);
  await expect(page.getByTestId("flight-results")).toContainText("SU1001");
  await expect(page.getByTestId("flight-results")).toContainText(/5\s400/);
  expect(log.flightQueries[0].get("origin")).toBe("MOW");
  expect(log.flightQueries[0].get("destination")).toBe("LED");
});

test("cities come from the API", async ({ page }) => {
  await mockApi(page);

  await page.goto("/");

  const options = page.getByTestId("search-origin").locator("option");
  await expect(options).toHaveText(["Москва", "Санкт-Петербург", "Сочи"]);
});

test("manual search sends selected city codes", async ({ page }) => {
  const log = await mockApi(page);
  await page.goto("/");
  await expect(page.getByTestId("flight-results")).toBeVisible();

  await page.getByTestId("search-origin").selectOption({ label: "Сочи" });
  await page.getByTestId("search-destination").selectOption({ label: "Москва" });
  await page.getByTestId("search-date").fill("2030-01-15");
  await page.getByTestId("search-passengers").fill("2");
  await page.getByTestId("search-submit").click();

  await expect.poll(() => log.flightQueries.length).toBe(2);
  const query = log.flightQueries[1];
  expect(query.get("origin")).toBe("AER");
  expect(query.get("destination")).toBe("MOW");
  expect(query.get("date")).toBe("2030-01-15");
  expect(query.get("passengers")).toBe("2");
  await expect(page.getByTestId("flight-result-item")).toHaveCount(2);
});

test("empty result shows a message", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");

  await page.getByTestId("search-origin").selectOption({ label: "Москва" });
  await page.getByTestId("search-destination").selectOption({ label: "Москва" });
  await page.getByTestId("search-submit").click();

  await expect(page.getByTestId("flights-empty")).toBeVisible();
  await expect(page.getByTestId("flight-results")).toBeHidden();
});

test("server error is shown instead of the list", async ({ page }) => {
  await mockApi(page, {
    flights: (route) => json(route, 500, { code: "internal", message: "Сбой поиска" }),
  });

  await page.goto("/");

  await expect(page.getByTestId("flights-error")).toContainText("Сбой поиска");
  await expect(page.getByTestId("flights-empty")).toBeHidden();
});

test("book button leads to the booking page of the flight", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");

  await page.getByTestId("book-flight").nth(1).click();

  await expect(page).toHaveURL(/\/booking\/fl_2$/);
  await expect(page.getByTestId("booking-flight")).toContainText("SU1002");
  await expect(page.getByTestId("booking-form")).toBeVisible();
});
