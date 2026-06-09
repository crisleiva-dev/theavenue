interface NewsItem {
  title: string;
  content: React.ReactNode;
}

const NEWS_ITEMS: NewsItem[] = [
  {
    title: "Lift Repair Works",
    content:
      "Residents are advised that the lift is out of service for safety reasons while the Owners Corporation awaits a report from Kone (Fuji). Please use the stairwell. We apologise for the inconvenience and will provide updates as available.",
  },
  {
    title: "Next Hard Rubbish Collection Day",
    content: "TBC",
  },
  {
    title: "Horizon Contact",
    content: (
      <>
        Horizon Strata Management Group
        <br />
        03 9687 7788
        <br />
        info@horizonstrata.com.au
      </>
    ),
  },
];

export default function NewsCard() {
  return (
    <div className="bg-surface border border-line rounded-card p-[28px_32px] flex flex-col gap-4 min-h-0 overflow-hidden">
      <div className="text-[0.85rem] uppercase tracking-[0.12em] text-muted shrink-0">
        News Feed
      </div>
      <div className="grid grid-cols-3 gap-[10px] flex-1 min-h-0">
        {NEWS_ITEMS.map((item, i) => (
          <div
            key={i}
            className="bg-tile rounded-[14px] p-[18px_22px] flex flex-col gap-3 overflow-hidden"
          >
            <div className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-teal">
              {item.title}
            </div>
            <div className="text-[0.95rem] text-ice leading-[1.5] overflow-hidden">
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
