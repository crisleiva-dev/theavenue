// TV dashboard — iframe shell wrapper.
// Outer shell page that NEVER reloads. Inner iframe refreshes every 60s.
//
// CRITICAL: this page sits inside the (tv) route group's minimal layout,
// which provides <html> and <body>. We MUST NOT return <html> here — that
// would create invalid nested HTML, which crashed the Philips WebView.

export const runtime = "nodejs";

export default function TvShellPage() {
  return (
    <>
      <iframe
        id="dashboard"
        src="/tv/content"
        style={{
          width: "100vw",
          height: "100vh",
          border: 0,
          display: "block",
          background: "#0C111D",
          margin: 0,
          padding: 0,
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var counter = 1;
              setInterval(function() {
                var iframe = document.getElementById('dashboard');
                if (iframe) {
                  iframe.src = '/tv/content?r=' + counter;
                  counter++;
                }
              }, 60000);
            })();
          `,
        }}
      />
    </>
  );
}
