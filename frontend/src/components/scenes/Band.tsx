import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";

/**
 * Section 4 — a full-bleed lifestyle photo, the soft-moment line over it.
 *
 * The tagline sits under the heading rather than beside it: at this type size a
 * second column of small text competes with the photograph instead of sitting
 * inside it.
 */
export function Band() {
  const { band } = site;

  return (
    <section className="relative min-h-[520px] w-full overflow-hidden md:min-h-[640px]">
      <Image
        src={band.image.src}
        alt={band.image.alt}
        fill
        sizes="100vw"
        className="object-cover"
      />
      {/* Heavier than a photo alone needs. Two levels of white type sit on it,
          and the small one is the one that has to survive a bright frame. */}
      <div className="absolute inset-0 bg-ink/55" />

      <div className="relative mx-auto flex min-h-[520px] max-w-[1440px] flex-col justify-end px-6 py-14 md:min-h-[640px] md:px-10 md:py-20">
        <h2 className="text-display max-w-[20ch] text-[11vw] text-white sm:text-[7vw] lg:text-[4.4vw]">
          {band.line}
        </h2>

        <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed font-semibold text-white/80 md:text-[19px]">
          {band.tagline}
        </p>

        <a
          href={band.cta.href}
          className="rounded-squish mt-9 inline-flex w-fit items-center gap-3 bg-white px-8 py-5 text-[17px] font-extrabold text-ink transition-transform active:scale-[0.97]"
        >
          {band.cta.label}
          <ArrowRight className="size-[18px]" strokeWidth={2.5} />
        </a>
      </div>
    </section>
  );
}
