"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/#course");
    }
  }

  return (
    <button className="checkout-back-link checkout-back-button" type="button" onClick={goBack}>
      ← Назад
    </button>
  );
}
