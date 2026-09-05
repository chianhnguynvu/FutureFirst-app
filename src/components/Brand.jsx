import React from "react";
import { Image } from "@/components/ui/image";

export const BRAND_SYMBOL_URL = "https://media.base44.com/images/public/6a9bb7fcd1f66f2fc54c3e8b/f89296fd5_Logo3Symboltransparent.png";
export const BRAND_HORIZONTAL_URL = "https://media.base44.com/images/public/6a9bb7fcd1f66f2fc54c3e8b/06a9a2fd0_Logo1Horizontal.png";
export const BRAND_APP_ICON_URL = "https://media.base44.com/images/public/6a9bb7fcd1f66f2fc54c3e8b/64450875f_Logo2Appiconlight.png";

export function BrandMark({ className = "w-9 h-9" }) {
  return (
    <Image
      src={BRAND_SYMBOL_URL}
      alt="FutureFirst"
      fittingType="fit"
      className={`${className} shrink-0`}
    />
  );
}

export default function Brand({ showTagline = false, size = "md" }) {
  const width = size === "lg" ? "w-56" : "w-40";
  return (
    <div className="flex flex-col items-start gap-1">
      <Image
        src={BRAND_HORIZONTAL_URL}
        alt="FutureFirst — Volunteer Today. Change Future"
        fittingType="fit"
        originWidth={1024}
        originHeight={300}
        className={`${width} h-auto`}
      />
      {showTagline && (
        <p className="text-xs text-muted-foreground">Volunteer Today. Change Future</p>
      )}
    </div>
  );
}