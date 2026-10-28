import { expect, type Page, test } from "@playwright/test";

import { existingBooking, mockApi } from "./mockApi";

const openLookup = async (page: Page): Promise<void> => {
  await page.goto("/");
  await page.getByTestId("nav-lookup").click();
  await expect(page.getByTestId("booking-lookup-form")).toBeVisible();
};

const findBooking = async (page: Page, code: string, lastName: string): Promise<void> => {
  await page.getByTestId("lookup-code").fill(code);
  await page.getByTestId("lookup-lastName").fill(lastName);
  await page.getByTestId("lookup-submit").click();
};

test("navigation link opens the lookup screen", async ({ page }) => {
  await mockApi(page);

  await openLookup(page);

  await expect(page).toHaveURL(/\/lookup$/);
});

test("existing booking is displayed", async ({ page }) => {
  await mockApi(page);
  await openLookup(page);

  await findBooking(page, existingBooking.code, "Петров");

  const details = page.getByTestId("booking-details");
  await expect(details).toBeVisible();
  await expect(page.getByTestId("booking-code")).toHaveText(existingBooking.code);
  await expect(page.getByTestId("booking-status")).toHaveAttribute("data-status", "confirmed");
  await expect(details).toContainText("Петров Иван");
  await expect(details).toContainText("SU1001");
  await expect(details).toContainText(/5\s400/);
});

test("wrong code or last name shows not found", async ({ page }) => {
  await mockApi(page);
  await openLookup(page);

  await findBooking(page, "ZZZZZZ", "Никтоев");

  await expect(page.getByTestId("booking-not-found")).toBeVisible();
  await expect(page.getByTestId("booking-details")).toBeHidden();
});

test("empty lookup fields are not submitted", async ({ page }) => {
  await mockApi(page);
  await openLookup(page);

  await page.getByTestId("lookup-submit").click();

  await expect(page.getByText("Укажите код бронирования")).toBeVisible();
  await expect(page.getByText("Укажите фамилию пассажира")).toBeVisible();
});

test("booking can be cancelled", async ({ page }) => {
  await mockApi(page);
  await openLookup(page);
  await findBooking(page, existingBooking.code, "Петров");

  await page.getByTestId("cancel-booking").click();

  await expect(page.getByTestId("booking-status")).toHaveAttribute("data-status", "cancelled");
  await expect(page.getByTestId("cancel-booking")).toBeHidden();
});
