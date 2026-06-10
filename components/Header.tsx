export default function Header({
  time,
  date,
}: {
  time: string;
  date: string;
}) {
  return (
    <header className="flex items-end justify-between pb-[22px] border-b border-line">
      <div className="flex items-center gap-[18px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-16 h-16 rounded-full object-cover shrink-0"
          src="/avatar.jpg"
          alt="The Avenue"
        />
        <div>
          <div className="text-[1.45rem] font-bold tracking-[0.05em] uppercase leading-[1.1]">
            The Avenue Residence Portal
          </div>
          <div className="text-[0.88rem] text-muted mt-[3px]">
            Balaclava, Melbourne, Victoria
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[4rem] font-extralight leading-none tracking-[0.01em] tabular-nums">
          {time || "--:--:--"}
        </div>
        <div className="text-[1.2rem] text-ice mt-[6px]">
          {date || "Loading…"}
        </div>
      </div>
    </header>
  );
}
