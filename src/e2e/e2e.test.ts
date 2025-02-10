import { test as base, expect } from "@playwright/test";
import { withWallets } from "w3wallets";

const test = withWallets(base, "polkadotJS");

test("Can connect Polkadot{.js} wallet and transfer native tokens", async ({page, polkadotJS}) => {
  const aliceSeed = "bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice";
  const bobAddress = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
  await polkadotJS.onboard(aliceSeed, "111111", "Alice");

  await page.bringToFront();
  await page.goto("http://localhost:3000");

  await page.getByRole('button', {name: "Connect Polkadot.js"}).click();

  await polkadotJS.selectAccount("Alice");
  await polkadotJS.approve();

  await expect(page.getByRole('radio', {name: "Alice"})).toBeChecked();
  
  await page.getByPlaceholder("Recipient Address").fill(bobAddress);
  await page.getByPlaceholder("Amount").fill("10");
  await page.getByRole('button', {name: "Send"}).click();

  await polkadotJS.enterPassword("111111")
  await polkadotJS.approve();

  await expect(page.getByText("Transaction success")).toBeVisible();
});
