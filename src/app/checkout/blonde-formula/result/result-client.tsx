"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

type PaymentStatus =
  | "pending_payment"
  | "paid"
  | "access_pending"
  | "access_granted"
  | "payment_failed"
  | "expired"
  | "refunded"
  | "chargeback";

type OrderResponse = {
  status: PaymentStatus;
  accessReady: boolean;
  inviteUrl: string | null;
};

export default function BlondeFormulaResult({
  siteOrderId,
  transactionId,
  cancelled,
}: {
  siteOrderId: string;
  transactionId?: string;
  cancelled: boolean;
}) {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    try {
      const query = transactionId
        ? `?wsb_tid=${encodeURIComponent(transactionId)}`
        : "";
      const response = await fetch(
        `/api/checkout/orders/${encodeURIComponent(siteOrderId)}${query}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as OrderResponse & { error?: string };
      if (!response.ok) {
        setMessage(data.error ?? "Не удалось проверить заказ.");
        return;
      }
      setOrder(data);
      setMessage("");
      if (data.inviteUrl) window.location.assign(data.inviteUrl);
    } catch {
      setMessage("Не удалось связаться с сайтом. Проверка оплаты продолжится автоматически.");
    }
  }, [siteOrderId, transactionId]);

  useEffect(() => {
    const firstCheck = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => void refresh(), 5_000);
    return () => {
      window.clearTimeout(firstCheck);
      window.clearInterval(timer);
    };
  }, [refresh]);

  const status = order?.status;
  const waiting = status === "pending_payment" || !status;
  const accessPreparing = status === "paid" || status === "access_pending";
  const terminal =
    status === "payment_failed" ||
    status === "expired" ||
    (cancelled && waiting);

  return (
    <main className="checkout-page">
      <section className="checkout-panel checkout-result" aria-labelledby="result-title" aria-live="polite">
        <p className="eyebrow eyebrow-burgundy">BLONDE FORMULA</p>
        <h1 id="result-title">
          {order?.accessReady || status === "access_granted"
            ? "Оплата подтверждена"
            : accessPreparing
              ? "Готовим доступ к курсу"
              : waiting
                ? "Проверяем оплату"
                : terminal
                  ? "Оплата не завершена"
                  : status === "refunded" || status === "chargeback"
                    ? "Доступ к курсу отозван"
                    : "Проверяем заказ"}
        </h1>

        {(waiting || !order) && (
          <p className="checkout-copy">
            WebPay отправляет подтверждение отдельно от возврата на сайт. Дождитесь
            проверки — доступ появится после подтверждения сервером.
          </p>
        )}
        {accessPreparing && (
          <p className="checkout-copy">
            Платёж подтверждён. Создаём персональную ссылку и передаём вас в Telegram.
          </p>
        )}
        {(order?.accessReady || status === "access_granted") && !order?.inviteUrl && (
          <p className="checkout-copy">Доступ к курсу уже выдан вашему Telegram-аккаунту.</p>
        )}
        {terminal && (
          <>
            <p className="checkout-copy">
              Заказ не отмечается оплаченным без подтверждения WebPay. Вы можете
              проверить заказ ещё раз или начать оформление заново.
            </p>
            <button className="button button-burgundy checkout-action" type="button" onClick={() => void refresh()}>
              Проверить снова <FaArrowRight aria-hidden="true" />
            </button>
            <Link className="checkout-retry-link" href="/checkout/blonde-formula">Начать оформление заново</Link>
          </>
        )}
        {(status === "refunded" || status === "chargeback") && (
          <p className="checkout-copy">Если это ошибка, свяжитесь с владельцем курса.</p>
        )}
        {message && <p className="checkout-status" role="status">{message}</p>}
        {waiting && (
          <button className="checkout-refresh" type="button" onClick={() => void refresh()}>
            Проверить статус
          </button>
        )}
        <p className="checkout-footnote">Номер заказа: {siteOrderId}</p>
      </section>
    </main>
  );
}
