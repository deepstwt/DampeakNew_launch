import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";

/** A full-bleed photo, one line over it. Nothing else. */
export function Band() {
  const { band } = site;

  return (
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden md:h-[80vh]">
      <Image
        src={band.image.src}
        alt={band.image.alt}
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-ink/45" />

      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-6 pb-12 md:px-10 md:pb-16">
        <h2 className="text-display max-w-[18ch] text-[11vw] text-white sm:text-[7vw] lg:text-[4.6vw]">
          {band.line}
        </h2>
        <a
          href={band.cta.href}
          className="rounded-squish mt-8 inline-flex w-fit items-center gap-3 bg-white px-8 py-5 text-[17px] font-extrabold text-ink transition-transform active:scale-[0.97]"
        >
          {band.cta.label}
          <ArrowRight className="size-[18px]" strokeWidth={2.5} />
        </a>
      </div>
    </section>
  );
}
