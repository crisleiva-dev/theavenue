// TV-friendly "lite" dashboard — instant static HTML.
//
// NO server-side async operations. Page returns immediately (< 1ms).
// Client-side JS fetches data and updates the DOM without full-page reload.
// This prevents TV from timing out or going blank.

export const runtime = "nodejs";

export default function TvPage() {
  return (
    <html>
      <head>
        <title>The Avenue Residence Portal</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 1920px;
            height: 1080px;
            background: #0C111D;
            color: #EEF2FF;
            font-family: Arial, Helvetica, sans-serif;
            padding: 20px 36px 18px 36px;
            overflow: hidden;
          }
          .header { border-bottom: 1px solid #1f2433; padding-bottom: 22px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-end; }
          .brand h1 { font-size: 28px; font-weight: 700; letter-spacing: 0.05em; margin: 0; }
          .clock { text-align: right; }
          .clock-time { font-size: 68px; font-weight: 300; line-height: 1; font-variant-numeric: tabular-nums; }
          .clock-date { font-size: 20px; color: #ecfeff; margin-top: 6px; }
          .main { display: flex; gap: 16px; margin-bottom: 8px; flex: 1; }
          .card { background: #141927; border: 1px solid #1f2433; border-radius: 20px; padding: 28px 32px; overflow-y: auto; }
          .weather-card { flex: 1.6; }
          .trains-card { flex: 1; }
          .section-label { font-size: 13px; text-transform: uppercase; letter-spacing: 0.2em; color: #64748B; margin-bottom: 16px; }
          .footer { border-top: 1px solid #1f2433; padding-top: 14px; margin-top: 8px; font-size: 13px; color: #64748B; display: flex; justify-content: space-between; }
          .status { display: inline-flex; align-items: center; gap: 4px; background: #dcfce7; color: #116932; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }
          .dot { width: 6px; height: 6px; background: #116932; border-radius: 50%; }
        `}</style>
      </head>
      <body>
        <div className="header">
          <div className="brand">
            <h1>The Avenue Residence Portal</h1>
            <div style={{ fontSize: "16px", color: "#64748B", marginTop: "6px" }}>
              Melbourne, Victoria
            </div>
          </div>
          <div className="clock">
            <div className="clock-time" id="time">--:--:--</div>
            <div className="clock-date" id="date">Loading…</div>
          </div>
        </div>

        <div className="main">
          <div className="card weather-card" id="weather-card">
            <div className="section-label">Currently</div>
            <div style={{ fontSize: "96px", fontWeight: 300 }}>--°</div>
            <div style={{ fontSize: "20px", color: "#64748B", marginTop: "16px" }}>
              Offline — check connection
            </div>
          </div>
          <div className="card trains-card" id="trains-card">
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className="section-label" style={{ margin: 0 }}>Next Trains</span>
              <span className="status"><span className="dot"></span> Live</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "6px" }}>
              Balaclava Station
            </div>
            <div style={{ fontSize: "15px", color: "#64748B", marginTop: "4px" }}>
              Sandringham → Towards city
            </div>
            <div style={{ marginTop: "22px", fontSize: "16px", color: "#64748B" }}>
              Loading departures…
            </div>
          </div>
        </div>

        <div className="footer">
          <div>
            TV mode · Weather: Open-Meteo · Trains: Transport Victoria GTFS Realtime
          </div>
          <div id="refresh-time">Loading…</div>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Update clock every second
              setInterval(() => {
                const now = new Date();
                document.getElementById('time').textContent = now.toLocaleTimeString('en-AU', { hour12: false });
                document.getElementById('date').textContent = now.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                document.getElementById('refresh-time').textContent = 'Last refresh: ' + now.toLocaleTimeString('en-AU', { hour12: false }).slice(0, 5);
              }, 1000);

              // Fetch trains and weather every 30 seconds
              async function updateData() {
                try {
                  // Fetch trains
                  const trainsResp = await fetch('/api/trains');
                  const trains = trainsResp.ok ? await trainsResp.json() : [];

                  // Fetch weather
                  const weatherResp = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-37.8136&longitude=144.9631&current=temperature_2m,weather_code,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Australia/Melbourne');
                  const weather = weatherResp.ok ? await weatherResp.json() : null;

                  // Update weather card
                  if (weather && weather.current) {
                    const c = weather.current;
                    const day = weather.daily;
                    const wmos = { 0: '☀️ Clear', 1: '🌤️ Partly Cloudy', 2: '☁️ Cloudy', 3: '☁️ Overcast', 45: '🌫️ Foggy', 48: '🌫️ Foggy', 51: '🌧️ Drizzle', 53: '🌧️ Drizzle', 55: '🌧️ Drizzle', 61: '🌧️ Rain', 63: '🌧️ Rain', 65: '🌧️ Rain', 71: '❄️ Snow', 73: '❄️ Snow', 75: '❄️ Snow', 77: '❄️ Snow', 80: '🌧️ Showers', 81: '🌧️ Showers', 82: '🌧️ Showers', 85: '❄️ Snow', 86: '❄️ Snow', 95: '⛈️ Thunderstorm', 96: '⛈️ Thunderstorm', 99: '⛈️ Thunderstorm' };
                    const [icon, desc] = (wmos[c.weather_code] || '🌡️ Unknown').split(' ');
                    document.getElementById('weather-card').innerHTML = '<div style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.2em; color: #64748B; margin-bottom: 16px;">Currently</div><div style="display: flex; gap: 20px; align-items: flex-start;"><div style="font-size: 180px; font-weight: 300; line-height: 0.88; font-variant-numeric: tabular-nums;">' + Math.round(c.temperature_2m) + '°</div><div style="flex: 1;"><div style="font-size: 48px; margin-bottom: 10px;">' + icon + '</div><div style="font-size: 32px; margin-bottom: 12px;">' + desc + '</div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;"><div style="background: #1a1f2e; padding: 10px; border-radius: 8px;"><div style="font-size: 11px; color: #64748B; text-transform: uppercase;">Max</div><div style="font-size: 28px; color: #ecfeff; font-weight: bold; margin-top: 4px;">' + Math.round(day.temperature_2m_max[0]) + '°</div></div><div style="background: #1a1f2e; padding: 10px; border-radius: 8px;"><div style="font-size: 11px; color: #64748B; text-transform: uppercase;">Min</div><div style="font-size: 28px; color: #ecfeff; font-weight: bold; margin-top: 4px;">' + Math.round(day.temperature_2m_min[0]) + '°</div></div></div></div></div>';
                  }

                  // Update trains card
                  if (trains.length > 0) {
                    let trainsHtml = '<div style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.2em; color: #64748B; margin-bottom: 16px; display: flex; gap: 8px; align-items: center;"><span>Next Trains</span><span style="display: inline-flex; align-items: center; gap: 4px; background: #dcfce7; color: #116932; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px;"><span style="width: 6px; height: 6px; background: #116932; border-radius: 50%;"></span>Live</span></div><div style="font-size: 28px; font-weight: 700; margin-top: 6px;">Balaclava Station</div><div style="font-size: 15px; color: #64748B; margin-top: 4px;">Sandringham → Towards city</div><div style="margin-top: 22px;">';
                    for (let i = 0; i < Math.min(3, trains.length); i++) {
                      const t = trains[i];
                      trainsHtml += '<div style="background: #1a1f2e; padding: 20px; border-left: 12px solid #06b6d4; margin-bottom: 14px;"><div style="font-size: 20px; font-weight: 700;">To ' + (t.destination || 'Flinders Street Station') + '</div><div style="font-size: 20px; font-weight: 700; margin-top: 6px;">Scheduled ' + t.time + '</div><div style="font-size: 14px; color: #ecfeff; margin-top: 6px;">Platform ' + t.platform + '</div></div>';
                    }
                    trainsHtml += '</div>';
                    document.getElementById('trains-card').innerHTML = trainsHtml;
                  }
                } catch (e) {
                  console.error('Fetch error:', e);
                }
              }

              updateData();
              setInterval(updateData, 30000);
            `,
          }}
        />
      </body>
    </html>
  );
}
