import BlondeFormulaCheckout from "./checkout-client";
import { getWebPayConfiguration } from "@/lib/webpay";

export const dynamic = "force-dynamic";

export default function BlondeFormulaCheckoutPage() {
  let priceLabel = "Оплата временно недоступна";
  try {
    const { amount, currency } = getWebPayConfiguration();
    priceLabel = `${new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: amount.endsWith(".00") ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(Number(amount))} ${currency}`;
  } catch {
    // Keep checkout accessible to show the Telegram login and a clear setup state.
  }

  return <BlondeFormulaCheckout priceLabel={priceLabel} />;
}
