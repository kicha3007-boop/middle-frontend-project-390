import { expect, type Page, test } from "@playwright/test";

import { json, mockApi } from "./mockApi";

const fillContactAndFirstPassenger = async (page: Page): Promise<void> => {
  await page.getByTestId("contact-email").fill("ivan@example.com");
  await page.getByTestId("contact-phone").fill("+79990001122");
  await page.getByTestId("passenger-0-firstName").fill("Иван");
  await page.getByTestId("passenger-0-lastName").fill("Петров");
  await page.getByTestId("passenger-0-dob").fill("1990-05-12");
  await page.getByTestId("passenger-0-document").fill("4509123456");
};

test("direct link opens the booking form with the flight", async ({ page }) => {
  await mockApi(page);

  await page.goto("/booking/fl_1");

  await expect(page.getByTestId("booking-flight")).toContainText("SU1001");
  await expect(page.getByTestId("booking-form")).toBeVisible();
});

test("unknown flight shows not found state", async ({ page }) => {
  await mockApi(page);

  await page.goto("/booking/NOPE");

  await expect(page.getByTestId("flight-not-found")).toBeVisible();
  await expect(page.getByTestId("booking-form")).toBeHidden();
});

test("empty required fields block submission", async ({ page }) => {
  const log = await mockApi(page);
  await page.goto("/booking/fl_1");

  await page.getByTestId("booking-submit").click();

  await expect(page.getByText("Укажите email")).toBeVisible();
  await expect(page.getByText("Заполните поле «Фамилия»")).toBeVisible();
  await expect(page.getByTestId("booking-code")).toBeHidden();
  expect(log.createdBookings).toHaveLength(0);
});

test("successful booking shows the booking code", async ({ page }) => {
  const log = await mockApi(page);
  await page.goto("/booking/fl_1");

  await fillContactAndFirstPassenger(page);
  await page.getByTestId("booking-submit").click();

  await expect(page.getByTestId("booking-success")).toBeVisible();
  await expect(page.getByTestId("booking-code")).toHaveText(/^[A-Z0-9]{6}$/);
  expect(log.createdBookings).toHaveLength(1);
  expect(log.createdBookings[0]).toMatchObject({
    flightId: "fl_1",
    contact: { email: "ivan@example.com", phone: "+79990001122" },
    passengers: [{ lastName: "Петров", dateOfBirth: "1990-05-12" }],
  });
});

test("added passenger is sent with the booking", async ({ page }) => {
  const log = await mockApi(page);
  await page.goto("/booking/fl_1");

  await fillContactAndFirstPassenger(page);
  await page.getByTestId("add-passenger").click();
  await page.getByTestId("passenger-1-firstName").fill("Мария");
  await page.getByTestId("passenger-1-lastName").fill("Петрова");
  await page.getByTestId("passenger-1-dob").fill("1992-03-04");
  await page.getByTestId("passenger-1-document").fill("4509654321");
  await page.getByTestId("booking-submit").click();

  await expect(page.getByTestId("booking-success")).toContainText(/10\s800/);
  expect(log.createdBookings[0].passengers).toHaveLength(2);
});

test("server validation error is shown", async ({ page }) => {
  await mockApi(page, {
    createBooking: (route) =>
      json(route, 400, { code: "validation_error", message: "Некорректный email" }),
  });
  await page.goto("/booking/fl_1");

  await fillContactAndFirstPassenger(page);
  await page.getByTestId("booking-submit").click();

  await expect(page.getByTestId("booking-error")).toContainText("Некорректный email");
  await expect(page.getByTestId("booking-form")).toBeVisible();
});
