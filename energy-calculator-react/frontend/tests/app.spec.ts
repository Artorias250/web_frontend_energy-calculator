import { test, expect } from "@playwright/test";

test("Плитка, фильтр, пустой результат и сохранение фильтра при переходах", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Каталог приборов" }),
  ).toBeVisible();
  await expect(page.locator(".appliance-card")).toHaveCount(6);
  await expect(page.getByRole("navigation").getByRole("link")).toHaveCount(2);
  await expect(
    page.getByRole("navigation").getByRole("button", { name: "Добавление" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("navigation").getByRole("button", { name: "Вход" }),
  ).toBeDisabled();
  const slider = page.getByRole("slider");
  await slider.focus();
  await slider.press("End");
  await page.getByRole("button", { name: "ОК", exact: true }).click();
  await expect(page.locator(".appliance-card")).toHaveCount(0);
  await expect(
    page.getByText("Приборы с такой мощностью не найдены.", { exact: false }),
  ).toBeVisible();
  await slider.press("Home");
  for (let i = 0; i < 20; i++) await slider.press("ArrowRight");
  await expect(slider).toHaveValue("1000");
  await page.getByRole("button", { name: "ОК", exact: true }).click();
  await expect(page.locator(".appliance-card")).toHaveCount(4);
  await page
    .getByRole("link", { name: "Открыть: Электрический чайник" })
    .click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Плитка" })
    .click();
  await expect(page.getByRole("slider")).toHaveValue("1000");
  await expect(page.locator(".appliance-card")).toHaveCount(4);
});

test("Лента: выбранный ID, раскрытие описания, следующий прибор и последний элемент", async ({
  page,
}) => {
  await page.goto("/appliances-feed/1");
  await expect(page.locator("video")).toHaveAttribute("autoplay", "");
  await page.getByRole("button", { name: "Ещё", exact: true }).click();
  await expect(page.getByRole("button", { name: "Меньше" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await page.getByRole("button", { name: "Далее", exact: true }).click();
  await expect(page).toHaveURL(/appliances-feed\/3$/);
  await expect(page.getByRole("heading", { name: "Утюг" })).toBeVisible();
  await page.goto("/appliances-feed/24");
  await expect(
    page.getByRole("button", { name: "Конец ленты" }),
  ).toBeDisabled();
  await page.goto("/appliances-feed/40");
  await expect(
    page.getByRole("heading", { name: "Прибор не найден" }),
  ).toBeVisible();
  await page.goto("/appliances-feed/999");
  await expect(
    page.getByRole("heading", { name: "Прибор не найден" }),
  ).toBeVisible();
});

test("Локальные фото/видео по умолчанию и восстановление после ошибки медиа", async ({
  page,
}) => {
  await page.goto("/appliances-catalog");
  const fallback = page.getByRole("link", {
    name: "Открыть: Резервный чайник",
  });
  await expect(fallback.locator("img")).toHaveAttribute(
    "src",
    "/media/default.png",
  );
  await fallback.click();
  await expect(page.locator("video")).toHaveAttribute(
    "src",
    "/media/default.mp4",
  );
  await page.route("**/media/kettle.png", (route) => route.abort());
  await page.goto("/appliances-catalog");
  await expect(
    page
      .getByRole("link", { name: "Открыть: Электрический чайник" })
      .locator("img"),
  ).toHaveAttribute("src", "/media/default.png");
  await page.route("**/media/flatiron.mp4", (route) => route.abort());
  await page.goto("/appliances-feed/3");
  await expect(page.locator("video")).toHaveAttribute(
    "src",
    "/media/default.mp4",
  );
});

test("Добавление по прямой ссылке: поля и локальный предпросмотр, без сохранения", async ({
  page,
}) => {
  await page.goto("/appliances-draft");
  await expect(
    page.getByRole("heading", { name: "Черновик прибора" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Опубликовать" }),
  ).toBeDisabled();
  await page.getByLabel("Название устройства").fill("Мой прибор");
  await page
    .getByLabel("Фотография", { exact: true })
    .setInputFiles({
      name: "preview.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6lS8AAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await expect(page.getByAltText("Предпросмотр фотографии")).toHaveAttribute(
    "src",
    /^blob:/,
  );
  await page.reload();
  await expect(page.getByLabel("Название устройства")).toHaveValue(
    "Черновой прибор",
  );
});

test("Три страницы: нет API-запросов, JS-ошибок и горизонтальной прокрутки", async ({
  page,
}) => {
  const apiRequests: string[] = [],
    errors: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/"))
      apiRequests.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of [
      "/appliances-catalog",
      "/appliances-feed/1",
      "/appliances-draft",
    ]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
  expect(apiRequests).toEqual([]);
  expect(errors).toEqual([]);
});
