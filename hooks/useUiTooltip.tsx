"use client";

import { useEffect, useRef, useState } from 'react';

export function useUiTooltip() {
  const ref = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest('[data-tooltip]') as HTMLElement;
      if (!t) return;

      setText(t.dataset.tooltip || '');
      setShow(true);

      t.addEventListener(
        'mouseleave',
        () => setShow(false),
        { once: true }
      );
    };

    const onMove = (e: MouseEvent) => {
      if (!ref.current || !show) return;

      const tooltip = ref.current;
      const gap = 8;

      let left = e.clientX + 12;
      let top  = e.clientY + 12;

      const { innerWidth, innerHeight } = window;

      if (left + tooltip.offsetWidth > innerWidth - gap) {
        left = e.clientX - tooltip.offsetWidth - gap;
      }

      if (top + tooltip.offsetHeight > innerHeight - gap) {
        top = e.clientY - tooltip.offsetHeight - gap;
      }

      tooltip.style.left = `${left}px`;
      tooltip.style.top  = `${top}px`;
    };

    window.addEventListener('mouseover', onOver);
    window.addEventListener('mousemove', onMove);

    return () => {
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousemove', onMove);
    };
  }, [show]); // ← OK to keep, but listeners are stable

  return { ref, text, show };
}
