import BlondeFormulaResult from "./result-client";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function BlondeFormulaResultPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawOrderId = params.orderId ?? params.wsb_order_num;
  const siteOrderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  const rawTransactionId = params.wsb_tid;
  const transactionId = Array.isArray(rawTransactionId)
    ? rawTransactionId[0]
    : rawTransactionId;
  const rawCancelled = params.cancelled;
  const cancelled = rawCancelled === "1" || (Array.isArray(rawCancelled) && rawCancelled[0] === "1");

  if (!siteOrderId || !/^[A-Za-z0-9_-]{1,64}$/.test(siteOrderId)) {
    return (
      <main className="checkout-page">
        <section className="checkout-panel" aria-labelledby="result-title">
          <p className="eyebrow eyebrow-burgundy">BLONDE FORMULA</p>
          <h1 id="result-title">Не удалось найти заказ</h1>
          <p className="checkout-copy">Вернитесь к курсу и начните оформление заново.</p>
          <Link className="button button-burgundy checkout-action" href="/checkout/blonde-formula">
            Перейти к оформлению <FaArrowRight aria-hidden="true" />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <BlondeFormulaResult
      siteOrderId={siteOrderId}
      transactionId={transactionId && /^\d+$/.test(transactionId) ? transactionId : undefined}
      cancelled={cancelled}
    />
  );
}
