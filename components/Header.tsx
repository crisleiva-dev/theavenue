export default function Header({
  time,
  date,
}: {
  time: string;
  date: string;
}) {
  // "19:07:21" -> hours and minutes lead, seconds stay quiet.
  const hm = time ? time.slice(0, 5) : "--:--";
  const ss = time ? time.slice(5) : ":--";

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-24 h-24 rounded-full object-cover shrink-0"
          src="/avatar.jpg"
          alt="The Avenue"
        />
        <div className="flex flex-col gap-2">
          <div className="text-[2rem] font-medium leading-none text-ink">
            The Avenue Residence Portal
          </div>
          <div className="text-[1.25rem] leading-none text-soft">
            Balaclava, Melbourne, Victoria
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3">
        <div className="text-[4.5rem] font-light leading-none tabular-nums text-ink">
          {hm}
          <span className="text-muted">{ss}</span>
        </div>
        <div className="text-[1.375rem] leading-none text-soft">
          {date || "Loading…"}
        </div>
      </div>
    </header>
  );
}
