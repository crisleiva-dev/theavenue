// TV-friendly "lite" dashboard.
//
// Architecture: server returns instant static HTML, client-side JS updates data.
// This prevents serverless timeouts that caused the TV white-screen issue.
//
// Hard constraints (for ancient WebKit/Chromium builds in TV firmware):
//   - HTML tables for layout (no CSS Grid)
//   - No emoji icons (text labels only — Philips signage doesn't have emoji fonts)
//   - Inline styles only
//   - Client-side fetch instead of server-side (prevents timeouts)

export const runtime = "nodejs";

export default function TvPage() {
  // Static design constants
  const COLORS = {
    bg: "#0C111D",
    surface: "#141927",
    tile: "#1a1f2e",
    border: "#1f2433",
    ink: "#EEF2FF",
    ice: "#ecfeff",
    muted: "#64748B",
    accent: "#06b6d4",
  };

  return (
    <html>
      <head>
        <title>The Avenue Residence Portal</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=1920, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 1920px;
            height: 1080px;
            background: ${COLORS.bg};
            color: ${COLORS.ink};
            font-family: Arial, Helvetica, sans-serif;
            padding: 20px 36px 18px 36px;
            overflow: hidden;
          }
        `}</style>
      </head>
      <body>
        {/* HEADER */}
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 22, marginBottom: 16 }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: "bottom" }}>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                  The Avenue Residence Portal
                </div>
                <div style={{ fontSize: 16, color: COLORS.muted, marginTop: 6 }}>
                  Melbourne, Victoria
                </div>
              </td>
              <td style={{ textAlign: "right", verticalAlign: "bottom" }}>
                <div id="time" style={{ fontSize: 68, fontWeight: 300, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>--:--:--</div>
                <div id="date" style={{ fontSize: 20, color: COLORS.ice, marginTop: 6 }}>Loading…</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* MAIN */}
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "separate", borderSpacing: 16, marginBottom: 8 }}>
          <tbody>
            <tr>
              {/* WEATHER CARD */}
              <td id="weather-card" style={{ width: "62%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "28px 32px", verticalAlign: "top" }}>
                <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: COLORS.muted }}>Currently</div>
                <div style={{ fontSize: 24, color: COLORS.muted, marginTop: 30 }}>Loading weather...</div>
              </td>

              {/* TRAINS CARD */}
              <td id="trains-card" style={{ width: "38%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "28px 32px", verticalAlign: "top" }}>
                <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: COLORS.ice }}>Next Trains</div>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Balaclava Station</div>
                <div style={{ fontSize: 15, color: COLORS.muted, marginTop: 4 }}>Sandringham → Towards city</div>
                <div style={{ marginTop: 22, fontSize: 18, color: COLORS.muted }}>Loading departures...</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* NEWS FEED */}
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "28px 32px", marginBottom: 8, borderCollapse: "separate" }}>
          <tbody>
            <tr>
              <td colSpan={3}>
                <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: COLORS.muted, marginBottom: 16 }}>News Feed</div>
              </td>
            </tr>
            <tr>
              <td style={{ width: "33%", background: COLORS.tile, borderRadius: 14, padding: 18, verticalAlign: "top", paddingRight: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: COLORS.ice, marginBottom: 10 }}>
                  LIFT REPAIR WORKS
                </div>
                <div style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.5 }}>
                  Residents are advised that the lift is out of service for safety reasons while the Owners Corporation awaits a report from Kone (Fuji). Please use the stairwell.
                </div>
              </td>
              <td style={{ width: "33%", background: COLORS.tile, borderRadius: 14, padding: 18, verticalAlign: "top", paddingRight: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: COLORS.ice, marginBottom: 10 }}>
                  NEXT HARD RUBBISH COLLECTION
                </div>
                <div style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.5 }}>
                  No dates booked
                </div>
              </td>
              <td style={{ width: "33%", background: COLORS.tile, borderRadius: 14, padding: 18, verticalAlign: "top" }}>
                <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: COLORS.ice, marginBottom: 10 }}>
                  HORIZON CONTACT
                </div>
                <div style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.5 }}>
                  Horizon Strata Management Group 03 9687 7788 info@horizonstrata.com.au
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* FOOTER */}
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ paddingTop: 14, borderTop: `1px solid ${COLORS.border}` }}>
          <tbody>
            <tr>
              <td style={{ fontSize: 13, color: COLORS.muted }}>
                TV mode · Weather: Open-Meteo · Trains: Transport Victoria GTFS Realtime · Auto-refreshes every 30 seconds
              </td>
              <td id="refresh-time" style={{ fontSize: 13, color: COLORS.muted, textAlign: "right" }}>
                Loading…
              </td>
            </tr>
          </tbody>
        </table>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              var WMO = {
                0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
                45: 'Foggy', 48: 'Foggy',
                51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
                61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
                71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow', 77: 'Snow',
                80: 'Showers', 81: 'Showers', 82: 'Heavy Showers',
                85: 'Snow Showers', 86: 'Snow Showers',
                95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
              };

              function compassDir(deg) {
                var dirs = ['N','NE','E','SE','S','SW','W','NW'];
                return dirs[Math.round((deg % 360) / 45) % 8];
              }

              function forecastDayLabel(dateStr, index) {
                if (index === 1) return 'Tomorrow';
                var d = new Date(dateStr);
                return d.toLocaleDateString('en-AU', { weekday: 'long' });
              }

              function to12hr(hhmm) {
                var parts = hhmm.split(':');
                var h = parseInt(parts[0]);
                var m = parts[1];
                var suffix = h < 12 ? 'am' : 'pm';
                var h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
                return h12 + ':' + m + suffix;
              }

              function minsLabel(mins) {
                if (mins === 0) return 'NOW';
                if (mins === 1) return '1 min';
                return mins + ' mins';
              }

              function badgeStyle(mins) {
                if (mins <= 2) return 'background:#5B9CF6;color:#fff;border:1px solid #5B9CF6';
                if (mins <= 10) return 'background:#3a2d10;color:#FBBF24;border:1px solid #FBBF24';
                return 'background:#1f2433;color:#EEF2FF;border:1px solid #2a3046';
              }

              // Update clock every second
              function updateClock() {
                var now = new Date();
                var h = String(now.getHours()).padStart(2, '0');
                var m = String(now.getMinutes()).padStart(2, '0');
                var s = String(now.getSeconds()).padStart(2, '0');
                document.getElementById('time').textContent = h + ':' + m + ':' + s;
                document.getElementById('date').textContent = now.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
              }
              updateClock();
              setInterval(updateClock, 1000);

              function renderWeather(data) {
                if (!data || !data.current) return;
                var c = data.current;
                var day = data.daily;
                var wdesc = WMO[c.weather_code] || 'Unknown';

                var statsHtml = '';
                var stats = [
                  ['FEELS LIKE', Math.round(c.apparent_temperature) + '°', false],
                  ['HUMIDITY', c.relative_humidity_2m + '%', false],
                  ['WIND', Math.round(c.wind_speed_10m) + ' km/h ' + compassDir(c.wind_direction_10m || 0), true],
                  ['UV INDEX', Math.round(c.uv_index || 0), false]
                ];
                for (var i = 0; i < stats.length; i++) {
                  statsHtml += '<td style="width:25%;background:#1a1f2e;border-radius:12px;padding:16px 18px;vertical-align:top;">';
                  statsHtml += '<div style="font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#ecfeff;">' + stats[i][0] + '</div>';
                  statsHtml += '<div style="font-size:' + (stats[i][2] ? '26px' : '38px') + ';font-weight:500;margin-top:10px;line-height:1;">' + stats[i][1] + '</div>';
                  statsHtml += '</td>';
                }

                var fcHtml = '';
                for (var i = 1; i <= 3; i++) {
                  var fd = WMO[day.weather_code[i]] || '-';
                  var rain = day.precipitation_probability_max[i] || 0;
                  fcHtml += '<td style="width:33%;background:#1a1f2e;border-radius:14px;padding:14px 18px;vertical-align:top;">';
                  fcHtml += '<div style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#64748B;">' + forecastDayLabel(day.time[i], i) + '</div>';
                  fcHtml += '<div style="font-size:14px;color:#64748B;margin-top:8px;">' + fd + '</div>';
                  fcHtml += '<div style="margin-top:8px;">';
                  fcHtml += '<span style="color:#ecfeff;font-size:18px;font-weight:700;">Max ' + Math.round(day.temperature_2m_max[i]) + '°</span>';
                  fcHtml += '<span style="display:inline-block;width:14px;"></span>';
                  fcHtml += '<span style="color:#ecfeff;font-size:18px;">Min ' + Math.round(day.temperature_2m_min[i]) + '°</span>';
                  fcHtml += '<span style="display:inline-block;width:14px;"></span>';
                  fcHtml += '<span style="color:#22D3EE;font-size:14px;">Rain ' + rain + '%</span>';
                  fcHtml += '</div></td>';
                }

                var html = '<div style="font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#64748B;">Currently</div>';
                html += '<table cellpadding="0" cellspacing="0" style="margin-top:14px;"><tbody><tr>';
                html += '<td style="font-size:200px;font-weight:200;line-height:0.9;white-space:nowrap;padding-right:40px;">' + Math.round(c.temperature_2m) + '°</td>';
                html += '<td style="vertical-align:top;padding-top:22px;">';
                html += '<div style="font-size:56px;font-weight:400;">' + wdesc + '</div>';
                html += '<div style="margin-top:26px;">';
                html += '<div style="display:inline-block;margin-right:50px;"><div style="font-size:14px;color:#64748B;letter-spacing:1.5px;">MAX</div><div style="font-size:44px;color:#ecfeff;font-weight:700;margin-top:4px;">' + Math.round(day.temperature_2m_max[0]) + '°</div></div>';
                html += '<div style="display:inline-block;"><div style="font-size:14px;color:#64748B;letter-spacing:1.5px;">MIN</div><div style="font-size:44px;color:#ecfeff;font-weight:700;margin-top:4px;">' + Math.round(day.temperature_2m_min[0]) + '°</div></div>';
                html += '</div></td></tr></tbody></table>';
                html += '<table width="100%" cellpadding="0" cellspacing="10" style="margin-top:28px;"><tbody><tr>' + statsHtml + '</tr></tbody></table>';
                html += '<table width="100%" cellpadding="0" cellspacing="10" style="margin-top:16px;"><tbody><tr>' + fcHtml + '</tr></tbody></table>';

                document.getElementById('weather-card').innerHTML = html;
              }

              function renderTrains(trains) {
                if (!trains || trains.length === 0) {
                  document.getElementById('trains-card').innerHTML = '<div style="font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#ecfeff;">Next Trains</div><div style="font-size:28px;font-weight:700;margin-top:6px;">Balaclava Station</div><div style="font-size:15px;color:#64748B;margin-top:4px;">Sandringham → Towards city</div><div style="margin-top:22px;font-size:18px;color:#64748B;">No upcoming departures.</div>';
                  return;
                }

                var html = '<div style="font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#ecfeff;">Next Trains</div>';
                html += '<div style="font-size:28px;font-weight:700;margin-top:6px;">Balaclava Station</div>';
                html += '<div style="font-size:15px;color:#64748B;margin-top:4px;">Sandringham → Towards city</div>';
                html += '<div style="margin-top:22px;">';

                for (var i = 0; i < Math.min(3, trains.length); i++) {
                  var t = trains[i];
                  var mins = Math.max(0, Math.round((t.scheduledMs - Date.now()) / 60000));
                  html += '<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1f2e;border-left:12px solid #06b6d4;border-radius:0 10px 10px 0;margin-bottom:14px;border-collapse:separate;">';
                  html += '<tbody><tr>';
                  html += '<td style="padding:18px 22px;vertical-align:middle;">';
                  html += '<div style="font-size:22px;font-weight:700;line-height:1.2;">To ' + (t.destination || 'Flinders Street Station') + '</div>';
                  html += '<div style="font-size:22px;font-weight:700;margin-top:6px;">Scheduled ' + to12hr(t.scheduledTime) + '</div>';
                  html += '<div style="font-size:16px;color:#ecfeff;margin-top:6px;">Platform ' + t.platform + '</div>';
                  html += '</td>';
                  html += '<td style="width:130px;text-align:center;vertical-align:middle;padding:0 18px 0 0;">';
                  html += '<span style="display:inline-block;padding:12px 22px;border-radius:28px;font-size:22px;font-weight:700;white-space:nowrap;' + badgeStyle(mins) + '">' + minsLabel(mins) + '</span>';
                  html += '</td>';
                  html += '</tr></tbody></table>';
                }
                html += '</div>';
                document.getElementById('trains-card').innerHTML = html;
              }

              // Fetch data every 30 seconds
              function updateData() {
                fetch('/api/trains').then(function(r) { return r.json(); }).then(renderTrains).catch(function(e) { console.error('trains:', e); });
                fetch('https://api.open-meteo.com/v1/forecast?latitude=-37.8136&longitude=144.9631&current=temperature_2m,weather_code,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Australia/Melbourne&forecast_days=4').then(function(r) { return r.json(); }).then(renderWeather).catch(function(e) { console.error('weather:', e); });
                var now = new Date();
                document.getElementById('refresh-time').textContent = 'Last refresh: ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
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
