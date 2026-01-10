"use client";

import { useUiTooltip } from '@/hooks/useUiTooltip';

export default function UiTooltipPortal() {
  const { ref, text, show } = useUiTooltip();

  /*  don’t render at all until we have real dimensions  */
  if (!show) return null;

  return (
    <div
      ref={ref}
      className={`ui-tooltip visible`} /* we already know show === true here */
    >
      {text}
    </div>
  );
}