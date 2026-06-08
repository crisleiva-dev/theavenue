// TV-friendly dashboard — iframe shell wrapper.
//
// PROBLEM: Basic Android WebView (Philips signage) goes white after meta-refresh
// fires a few times. The WebView state gets corrupted on full page reloads.
//
// SOLUTION: Outer page is a minimal iframe shell that NEVER reloads. The iframe
// inside reloads its content via a tiny JS setInterval that forces src reload.
// This isolates the WebView state corruption to the iframe — even if it fails,
// the parent page persists and can force a recovery.

export const runtime = "nodejs";

export default function TvShellPage() {
  return (
    <html>
      <head>
        <title>The Avenue Residence Portal</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          overflow: "hidden",
          background: "#0C111D",
          width: "100vw",
          height: "100vh",
        }}
      >
        <iframe
          id="dashboard"
          src="/tv/content"
          style={{
            width: "100vw",
            height: "100vh",
            border: 0,
            display: "block",
            background: "#0C111D",
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force iframe reload every 60s — works on basic Android WebView
              // because the OUTER page never reloads (no state corruption).
              // Cache-bust via query parameter to ensure fresh content.
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
      </body>
    </html>
  );
}
