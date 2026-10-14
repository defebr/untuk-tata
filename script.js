/* ============ PENGATURAN — EDIT DI SINI ============ */
const NAMA = "Tata";

// Hash SHA-256 dari kata kunci "tata imut" (huruf besar/kecil & spasi pinggir diabaikan)
const KUNCI_HASH = "6a95e946a1b2a46e12a3c7da10ffaf099d9a0313ee3bda08d0b2d72feac8dcab";

// Website cuma bisa dibuka di tanggal ini (waktu WIB / +07:00)
const BUKA_MULAI  = new Date("2026-10-12T00:00:00+07:00");
const BUKA_SAMPAI = new Date("2027-10-13T00:00:00+07:00");
// true  = setelah 12 Oktober tetap bisa dibuka (buat dikenang lagi)
// false = cuma bisa dibuka tepat tanggal 12 Oktober
const BOLEH_SETELAHNYA = false;

// Ucapan — tambah/ubah/hapus sesukamu
const UCAPAN = [
  "Selamat ulang tahun, Tata! Semoga hari ini penuh senyum, tawa, dan kue yang enak 🍰",
  "Makasih ya udah jadi kamu. Kamu itu bikin hari-hariku jadi lebih rame dan lebih seru.",
  "Semoga di umur yang baru ini semua yang kamu mau pelan-pelan jadi kenyataan ✨",
  "Semoga kamu selalu sehat, bahagia, dan dikelilingi orang-orang yang sayang sama kamu.",
  "Dan tetap jadi Tata yang imut, ya. Jangan berubah! 💗",
];

// Foto — taruh file di folder "foto/" lalu samain namanya di sini
const FOTO = [
  { src: "foto/foto1.jpeg", caption: "Lucu banget 💗" },
  { src: "foto/foto2.jpeg", caption: "Ini favoritku" },
  { src: "foto/foto3.jpeg", caption: "Senyum yang bikin gemes" },
  { src: "foto/foto4.jpg", caption: "Imutnya kebangetan" },
  { src: "foto/foto5.jpeg", caption: "Kenangan kita 💕" },
  { src: "foto/foto6.jpeg", caption: "Tata mode on" },
];

// Video kenangan (taruh file di folder "video/"). Kalau file tidak ada,
// otomatis diganti slideshow dari foto-foto di atas.
const VIDEO = "video/kenangan.mp4";

const PENUTUP = "Sekali lagi, selamat ulang tahun, sayang.\nAku sayang kamu 💖";
/* ================================================== */

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");

function status(now = Date.now()) {
  if (now < BUKA_MULAI) return "belum";
  if (now >= BUKA_SAMPAI && !BOLEH_SETELAHNYA) return "lewat";
  return "buka";
}

function renderLock() {
  const s = status();
  const info = $("lockInfo"), cd = $("countdown"), form = $("form");
  if (s === "belum") {
    const d = BUKA_MULAI - Date.now();
    const days = Math.floor(d / 864e5), h = Math.floor(d / 36e5) % 24,
          m = Math.floor(d / 6e4) % 60, sec = Math.floor(d / 1e3) % 60;
    info.textContent = "Belum waktunya ya… kejutannya baru bisa dibuka tanggal 12 Oktober 2026.";
    cd.hidden = false; form.hidden = true;
    cd.innerHTML = [[days,"hari"],[h,"jam"],[m,"menit"],[sec,"detik"]]
      .map(([v,l]) => `<div><b>${pad(v)}</b><span>${l}</span></div>`).join("");
  } else if (s === "lewat") {
    info.textContent = "Kejutan ini cuma bisa dibuka tanggal 12 Oktober 2026. Hari itu sudah lewat 💗";
    cd.hidden = true; form.hidden = true;
  } else {
    info.textContent = "Hari ini hari spesialmu! Masukin kata kunci buat buka.";
    cd.hidden = true; form.hidden = false;
  }
}
renderLock();
const timer = setInterval(() => { if (!$("content").hidden) return clearInterval(timer); renderLock(); }, 1000);

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (status() !== "buka") return renderLock();
  const input = $("kunci");
  const hash = await sha256(input.value.trim().toLowerCase());
  if (hash === KUNCI_HASH) {
    clearInterval(timer);
    $("lock").hidden = true;
    $("content").hidden = false;
    buildContent();
    window.scrollTo(0, 0);
    startMemory();
    confetti();
  } else {
    $("error").textContent = "Kata kuncinya belum tepat, coba lagi ya 💭";
    input.classList.remove("shake"); void input.offsetWidth; input.classList.add("shake");
  }
});

function buildContent() {
  $("messages").innerHTML = UCAPAN.map((t) => `<div class="note">${esc(t)}</div>`).join("");
  $("gallery").innerHTML = FOTO.map((f, i) => `
    <figure class="polaroid" style="--r:${[-2.5,2,-1.5,3,-3,1.5][i % 6]}deg">
      <img src="${esc(f.src)}" alt="${esc(f.caption)}" loading="lazy"
           onerror="this.outerHTML='<div class=&quot;ph&quot;>📷</div>'">
      <p>${esc(f.caption)}</p>
    </figure>`).join("");
  $("closing").textContent = PENUTUP;
}
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
$("again").addEventListener("click", () => confetti());

/* video kenangan: langsung diputar */
function startMemory() {
  const vid = $("vid"), btn = $("unmute");
  vid.addEventListener("error", slideshow, { once: true });
  vid.src = VIDEO;
  vid.play().catch(() => {
    // browser blokir autoplay bersuara -> putar tanpa suara + tombol suara
    vid.muted = true;
    vid.play().then(() => (btn.hidden = false)).catch(() => {});
  });
  btn.addEventListener("click", () => { vid.muted = false; vid.play(); btn.hidden = true; });
}

function slideshow() {
  $("vid").hidden = true; $("unmute").hidden = true;
  const box = $("slides"); box.hidden = false;
  box.innerHTML = FOTO.map((f) => `<img src="${esc(f.src)}" alt="" onerror="this.remove()">`).join("") + "<p></p>";
  const imgs = () => [...box.querySelectorAll("img")];
  let i = -1;
  (function next() {
    const list = imgs(); if (!list.length) return;
    list.forEach((im) => im.classList.remove("on"));
    i = (i + 1) % list.length;
    list[i].classList.add("on");
    box.querySelector("p").textContent = FOTO.find((f) => list[i].src.endsWith(f.src))?.caption || "";
    setTimeout(next, 3200);
  })();
}

/* confetti */
function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = $("confetti"), x = c.getContext("2d");
  c.width = innerWidth; c.height = innerHeight;
  const cols = ["#ff7aa8","#ffd1df","#fff0b3","#e2d4ff","#8a2250"];
  const ps = Array.from({length: 140}, () => ({
    x: Math.random() * c.width, y: -20 - Math.random() * c.height * .5,
    w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
    vy: 2 + Math.random() * 3, vx: -1 + Math.random() * 2,
    r: Math.random() * 6, vr: -.1 + Math.random() * .2,
    c: cols[Math.floor(Math.random() * cols.length)]
  }));
  let frames = 0;
  (function tick() {
    x.clearRect(0, 0, c.width, c.height);
    ps.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.r += p.vr;
      x.save(); x.translate(p.x, p.y); x.rotate(p.r);
      x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore();
    });
    if (++frames < 260) requestAnimationFrame(tick); else x.clearRect(0, 0, c.width, c.height);
  })();
}
