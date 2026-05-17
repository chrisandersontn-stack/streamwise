import Script from "next/script";
import { PLAUSIBLE_SCRIPT_SRC, isPlausibleEnabled } from "@/lib/plausible";

const PLAUSIBLE_INIT = `
window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
plausible.init()
`.trim();

export function PlausibleAnalytics() {
  if (!isPlausibleEnabled()) return null;

  return (
    <>
      <Script src={PLAUSIBLE_SCRIPT_SRC} strategy="afterInteractive" />
      <Script id="plausible-init" strategy="afterInteractive">
        {PLAUSIBLE_INIT}
      </Script>
    </>
  );
}
