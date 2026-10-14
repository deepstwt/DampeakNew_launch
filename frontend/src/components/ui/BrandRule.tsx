/**
 * The spectrum rule: the whole palette in one 6px band.
 *
 * It lives under the header and again where the quote section meets the
 * photograph below it. Both are places where two surfaces of nearly the same
 * brown meet, and no flat colour can be matched to a photographed one across a
 * whole width — the picture's own edge is darker at its corners than in its
 * middle, so a join that is invisible in the centre shows as a line at the
 * sides. The rule ends that argument: instead of hiding the seam, it states it.
 *
 * `middle` exists because the band in the middle always has to be the one that
 * contrasts with what the rule is sitting on. Under the header that is brand
 * brown against cocoa. Between two brown sections brand brown would vanish, so
 * it is cocoa there — the same family, one step lighter.
 */
export function BrandRule({
  middle = "bg-brown",
  className = "",
}: {
  middle?: "bg-brown" | "bg-cocoa";
  className?: string;
}) {
  return (
    <div className={`flex h-1.5 ${className}`} aria-hidden>
      <span className="flex-1 bg-yellow" />
      <span className="flex-1 bg-white" />
      <span className={`flex-1 ${middle}`} />
    </div>
  );
}
