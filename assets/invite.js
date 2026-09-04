/* Thiệp cưới Phi Hùng & Bích Ngọc — engine dùng chung cho cả 3 trang.
   Mỗi trang chỉ khai báo window.SITE rồi nạp file này.
   Không sửa nội dung ở đây — nội dung nằm trong window.SITE của từng trang. */
(function(){
  'use strict';

  var S = window.SITE;
  if(!S){ console.error('[thiepcuoi] thiếu window.SITE'); return; }

  /* ---------- tiện ích ---------- */

  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function param(name){
    try{ return new URLSearchParams(location.search).get(name); }
    catch(e){ return null; }
  }

  /* Bỏ dấu tiếng Việt — chuẩn ICS chỉ nên chứa ASCII cho chắc ăn */
  function deaccent(s){
    return String(s)
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/đ/g,'d').replace(/Đ/g,'D')
      .replace(/[\u2010-\u2015]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"');
  }

  function icsEscape(s){
    return deaccent(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
  }

  function pad(n){ return String(n).padStart(2,'0'); }

  /* '2026-10-15T11:00:00+07:00' -> '20261015T040000Z' */
  function icsStamp(iso){
    var d = new Date(iso);
    return d.getUTCFullYear() + pad(d.getUTCMonth()+1) + pad(d.getUTCDate()) + 'T' +
           pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }

  function el(html){
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  var HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 21s-7-4.35-9.5-8.8C.7 8.6 2.3 5 6 5c2 0 3.4 1.1 4 2.2C10.6 6.1 12 5 14 5c3.7 0 5.3 3.6 3.5 7.2C19 16.65 12 21 12 21z"/></svg>';
  var FLOURISH = '<svg class="corner-flourish {POS}" viewBox="0 0 100 100" fill="none" stroke="#b5895a" stroke-width="1"><path d="M5 5 C 30 5, 20 40, 45 35 C 30 45, 15 60, 5 70"/><circle cx="30" cy="22" r="3"/><circle cx="12" cy="55" r="2.5"/></svg>';
  var DIVIDER = '<div class="divider fade-up"><span class="line"></span>' + HEART + '<span class="line"></span></div>';

  /* ---------- logo H&N ----------
     Hình lấy từ assets/logo.js — vector hoá từ ảnh logo gốc, không dùng <img>.
     plain = true: chỉ hai chữ cái, dùng ở footer. */
  function logoHTML(plain){
    var L = window.HN_LOGO;
    if(!L){ console.error('[thiepcuoi] thiếu assets/logo.js'); return ''; }
    return '<div class="logo' + (plain ? ' logo--plain' : '') + '">' +
             (plain ? L.mark : L.full) +
           '</div>';
  }

  /* ---------- tên khách mời từ ?ten= ---------- */

  function guestName(){
    var raw = param('ten') || param('guest');
    if(!raw) return '';
    // esc() đã escape toàn bộ khi in ra, đây chỉ là lớp chặn thứ hai.
    // Giữ lại "&" vì "Bác Nam & gia đình" là cách ghi rất thường gặp.
    var clean = raw.replace(/[<>"'`\\]/g, ' ').replace(/\s+/g,' ').trim();
    return clean.slice(0, 60);
  }

  /* ---------- dựng từng section ---------- */

  function heroHTML(){
    var g = guestName();
    return '' +
    '<section id="hero">' +
      FLOURISH.replace('{POS}','tl') + FLOURISH.replace('{POS}','tr') +
      '<div class="kicker fade-up in">' + esc(S.hero.kicker) + '</div>' +
      (g ? '<div class="guest-name fade-up in">' + esc(g) + '</div>' : '') +
      '<div class="logo-holder fade-up in">' + logoHTML(false) + '</div>' +
      '<div class="invite-line fade-up in">' + esc(S.hero.inviteLine) + '</div>' +
      '<h1 class="couple-names fade-up in">' + esc(S.hero.names[0]) +
        '<span class="amp">&amp;</span>' + esc(S.hero.names[1]) + '</h1>' +
      S.hero.badges.map(function(b){
        return '<div class="date-badge fade-up in">' + esc(b) + '</div>';
      }).join('') +
      '<div class="scroll-cue">Cuộn xuống ↓</div>' +
    '</section>';
  }

  function introHTML(){
    return '' +
    '<section id="intro">' +
      '<div class="kicker fade-up">' + esc(S.intro.kicker) + '</div>' +
      '<p class="fade-up">' + esc(S.intro.text) + '</p>' +
      '<div class="names-line fade-up">' + esc(S.intro.namesLine) + '</div>' +
      DIVIDER +
    '</section>';
  }

  function photoHTML(){
    if(!S.photo) return '';
    return '' +
    '<section id="photo">' +
      '<div class="kicker fade-up">' + esc(S.photo.kicker) + '</div>' +
      '<div class="photo-frame fade-up"><img src="' + esc(S.photo.src) + '" alt="' + esc(S.photo.alt) + '" loading="lazy" width="1400" height="2100"></div>' +
      '<div class="photo-caption fade-up">' + esc(S.photo.caption) + '</div>' +
    '</section>';
  }

  function countdownHTML(){
    return '' +
    '<section id="countdown">' +
      '<div class="kicker fade-up" id="cd-kicker">Đếm ngược tới ngày trọng đại</div>' +
      '<div class="count-grid fade-up">' +
        '<div class="count-box"><div class="count-num" id="cd-days">00</div><div class="count-label">Ngày</div></div>' +
        '<div class="count-box"><div class="count-num" id="cd-hours">00</div><div class="count-label">Giờ</div></div>' +
        '<div class="count-box"><div class="count-num" id="cd-mins">00</div><div class="count-label">Phút</div></div>' +
        '<div class="count-box"><div class="count-num" id="cd-secs">00</div><div class="count-label">Giây</div></div>' +
      '</div>' +
    '</section>';
  }

  function eventsHTML(){
    var blocks = S.events.map(function(ev, i){
      var items = ev.items.map(function(it){
        return '<div class="event-item fade-up">' +
          '<div class="label">' + esc(it.label) + '</div>' +
          '<div class="value">' + esc(it.value) + '</div>' +
          (it.sub ? '<div class="sub">' + esc(it.sub) + '</div>' : '') +
        '</div>';
      }).join('');

      var buttons = '';
      if(ev.mapQuery){
        buttons += '<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' +
                   encodeURIComponent(ev.mapQuery) + '">Xem bản đồ</a>';
      }
      if(ev.start){
        buttons += '<button class="btn" type="button" data-ics="' + i + '">Thêm vào lịch</button>';
      }

      return '<div class="event-block">' +
        '<div class="kicker fade-up">' + esc(ev.kicker) + '</div>' +
        '<h2 class="script section-title fade-up">' + esc(ev.heading) + '</h2>' +
        '<div class="event-card">' + items + '</div>' +
        (buttons ? '<div class="btn-row fade-up">' + buttons + '</div>' : '') +
      '</div>';
    }).join('');

    return '<section id="events">' + blocks + '</section>';
  }

  function calendarHTML(){
    var c = S.calendar;
    if(!c) return '';
    var first = new Date(Date.UTC(c.year, c.month - 1, 1));
    var daysInMonth = new Date(Date.UTC(c.year, c.month, 0)).getUTCDate();
    var lead = (first.getUTCDay() + 6) % 7;   // lịch bắt đầu từ Thứ Hai
    var hl = c.highlight || [];

    var cells = [];
    for(var i = 0; i < lead; i++) cells.push('<td></td>');
    for(var d = 1; d <= daysInMonth; d++){
      cells.push(hl.indexOf(d) > -1
        ? '<td class="hl"><span class="day-circle">' + pad(d) + '</span></td>'
        : '<td>' + pad(d) + '</td>');
    }
    while(cells.length % 7) cells.push('<td></td>');

    var rows = '';
    for(var r = 0; r < cells.length; r += 7){
      rows += '<tr>' + cells.slice(r, r + 7).join('') + '</tr>';
    }

    return '' +
    '<section id="calendar"><div class="cal-wrap fade-up">' +
      '<div class="cal-title">Tháng ' + c.month + ' · ' + c.year + '</div>' +
      '<table class="cal"><thead><tr><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>T6</th><th>T7</th><th>CN</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table>' +
      (c.legend ? '<div class="cal-legend">' + esc(c.legend) + '</div>' : '') +
    '</div></section>';
  }

  function familiesHTML(){
    var cards = S.families.map(function(f){
      return '<div class="fam-card fade-up">' +
        '<h3>' + esc(f.title) + '</h3>' +
        f.parents.map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('') +
        '<div class="role">' + esc(f.child) + '</div>' +
      '</div>';
    }).join('');

    return '' +
    '<section id="families">' +
      '<div class="kicker fade-up">Đôi lời</div>' +
      '<h2 class="script section-title fade-up">Hai gia đình</h2>' +
      '<div class="fam-grid">' + cards + '</div>' +
    '</section>';
  }

  function rsvpHTML(){
    var r = S.rsvp;
    // chưa dán URL Apps Script thì ẩn hẳn, không để form hỏng ra mặt khách
    if(!r || !r.url || r.url.indexOf('PASTE') === 0){
      if(r) console.warn('[thiepcuoi] chưa cấu hình SITE.rsvp.url — mục RSVP bị ẩn');
      return '';
    }

    var eventField = '';
    if(r.eventOptions && r.eventOptions.length > 1){
      eventField =
        '<div class="field"><label for="rsvp-event">Bạn dự tiệc nào</label>' +
        '<select id="rsvp-event" name="event">' +
          r.eventOptions.map(function(o){ return '<option>' + esc(o) + '</option>'; }).join('') +
        '</select></div>';
    }

    return '' +
    '<section id="rsvp">' +
      '<div class="kicker fade-up">Xác nhận tham dự</div>' +
      '<h2 class="script section-title fade-up">' + esc(r.heading || 'Cho chúng mình biết nhé') + '</h2>' +
      '<p class="rsvp-note fade-up">' + esc(r.note || 'Xác nhận giúp chúng mình chuẩn bị chỗ ngồi chu đáo hơn.') + '</p>' +
      '<form class="rsvp-form fade-up" id="rsvpForm" novalidate>' +
        '<div class="field"><label for="rsvp-name">Họ và tên</label>' +
          '<input id="rsvp-name" name="name" type="text" required maxlength="80" autocomplete="name"></div>' +
        eventField +
        '<div class="field-row">' +
          '<div class="field"><label for="rsvp-attend">Tham dự</label>' +
            '<select id="rsvp-attend" name="attend">' +
              '<option value="Có">Có, mình sẽ đến</option>' +
              '<option value="Không">Rất tiếc, mình không đến được</option>' +
            '</select></div>' +
          '<div class="field"><label for="rsvp-guests">Số người</label>' +
            '<input id="rsvp-guests" name="guests" type="number" min="1" max="20" step="1" value="1" inputmode="numeric"></div>' +
        '</div>' +
        '<div class="field"><label for="rsvp-wish">Lời chúc</label>' +
          '<textarea id="rsvp-wish" name="wish" maxlength="500" placeholder="Gửi đôi lời tới cô dâu chú rể…"></textarea></div>' +
        '<div class="hp"><label for="rsvp-website">Để trống ô này</label>' +
          '<input id="rsvp-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>' +
        '<div class="btn-row"><button class="btn" type="submit" id="rsvpSubmit">Gửi xác nhận</button></div>' +
        '<div class="rsvp-status" id="rsvpStatus" role="status" aria-live="polite"></div>' +
      '</form>' +
    '</section>';
  }

  function messageHTML(){
    return '' +
    '<section id="message">' + DIVIDER +
      '<p class="big fade-up">' + esc(S.message.big) + '</p>' +
      '<p class="small fade-up">' + esc(S.message.small) + '</p>' +
    '</section>';
  }

  function footerHTML(){
    var links = (S.footerLinks || []).map(function(l){
      return '<a href="' + esc(l.href) + '">' + esc(l.text) + '</a>';
    }).join(' · ');

    return '' +
    '<footer>' +
      '<div class="logo-holder logo-holder--sm fade-up">' + logoHTML(true) + '</div>' +
      '<div class="thanks fade-up">' + esc(S.footer.thanks) + '</div>' +
      (links ? '<div class="side-switch fade-up">' + links + '</div>' : '') +
    '</footer>';
  }

  /* ---------- render ---------- */

  var root = document.getElementById('app') || document.body;
  root.insertAdjacentHTML('beforeend', [
    heroHTML(), introHTML(), photoHTML(), countdownHTML(),
    eventsHTML(), calendarHTML(), familiesHTML(), rsvpHTML(),
    messageHTML(), footerHTML()
  ].join(''));

  /* ---------- hiệu ứng fade-up ---------- */

  var els = document.querySelectorAll('.fade-up');
  if(window.IntersectionObserver){
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('in'); });
    }, {threshold:.15});
    els.forEach(function(x){ obs.observe(x); });
  }
  // lưới an toàn: màn hình rất cao hoặc IntersectionObserver bị chặn
  setTimeout(function(){ els.forEach(function(x){ x.classList.add('in'); }); }, 3500);

  /* ---------- đếm ngược ---------- */

  (function countdown(){
    var dated = S.events.filter(function(e){ return e.start; });
    if(!dated.length) return;

    var now = Date.now();
    var upcoming = dated
      .map(function(e){ return {ev:e, t:new Date(e.start).getTime()}; })
      .sort(function(a,b){ return a.t - b.t; });
    var next = upcoming.filter(function(x){ return x.t > now; })[0] || upcoming[upcoming.length-1];

    if(dated.length > 1){
      document.getElementById('cd-kicker').textContent = 'Đếm ngược tới ' + (next.ev.countdownLabel || next.ev.kicker);
    }

    var d = document.getElementById('cd-days'), h = document.getElementById('cd-hours'),
        m = document.getElementById('cd-mins'), s = document.getElementById('cd-secs');

    function tick(){
      var diff = next.t - Date.now();
      if(diff < 0) diff = 0;
      d.textContent = pad(Math.floor(diff/86400000));
      h.textContent = pad(Math.floor(diff/3600000) % 24);
      m.textContent = pad(Math.floor(diff/60000) % 60);
      s.textContent = pad(Math.floor(diff/1000) % 60);
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* ---------- tải file .ics ---------- */

  document.addEventListener('click', function(e){
    var btn = e.target && e.target.closest && e.target.closest('[data-ics]');
    if(!btn) return;
    var ev = S.events[Number(btn.dataset.ics)];
    if(!ev || !ev.start) return;

    var ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ThiepCuoi//VN','CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + Date.now() + '@humiwedding.online',
      'DTSTAMP:' + icsStamp(new Date().toISOString()),
      'DTSTART:' + icsStamp(ev.start),
      'DTEND:' + icsStamp(ev.end || ev.start),
      'SUMMARY:' + icsEscape(ev.icsSummary || ev.kicker),
      'DESCRIPTION:' + icsEscape(ev.icsDescription || ''),
      'LOCATION:' + icsEscape(ev.mapQuery || ''),
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');

    var url = URL.createObjectURL(new Blob([ics], {type:'text/calendar;charset=utf-8'}));
    var a = document.createElement('a');
    a.href = url;
    a.download = (ev.icsFile || 'su-kien') + '.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  /* ---------- gửi RSVP về Google Apps Script ---------- */

  var form = document.getElementById('rsvpForm');
  if(form){
    var statusEl = document.getElementById('rsvpStatus');
    var submitBtn = document.getElementById('rsvpSubmit');

    form.addEventListener('submit', function(e){
      e.preventDefault();

      var F = form.elements;
      var name = F.name.value.trim();
      if(!name){
        statusEl.className = 'rsvp-status err';
        statusEl.textContent = 'Bạn cho xin họ tên với nhé.';
        F.name.focus();
        return;
      }
      // bot điền vào ô ẩn -> giả vờ thành công rồi bỏ qua
      if(F.website.value){ done(); return; }

      var payload = {
        side:    S.rsvp.side || '',
        event:   F.event ? F.event.value : (S.rsvp.eventOptions ? S.rsvp.eventOptions[0] : ''),
        name:    name,
        attend:  F.attend.value,
        guests:  F.attend.value === 'Có' ? Number(F.guests.value) || 1 : 0,
        wish:    F.wish.value.trim(),
        invited: guestName(),
        page:    location.pathname + location.search,
        sentAt:  new Date().toISOString()
      };

      submitBtn.disabled = true;
      statusEl.className = 'rsvp-status';
      statusEl.textContent = 'Đang gửi…';

      send(payload).then(done).catch(function(err){
        console.error('[thiepcuoi] RSVP lỗi', err);
        submitBtn.disabled = false;
        statusEl.className = 'rsvp-status err';
        statusEl.textContent = 'Gửi chưa được. Bạn thử lại giúp mình, hoặc nhắn trực tiếp cho cô dâu chú rể nhé.';
      });
    });

    function done(){
      form.innerHTML = '<div class="rsvp-done">Cảm ơn bạn rất nhiều!</div>' +
        '<p class="rsvp-note" style="text-align:center;">Chúng mình đã nhận được xác nhận của bạn.</p>';
    }

    /* Apps Script không trả header CORS cho preflight, nên gửi bằng text/plain
       (request "đơn giản", không preflight). Nếu vẫn bị chặn thì bắn lại kiểu
       no-cors — request vẫn tới nơi, chỉ là không đọc được phản hồi. */
    function send(payload){
      var body = JSON.stringify(payload);
      return fetch(S.rsvp.url, {
        method: 'POST',
        headers: {'Content-Type': 'text/plain;charset=utf-8'},
        body: body,
        redirect: 'follow'
      }).then(function(res){
        if(!res.ok) throw new Error('HTTP ' + res.status);
        return res.json().catch(function(){ return {ok:true}; });
      }).then(function(data){
        if(data && data.ok === false) throw new Error(data.error || 'server từ chối');
        return data;
      }).catch(function(){
        return fetch(S.rsvp.url, {
          method: 'POST',
          mode: 'no-cors',
          headers: {'Content-Type': 'text/plain;charset=utf-8'},
          body: body
        }).then(function(){ return {ok:true, opaque:true}; });
      });
    }
  }
})();
