"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight, FaTelegramPlane } from "react-icons/fa";

type AuthState = "checking" | "authenticated" | "anonymous";

export default function BlondeFormulaCheckout({ priceLabel }: { priceLabel: string }) {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const data = (await response.json()) as { authenticated?: boolean };
      setAuthState(data.authenticated ? "authenticated" : "anonymous");
    } catch {
      setAuthState("anonymous");
      setMessage("Не удалось проверить вход. Обновите страницу и попробуйте снова.");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshSession(), 0);
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.data?.type !== "blonde-formula-telegram-login"
      ) {
        return;
      }
      if (event.data.success) {
        setMessage("Вход через Telegram подтверждён.");
        void refreshSession();
      } else {
        setMessage("Не удалось войти через Telegram. Попробуйте ещё раз.");
      }
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
    };
  }, [refreshSession]);

  function startTelegramLogin() {
    setMessage("");
    const popup = window.open(
      "/api/auth/telegram/start?popup=1",
      "blonde-formula-telegram-login",
      "popup=yes,width=520,height=680,resizable=yes,scrollbars=yes",
    );
    if (!popup) {
      const fallbackForm = document.createElement("form");
      fallbackForm.method = "GET";
      fallbackForm.action = "/api/auth/telegram/start?popup=0";
      document.body.append(fallbackForm);
      fallbackForm.submit();
    }
  }

  async function beginPayment() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/checkout/blonde-formula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = (await response.json()) as {
        action?: string;
        fields?: Record<string, string>;
        error?: string;
      };
      if (!response.ok || !data.action || !data.fields) {
        if (response.status === 401) setAuthState("anonymous");
        throw new Error(data.error ?? "Не удалось подготовить оплату.");
      }

      const paymentUrl = new URL(data.action);
      if (
        paymentUrl.protocol !== "https:" ||
        !["securesandbox.webpay.by", "payment.webpay.by"].includes(paymentUrl.hostname)
      ) {
        throw new Error("Получен недопустимый адрес платёжной страницы.");
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentUrl.toString();
      form.acceptCharset = "UTF-8";
      for (const [name, value] of Object.entries(data.fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.append(input);
      }
      document.body.append(form);
      form.submit();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось начать оплату. Попробуйте ещё раз.",
      );
      setBusy(false);
    }
  }

  return (
    <main className="checkout-page">
      <Link className="checkout-back-link" href="/#course">
        ← Вернуться к курсам
      </Link>
      <section className="checkout-panel" aria-labelledby="checkout-title">
        <p className="eyebrow eyebrow-burgundy">Повышение квалификации · Онлайн</p>
        <h1 id="checkout-title">BLONDE FORMULA</h1>
        <p className="checkout-description">Осветление бровей от А до Я · 8 видеоуроков · доступ навсегда</p>
        <p className="checkout-price">{priceLabel}</p>
        <p className="checkout-copy">
          Войдите через Telegram. После подтверждённой оплаты бот автоматически
          одобрит заявку на вступление в закрытый канал с курсом.
        </p>

        {authState === "checking" && (
          <p className="checkout-status" role="status">Проверяем вход через Telegram…</p>
        )}
        {authState === "anonymous" && (
          <button className="button button-burgundy checkout-action" type="button" onClick={startTelegramLogin}>
            <FaTelegramPlane aria-hidden="true" /> Войти через Telegram
          </button>
        )}
        {authState === "authenticated" && (
          <button className="button button-burgundy checkout-action" type="button" onClick={beginPayment} disabled={busy}>
            {busy ? "Готовим защищённую оплату…" : "Перейти к оплате"}
            {!busy && <FaArrowRight aria-hidden="true" />}
          </button>
        )}
        {message && <p className="checkout-status" role="status">{message}</p>}
        <p className="checkout-footnote">
          Данные карты вводятся только на защищённой странице WebPay.
        </p>
      </section>
    </main>
  );
}
