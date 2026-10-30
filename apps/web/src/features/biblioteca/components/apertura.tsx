"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./apertura.module.css";

/** A persistent stage lets the actual selected cover survive route changes.
 * Only decorative clones leave React's tree; the reader remains interactive
 * as soon as its first page is ready. No dependency on View Transitions. */
export function AperturaLibro() {
  const router = useRouter();

  useEffect(() => {
    let stage: HTMLDivElement | null = null;
    let timers: number[] = [];
    let observer: MutationObserver | null = null;
    let animations: Animation[] = [];
    const clear = () => {
      timers.forEach(window.clearTimeout);
      timers = [];
      observer?.disconnect();
      observer = null;
      animations.forEach((animation) => animation.cancel());
      animations = [];
      stage?.remove();
      stage = null;
    };
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element)?.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || !url.pathname.startsWith("/biblioteca/leer/") || url.pathname === location.pathname) return;
      // The cover in the same article is used even when its text CTA is clicked.
      const cover = link.closest("article")?.querySelector<HTMLElement>("[data-book-cover]");
      if (!cover) return;
      event.preventDefault();
      event.stopPropagation();
      if (stage) return;

      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const rect = cover.getBoundingClientRect();
      stage = document.createElement("div");
      stage.className = styles.stage;
      stage.setAttribute("aria-hidden", "true");
      stage.dataset.reduced = String(reduced);
      const veil = document.createElement("div");
      veil.className = styles.veil;
      stage.append(veil);
      const book = document.createElement("div");
      book.className = styles.book;
      const width = Math.min(innerWidth * 0.39, innerHeight * 0.46, 370);
      const height = width * rect.height / rect.width;
      book.style.width = `${width}px`;
      book.style.height = `${height}px`;
      book.style.left = `${innerWidth / 2}px`;
      book.style.top = `${(innerHeight - height) / 2}px`;
      const back = document.createElement("div");
      back.className = styles.back;
      book.append(back);
      for (let i = 0; i < 5; i++) {
        const leaf = document.createElement("div");
        leaf.className = styles.leaf;
        leaf.style.setProperty("--leaf", String(i));
        book.append(leaf);
      }
      const front = document.createElement("div");
      front.className = styles.front;
      const clone = cover.cloneNode(true) as HTMLElement;
      clone.removeAttribute("id");
      clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
      front.append(clone);
      book.append(front);
      stage.append(book);
      for (let i = 0; i < 12; i++) {
        const star = document.createElement("span");
        star.className = styles.star;
        const angle = (i / 12) * Math.PI * 2;
        star.style.setProperty("--x", `${Math.cos(angle) * Math.min(innerWidth * 0.4, 390)}px`);
        star.style.setProperty("--y", `${Math.sin(angle) * Math.min(innerHeight * 0.37, 290)}px`);
        star.style.setProperty("--delay", `${480 + i * 22}ms`);
        stage.append(star);
      }
      document.body.append(stage);
      if (!reduced) {
        const sx = rect.width / width;
        const dx = rect.left - innerWidth / 2;
        const dy = rect.top - (innerHeight - height) / 2;
        animations.push(book.animate([
          { transform: `translate(${dx}px, ${dy}px) scale(${sx}) rotateZ(-3deg)` },
          { transform: "translate(-36%, -12px) scale(1.04) rotateZ(-7deg)", offset: 0.36 },
          { transform: "translate(0, 0) scale(1) rotateZ(0)", offset: 0.7 },
          { transform: "translate(0, 0) scale(1) rotateZ(0)" },
        ], { duration: 1150, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" }));
      }
      // Navigate under the opaque stage, then wait for the measured flipbook.
      later(() => router.push(url.pathname + url.search), reduced ? 60 : 380);
      later(() => {
        let finishing = false;
        const finish = () => {
          if (finishing || !stage) return;
          if (!document.querySelector('[data-reader-ready="true"]')) return;
          finishing = true;
          stage.dataset.leaving = "true";
          later(() => {
            clear();
            const reader = document.querySelector<HTMLElement>('[data-reader-ready="true"]');
            reader?.focus({ preventScroll: true });
          }, reduced ? 140 : 350);
        };
        observer = new MutationObserver(finish);
        observer.observe(document.body, { subtree: true, attributes: true, childList: true });
        finish();
      }, reduced ? 120 : 1300);
      // A failed navigation must never leave an unclosable curtain.
      later(clear, 6500);
    };
    const cancel = (event: KeyboardEvent) => { if (event.key === "Escape") clear(); };
    document.addEventListener("click", click, true);
    document.addEventListener("keydown", cancel);
    return () => {
      clear();
      document.removeEventListener("click", click, true);
      document.removeEventListener("keydown", cancel);
    };
  }, [router]);
  return null;
}
