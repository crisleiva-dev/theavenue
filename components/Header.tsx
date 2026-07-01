export default function Header({
  time,
  date,
}: {
  time: string;
  date: string;
}) {
  return (
    <header className="flex items-center justify-between pb-[10px]">
      <div className="flex items-center gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-24 h-24 rounded-full object-cover shrink-0"
          src="/avatar.jpg"
          alt="The Avenue"
        />
        <div>
          <div className="text-[1.5rem] font-bold tracking-[0.05em] uppercase leading-[1.1]">
            The Avenue Residence Portal
          </div>
          <div className="text-[1.15rem] text-muted mt-[6px]">
            Balaclava, Melbourne, Victoria
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[4.5rem] font-extralight leading-none tracking-[0.01em] tabular-nums">
          {time || "--:--:--"}
        </div>
        <div className="text-[1.4rem] text-ice mt-[10px]">
          {date || "Loading…"}
        </div>
      </div>
    </header>
  );
}
