"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.08 });
    NProgress.start();
  }, [pathname, searchParams]);

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return (
    <style jsx global>{`
      /* bar colour */
      #nprogress .bar {
        background: linear-gradient(90deg, #ec4899, #8b5cf6);
        height: 3px;
        box-shadow: 0 0 10px rgba(236, 72, 153, 0.6);
      }
      /* remove default spinner */
      #nprogress .peg {
        display: none;
      }
    `}</style>
  );
}