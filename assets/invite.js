/* Thiệp cưới Phi Hùng & Bích Ngọc — engine của thiệp (4 trang cuộn dọc).
   Trang HTML chỉ khai báo window.SITE rồi nạp file này.
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
    var h = S.hero;

    /* Trang đầu phải đủ thông tin: mỗi mốc gồm tên lễ - giờ ngày - địa điểm.
       hero.badges là dạng cũ, giữ lại cho mấy file trong _archive. */
    var when = '';
    if(h.schedule && h.schedule.length){
      when = '<div class="hero-when fade-up in">' + h.schedule.map(function(x){
        return '<div class="when-block">' +
          (x.title ? '<div class="when-title">' + esc(x.title) + '</div>' : '') +
          '<div class="when-time">' + esc(x.when) + '</div>' +
          (x.where ? '<div class="when-where">' + esc(x.where) + '</div>' : '') +
          (x.note  ? '<div class="when-note">'  + esc(x.note)  + '</div>' : '') +
        '</div>';
      }).join('') + '</div>';
    } else if(h.badges){
      when = h.badges.map(function(b){
        return '<div class="date-badge fade-up in">' + esc(b) + '</div>';
      }).join('');
    }

    return '' +
    '<section id="hero">' +
      '<div class="kicker fade-up in">' + esc(h.kicker) + '</div>' +
      (g ? '<div class="guest-name fade-up in">' + esc(g) + '</div>' : '') +
      '<div class="logo-holder fade-up in">' + logoHTML(false) + '</div>' +
      '<div class="invite-line fade-up in">' + esc(h.inviteLine) + '</div>' +
      '<h1 class="couple-names fade-up in">' +
        '<span class="nm">' + esc(h.names[0]) + '</span>' +
        '<span class="amp">&amp;</span>' +
        '<span class="nm">' + esc(h.names[1]) + '</span>' +
      '</h1>' +
      when +
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

  /* Trang 3: mỗi buổi tiệc một đồng hồ đếm ngược, kèm nút bản đồ và thêm vào lịch. */
  function countdownHTML(){
    var dated = S.events.filter(function(e){ return e.start; });
    if(!dated.length) return '';

    var groups = dated.map(function(ev){
      var i = S.events.indexOf(ev);
      var box = function(unit, label){
        return '<div class="count-box"><div class="count-num" id="cd-' + i + '-' + unit + '">00</div>' +
               '<div class="count-label">' + label + '</div></div>';
      };

      /* mapUrl: link Google Maps ghim sẵn (ưu tiên).
         mapQuery: chỉ còn dùng để tìm đường khi chưa có link, và làm LOCATION trong .ics. */
      var mapHref = ev.mapUrl ||
        (ev.mapQuery ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ev.mapQuery) : '');

      var buttons = '';
      if(mapHref){
        buttons += '<a class="btn" target="_blank" rel="noopener" href="' + esc(mapHref) + '">Xem bản đồ</a>';
      }
      buttons += '<button class="btn" type="button" data-ics="' + i + '">Thêm vào lịch</button>';

      return '<div class="count-group fade-up">' +
        '<div class="count-title">' + esc(ev.countdownLabel || ev.kicker) + '</div>' +
        '<div class="count-grid">' +
          box('days','Ngày') + box('hours','Giờ') + box('mins','Phút') + box('secs','Giây') +
        '</div>' +
        '<div class="btn-row">' + buttons + '</div>' +
      '</div>';
    }).join('');

    return '' +
    '<section id="countdown">' +
      '<div class="kicker fade-up">Đếm ngược tới ngày trọng đại</div>' +
      '<div class="count-groups">' + groups + '</div>' +
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

  /* Thiệp gói trong đúng 3 trang, mỗi trang vừa đúng một màn hình:
       1 · lời mời + đủ ngày giờ địa điểm
       2 · ảnh cưới
       3 · đếm ngược, bản đồ, lời cảm ơn
     Mỗi trang có một .page-inner để đo chiều cao và co lại cho vừa (xem fitPages). */
  function page(n, html, chrome){
    return '<div class="page page--' + n + '">' +
             '<div class="page-inner">' + html + '</div>' +
             (chrome || '') +
           '</div>';
  }

  var root = document.getElementById('app') || document.body;
  root.insertAdjacentHTML('beforeend', [
    page(1, heroHTML(),
      FLOURISH.replace('{POS}','tl') + FLOURISH.replace('{POS}','tr') +
      '<div class="scroll-cue">Cuộn xuống ↓</div>'),
    page(2, photoHTML()),
    page(3, countdownHTML() + rsvpHTML() + messageHTML() + footerHTML())
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

  /* ---------- mỗi trang tự vừa một màn hình ----------
     Không đoán theo model máy: đo chiều cao thật của khung nhìn (đã trừ thanh
     công cụ trình duyệt) rồi thu nội dung từng trang lại đúng bằng tỉ lệ còn
     thiếu. Trang nào vừa sẵn thì không đụng gì. Sàn 0.62 để chữ không bé quá. */
  (function fitPages(){
    var MIN = 0.62;
    var pages = [].slice.call(document.querySelectorAll('.page'));
    if(!pages.length) return;

    function fit(pg){
      var inner = pg.querySelector('.page-inner');
      if(!inner) return;

      inner.style.zoom = '';               // đo lại từ cỡ gốc
      var style   = getComputedStyle(pg);
      var padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      var cue     = pg.querySelector('.scroll-cue');
      var reserve = cue && getComputedStyle(cue).display !== 'none' ? 34 : 0;
      var avail   = (window.visualViewport ? window.visualViewport.height : window.innerHeight)
                    - padding - reserve;
      var content = inner.scrollHeight;
      if(!avail || !content) return;

      var k = avail / content;
      if(k >= 1) return;                   // đã vừa, để nguyên
      inner.style.zoom = Math.max(MIN, k).toFixed(3);
    }

    function apply(){ pages.forEach(fit); }

    var pending;
    function schedule(){
      clearTimeout(pending);
      pending = setTimeout(apply, 120);
    }

    apply();
    // font chữ và ảnh cưới tải xong thì chiều cao đổi -> đo lại
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
    window.addEventListener('load', apply);
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
  })();

  /* ---------- đếm ngược ---------- */

  (function countdown(){
    var clocks = [];
    S.events.forEach(function(ev, i){
      if(!ev.start) return;
      var d = document.getElementById('cd-' + i + '-days');
      if(!d) return;
      clocks.push({
        t: new Date(ev.start).getTime(),
        days: d,
        hours: document.getElementById('cd-' + i + '-hours'),
        mins:  document.getElementById('cd-' + i + '-mins'),
        secs:  document.getElementById('cd-' + i + '-secs')
      });
    });
    if(!clocks.length) return;

    function tick(){
      var now = Date.now();
      clocks.forEach(function(c){
        var diff = c.t - now;
        if(diff < 0) diff = 0;
        c.days.textContent  = pad(Math.floor(diff/86400000));
        c.hours.textContent = pad(Math.floor(diff/3600000) % 24);
        c.mins.textContent  = pad(Math.floor(diff/60000) % 60);
        c.secs.textContent  = pad(Math.floor(diff/1000) % 60);
      });
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
