/* ============================================================
   WISNEY — interactive magic
   Plain vanilla JS, no dependencies. State persists in memory.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- tiny helpers ---------- */
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const money = (n) => "€" + n.toFixed(2);

  /* ---------- state ---------- */
  const state = {
    cart: [],        // {id, qty}
    wishlist: [],    // [id]
    points: 0,
    world: null,
    name: null,
    spun: false,
  };

  /* ---------- product catalogue ---------- */
  const PRODUCTS = [
    { id: "woody", name: "Woody Interactive Talking Figure", cat: "toys", emoji: "🤠", price: 40, old: null, rating: "★★★★★ (812)", badge: "Bestseller", story: "Reach for the sky — pull-string phrases straight from Toy Story.", world: "Toy Story" },
    { id: "buzz", name: "Buzz Lightyear Talking Figure", cat: "toys", emoji: "🚀", price: 40, old: null, rating: "★★★★★ (1.2k)", badge: "Bestseller", story: "To infinity and beyond, with light-up wings & 30 phrases.", world: "Toy Story" },
    { id: "jessie", name: "Jessie Interactive Talking Figure", cat: "toys", emoji: "🐴", price: 40, old: null, rating: "★★★★☆ (540)", badge: "Bestseller", story: "Yee-haw! The yodelling cowgirl joins the gang.", world: "Toy Story" },
    { id: "mickey-plush", name: "Mickey Mouse Soft Plush", cat: "plush", emoji: "🐭", price: 22, old: 28, rating: "★★★★★ (2.4k)", badge: "Sale", story: "The original icon — huggably soft and timeless.", world: null },
    { id: "elsa-dress", name: "Elsa Frozen Costume Dress", cat: "apparel", emoji: "👗", price: 35, old: null, rating: "★★★★★ (980)", badge: "Trending", story: "Let it go in sparkle — light-up snowflake details.", world: "Frozen" },
    { id: "simba-plush", name: "Simba Lion King Plush", cat: "plush", emoji: "🦁", price: 26, old: null, rating: "★★★★★ (760)", badge: "New", story: "Remember who you are — the king of cuddles.", world: "The Lion King" },
    { id: "lightsaber", name: "Star Wars Lightsaber", cat: "toys", emoji: "⚔️", price: 45, old: 55, rating: "★★★★★ (1.5k)", badge: "Sale", story: "Light & sound effects. The Force is strong with this one.", world: "Star Wars" },
    { id: "spidey-hoodie", name: "Spider-Man Kids Hoodie", cat: "apparel", emoji: "🕷️", price: 30, old: null, rating: "★★★★☆ (430)", badge: "New", story: "With great comfort comes great web-slinging style.", world: "Marvel" },
    { id: "castle-lamp", name: "Magic Castle Night Light", cat: "home", emoji: "🏰", price: 38, old: null, rating: "★★★★★ (650)", badge: "Trending", story: "Project a starry castle onto the ceiling at bedtime.", world: null },
    { id: "stitch-mug", name: "Stitch Colour-Change Mug", cat: "home", emoji: "🥤", price: 14, old: 18, rating: "★★★★★ (1.1k)", badge: "Sale", story: "Add a hot drink and watch Stitch appear. Ohana!", world: null },
    { id: "rapunzel-plush", name: "Rapunzel Plush Doll", cat: "plush", emoji: "👸", price: 24, old: null, rating: "★★★★☆ (390)", badge: "New", story: "Let down your hair — beautifully braided detail.", world: "Princess" },
    { id: "mickey-ears", name: "Sparkle Mickey Ears", cat: "apparel", emoji: "🎀", price: 18, old: null, rating: "★★★★★ (3.1k)", badge: "Bestseller", story: "The ultimate park accessory — glitter that never quits.", world: null },
  ];
  const byId = (id) => PRODUCTS.find((p) => p.id === id);

  /* ============================================================
     LOADER
     ============================================================ */
  window.addEventListener("load", () => {
    setTimeout(() => {
      $("#loader").classList.add("hide");
      // open personalisation after the curtain lifts
      setTimeout(openPersona, 700);
    }, 1900);
  });

  /* ============================================================
     SPARKLE CURSOR TRAIL
     ============================================================ */
  const sparkChars = ["✨", "⭐", "💫", "🌟"];
  let lastSpark = 0;
  document.addEventListener("pointermove", (e) => {
    const now = Date.now();
    if (now - lastSpark < 45) return;
    lastSpark = now;
    const s = document.createElement("span");
    s.className = "spark";
    s.textContent = sparkChars[(Math.random() * sparkChars.length) | 0];
    s.style.left = e.clientX + "px";
    s.style.top = e.clientY + "px";
    $("#sparkle-layer").appendChild(s);
    setTimeout(() => s.remove(), 800);
  });

  /* ============================================================
     CONFETTI
     ============================================================ */
  const canvas = $("#confetti-canvas");
  const ctx = canvas.getContext("2d");
  let confetti = [];
  function sizeCanvas() { canvas.width = innerWidth; canvas.height = innerHeight; }
  sizeCanvas();
  addEventListener("resize", sizeCanvas);
  function burstConfetti(count = 120) {
    const colors = ["#ff5fa2", "#ffd54a", "#7b4bff", "#4ad6ff", "#28b76b", "#ff9a3c"];
    for (let i = 0; i < count; i++) {
      confetti.push({
        x: innerWidth / 2, y: innerHeight / 3,
        vx: (Math.random() - 0.5) * 14, vy: Math.random() * -14 - 4,
        size: Math.random() * 8 + 4, color: colors[(Math.random() * colors.length) | 0],
        rot: Math.random() * 360, vr: (Math.random() - 0.5) * 20, life: 100,
      });
    }
    if (confetti.length === count) requestAnimationFrame(drawConfetti);
  }
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.rot += p.vr; p.life--;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(p.life / 100, 0);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    confetti = confetti.filter((p) => p.life > 0 && p.y < canvas.height + 40);
    if (confetti.length) requestAnimationFrame(drawConfetti);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /* ============================================================
     THEME TOGGLE (day / night at the park)
     ============================================================ */
  $("#themeToggle").addEventListener("click", () => {
    const html = document.documentElement;
    const night = html.getAttribute("data-theme") === "night";
    html.setAttribute("data-theme", night ? "day" : "night");
    $(".theme-icon").textContent = night ? "☀️" : "🌙";
  });

  /* ============================================================
     NAVBAR scroll shadow + live counters
     ============================================================ */
  addEventListener("scroll", () => {
    $("#nav").classList.toggle("scrolled", scrollY > 20);
  });
  // live viewers jitter for social proof
  setInterval(() => {
    const el = $("#liveViewers");
    let n = parseInt(el.textContent.replace(/,/g, ""), 10);
    n += (Math.random() * 14 - 6) | 0;
    n = Math.max(1100, Math.min(1600, n));
    el.textContent = n.toLocaleString();
  }, 2600);

  /* ============================================================
     COUNTDOWN (midnight magic drop)
     ============================================================ */
  function tickCountdown() {
    const now = new Date();
    const end = new Date(now); end.setHours(24, 0, 0, 0); // next midnight
    let diff = Math.max(0, end - now);
    const h = String(Math.floor(diff / 3.6e6)).padStart(2, "0");
    const m = String(Math.floor((diff % 3.6e6) / 6e4)).padStart(2, "0");
    const s = String(Math.floor((diff % 6e4) / 1000)).padStart(2, "0");
    const el = $("#countdown");
    if (el) el.textContent = `${h}:${m}:${s}`;
  }
  setInterval(tickCountdown, 1000); tickCountdown();

  /* ============================================================
     RENDER PRODUCTS
     ============================================================ */
  function renderProducts(filter = "all") {
    const grid = $("#productGrid");
    let list = filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === filter);
    // personalised world floats to the top
    if (state.world) {
      list = [...list].sort((a, b) => (b.world === state.world) - (a.world === state.world));
    }
    grid.innerHTML = list.map(cardHTML).join("");
    bindCards();
  }
  function cardHTML(p) {
    const wished = state.wishlist.includes(p.id) ? "active" : "";
    const badgeClass = p.badge === "Sale" ? "sale" : "";
    const priceHTML = p.old
      ? `<span class="old">${money(p.old)}</span>${money(p.price)}`
      : money(p.price);
    return `
      <article class="product-card" data-id="${p.id}">
        <div class="pc-media">${p.emoji}
          <span class="pc-badge ${badgeClass}">${p.badge === "Bestseller" ? "🏆 " : ""}${p.badge}</span>
          <button class="pc-wish ${wished}" data-wish="${p.id}" title="Add to wishlist">${state.wishlist.includes(p.id) ? "💖" : "🤍"}</button>
        </div>
        <div class="pc-body">
          <span class="pc-cat">${p.cat}</span>
          <h3 class="pc-name">${p.name}</h3>
          <p class="pc-story">${p.story}</p>
          <div class="pc-rating">${p.rating}</div>
          <div class="pc-foot">
            <span class="pc-price">${priceHTML}</span>
            <button class="pc-add" data-add="${p.id}">Add 🛍️</button>
          </div>
        </div>
      </article>`;
  }
  function bindCards() {
    $$("[data-add]").forEach((b) =>
      b.addEventListener("click", (e) => {
        addToCart(b.dataset.add);
        flyToCart(e.currentTarget.closest(".product-card").querySelector(".pc-media"));
        b.textContent = "Added ✓"; b.classList.add("added");
        setTimeout(() => { b.textContent = "Add 🛍️"; b.classList.remove("added"); }, 1200);
      })
    );
    $$("[data-wish]").forEach((b) =>
      b.addEventListener("click", () => toggleWish(b.dataset.wish))
    );
  }
  // filter chips
  $$("#filterChips .chip").forEach((c) =>
    c.addEventListener("click", () => {
      $$("#filterChips .chip").forEach((x) => x.classList.remove("active"));
      c.classList.add("active");
      renderProducts(c.dataset.filter);
    })
  );

  /* ============================================================
     CART
     ============================================================ */
  function addToCart(id) {
    const line = state.cart.find((l) => l.id === id);
    if (line) line.qty++; else state.cart.push({ id, qty: 1 });
    updateCart();
    pulse($("#cartBtn"));
  }
  function changeQty(id, delta) {
    const line = state.cart.find((l) => l.id === id);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) state.cart = state.cart.filter((l) => l.id !== id);
    updateCart();
  }
  function cartTotal() {
    return state.cart.reduce((s, l) => s + byId(l.id).price * l.qty, 0);
  }
  function updateCart() {
    const count = state.cart.reduce((s, l) => s + l.qty, 0);
    $("#cartCount").textContent = count;
    const total = cartTotal();
    $("#cartTotal").textContent = money(total);
    $("#cartPoints").textContent = Math.round(total * 10);

    // free shipping nudge
    const threshold = 50;
    const remaining = Math.max(0, threshold - total);
    $("#shipFill").style.width = Math.min(100, (total / threshold) * 100) + "%";
    $("#shipText").textContent = remaining > 0
      ? `Add ${money(remaining)} for FREE shipping ✨`
      : "🎉 You've unlocked FREE magical shipping!";

    // items
    const wrap = $("#cartItems");
    if (!state.cart.length) {
      wrap.innerHTML = `<div class="cart-empty"><span class="ce-emoji">🪄</span>Your bag is empty.<br>Let's find some magic!</div>`;
      return;
    }
    wrap.innerHTML = state.cart.map((l) => {
      const p = byId(l.id);
      return `
        <div class="cart-item">
          <div class="ci-media">${p.emoji}</div>
          <div class="ci-info">
            <div class="ci-name">${p.name}</div>
            <div class="ci-price">${money(p.price)}</div>
            <div class="ci-qty">
              <button data-dec="${p.id}">−</button>
              <span>${l.qty}</span>
              <button data-inc="${p.id}">+</button>
            </div>
          </div>
          <button class="ci-remove" data-rm="${p.id}" title="Remove">🗑️</button>
        </div>`;
    }).join("");
    $$("[data-inc]").forEach((b) => b.addEventListener("click", () => changeQty(b.dataset.inc, 1)));
    $$("[data-dec]").forEach((b) => b.addEventListener("click", () => changeQty(b.dataset.dec, -1)));
    $$("[data-rm]").forEach((b) => b.addEventListener("click", () => { state.cart = state.cart.filter((l) => l.id !== b.dataset.rm); updateCart(); }));
  }

  // fly-to-cart animation
  function flyToCart(mediaEl) {
    const rect = mediaEl.getBoundingClientRect();
    const cart = $("#cartBtn").getBoundingClientRect();
    const fly = document.createElement("div");
    fly.className = "fly";
    fly.textContent = mediaEl.textContent.trim().slice(0, 2);
    fly.style.left = rect.left + rect.width / 2 + "px";
    fly.style.top = rect.top + "px";
    document.body.appendChild(fly);
    requestAnimationFrame(() => {
      fly.style.left = cart.left + "px";
      fly.style.top = cart.top + "px";
      fly.style.transform = "scale(.2)";
      fly.style.opacity = "0";
    });
    setTimeout(() => fly.remove(), 850);
  }

  /* ---------- cart drawer open/close ---------- */
  const overlay = $("#overlay");
  function openDrawer(el) { el.classList.add("open"); overlay.classList.add("show"); }
  function closeDrawers() { $("#cartDrawer").classList.remove("open"); $("#wishDrawer").classList.remove("open"); overlay.classList.remove("show"); }
  $("#cartBtn").addEventListener("click", () => openDrawer($("#cartDrawer")));
  $("#closeCart").addEventListener("click", closeDrawers);
  $("#wishlistBtn").addEventListener("click", () => { renderWishlist(); openDrawer($("#wishDrawer")); });
  $("#closeWish").addEventListener("click", closeDrawers);
  overlay.addEventListener("click", closeDrawers);

  $("#checkoutBtn").addEventListener("click", () => {
    if (!state.cart.length) { tinkSay("Your bag's empty! Add a little magic first ✨"); openChat(); return; }
    const earned = Math.round(cartTotal() * 10);
    addPoints(earned);
    state.cart = [];
    updateCart();
    closeDrawers();
    burstConfetti(180);
    showToast("🎉", `Order placed! You earned <b>${earned}</b> Pixie Points`, "Just now");
  });

  /* ============================================================
     WISHLIST
     ============================================================ */
  function toggleWish(id) {
    const i = state.wishlist.indexOf(id);
    if (i > -1) state.wishlist.splice(i, 1);
    else { state.wishlist.push(id); pulse($("#wishlistBtn")); }
    $("#wishCount").textContent = state.wishlist.length;
    // update card heart in place
    renderProducts($("#filterChips .chip.active").dataset.filter);
  }
  function renderWishlist() {
    const wrap = $("#wishItems");
    if (!state.wishlist.length) {
      wrap.innerHTML = `<div class="cart-empty"><span class="ce-emoji">💝</span>No favourites yet.<br>Tap the heart on anything you love!</div>`;
      return;
    }
    wrap.innerHTML = state.wishlist.map((id) => {
      const p = byId(id);
      return `
        <div class="cart-item">
          <div class="ci-media">${p.emoji}</div>
          <div class="ci-info">
            <div class="ci-name">${p.name}</div>
            <div class="ci-price">${money(p.price)}</div>
          </div>
          <button class="pc-add" data-wadd="${p.id}">Add 🛍️</button>
        </div>`;
    }).join("");
    $$("[data-wadd]").forEach((b) => b.addEventListener("click", () => { addToCart(b.dataset.wadd); b.textContent = "Added ✓"; }));
  }

  /* ============================================================
     POINTS / TIERS
     ============================================================ */
  const TIERS = [0, 500, 1500, 3000];
  function addPoints(n) {
    state.points += n;
    $("#pointsCount").textContent = state.points.toLocaleString();
    updateTiers();
    pulse($("#rewardsBtn"));
  }
  function updateTiers() {
    const max = 3000;
    const pct = Math.min(100, (state.points / max) * 100);
    $("#tierFill").style.width = pct + "%";
    $$(".tier-node").forEach((node) => {
      const t = +node.dataset.tier;
      node.classList.toggle("reached", state.points >= t);
    });
  }
  $("#rewardsBtn").addEventListener("click", () => location.assign("#rewards"));
  $("#earnPointsBtn").addEventListener("click", () => {
    addPoints(100);
    burstConfetti(80);
    showToast("🪄", "You earned <b>100</b> Pixie Points!", "Just now");
  });

  /* ============================================================
     GIFT FINDER QUIZ
     ============================================================ */
  const QUIZ = [
    { q: "Who are we finding magic for?", opts: [
      { t: "A little dreamer", e: "🧒", k: "kid" },
      { t: "A big kid at heart", e: "🧑", k: "adult" },
      { t: "A super-fan", e: "🤩", k: "fan" },
      { t: "Treating myself", e: "💁", k: "self" },
    ]},
    { q: "What's their vibe?", opts: [
      { t: "Adventure & action", e: "🚀", k: "action" },
      { t: "Cute & cuddly", e: "🧸", k: "cuddly" },
      { t: "Sparkle & style", e: "✨", k: "style" },
      { t: "Cosy at home", e: "🏠", k: "home" },
    ]},
    { q: "Pick a budget", opts: [
      { t: "Under €20", e: "💛", k: "low" },
      { t: "€20–€35", e: "💜", k: "mid" },
      { t: "€35+", e: "👑", k: "high" },
      { t: "Surprise me!", e: "🎲", k: "any" },
    ]},
  ];
  let quizStep = 0; const quizAns = [];
  function renderQuiz() {
    $("#quizFill").style.width = (quizStep / QUIZ.length) * 100 + "%";
    const step = QUIZ[quizStep];
    $("#quizStage").innerHTML = `
      <div class="quiz-q">${step.q}</div>
      <div class="quiz-options">
        ${step.opts.map((o, i) => `<button class="quiz-opt" data-k="${o.k}"><span>${o.e}</span>${o.t}</button>`).join("")}
      </div>`;
    $$(".quiz-opt").forEach((b) => b.addEventListener("click", () => { quizAns[quizStep] = b.dataset.k; quizStep++; quizStep < QUIZ.length ? renderQuiz() : showQuizResult(); }));
  }
  function showQuizResult() {
    $("#quizFill").style.width = "100%";
    // simple matching logic
    const [who, vibe, budget] = quizAns;
    let pick;
    if (vibe === "cuddly") pick = byId("simba-plush");
    else if (vibe === "style") pick = byId("mickey-ears");
    else if (vibe === "home") pick = byId("castle-lamp");
    else pick = byId("buzz");
    if (budget === "low") pick = byId("stitch-mug");
    if (budget === "high" && vibe !== "cuddly") pick = byId("lightsaber");
    if (state.world) {
      const worldMatch = PRODUCTS.find((p) => p.world === state.world);
      if (worldMatch) pick = worldMatch;
    }
    $("#quizStage").innerHTML = `
      <div class="quiz-result">
        <div class="qr-emoji">${pick.emoji}</div>
        <h3>The magic says... ${pick.name}!</h3>
        <p>${pick.story}</p>
        <div class="pc-price" style="font-size:1.4rem;margin-bottom:14px;">${money(pick.price)}</div>
        <button class="btn btn-primary" id="quizAdd">Add to Bag 🛍️</button>
        <div><button class="btn btn-ghost quiz-restart" id="quizRestart">Try again 🔄</button></div>
      </div>`;
    burstConfetti(60);
    $("#quizAdd").addEventListener("click", () => { addToCart(pick.id); openDrawer($("#cartDrawer")); });
    $("#quizRestart").addEventListener("click", () => { quizStep = 0; quizAns.length = 0; renderQuiz(); });
  }

  /* ============================================================
     AR PREVIEW
     ============================================================ */
  $$(".ar-picker button").forEach((b) =>
    b.addEventListener("click", () => {
      const fig = $("#arFigure");
      fig.style.animation = "none"; fig.offsetHeight; // reflow
      fig.style.animation = "arPop .5s ease";
      fig.textContent = b.dataset.emoji;
    })
  );
  $("#arBtn").addEventListener("click", () => {
    showToast("📲", "AR preview launched — point your camera at a flat surface!", "Demo");
    $("#ar").scrollIntoView({ behavior: "smooth" });
    pulse($("#arStage"));
  });

  /* ============================================================
     SPIN THE WHEEL
     ============================================================ */
  const PRIZES = [
    { label: "+50 Points 🪄", deg: 30, action: () => addPoints(50) },
    { label: "10% OFF 🎉", deg: 90, action: () => showToast("🎟️", "Code <b>PIXIE10</b> applied!", "Spin win") },
    { label: "Free Plush 🧸", deg: 150, action: () => { addToCart("mickey-plush"); } },
    { label: "+100 Points 🌟", deg: 210, action: () => addPoints(100) },
    { label: "Free Shipping 🚚", deg: 270, action: () => showToast("🚚", "Free shipping unlocked on your next order!", "Spin win") },
    { label: "Mystery Gift 🎁", deg: 330, action: () => { addToCart("stitch-mug"); } },
  ];
  let wheelRot = 0;
  $("#spinBtn").addEventListener("click", () => {
    if (state.spun) { $("#spinResult").textContent = "Come back tomorrow for another spin! ✨"; return; }
    state.spun = true;
    const prize = PRIZES[(Math.random() * PRIZES.length) | 0];
    const spins = 5 * 360;
    wheelRot += spins + (360 - prize.deg);
    $("#wheel").style.transform = `rotate(${wheelRot}deg)`;
    $("#spinResult").textContent = "Spinning the magic...";
    setTimeout(() => {
      $("#spinResult").textContent = `🎊 You won ${prize.label}`;
      prize.action();
      burstConfetti(140);
    }, 4600);
  });

  /* ============================================================
     PERSONALISATION MODAL
     ============================================================ */
  const personaOverlay = $("#personaOverlay");
  const personaModal = $(".persona-modal");
  function openPersona() { personaOverlay.classList.add("show"); personaModal.classList.add("open"); }
  function closePersona() { personaOverlay.classList.remove("show"); personaModal.classList.remove("open"); }
  $$("#personaGrid button").forEach((b) =>
    b.addEventListener("click", () => {
      state.world = b.dataset.world;
      applyPersona();
      closePersona();
      burstConfetti(80);
      showToast(b.dataset.emoji, `Welcome to the world of <b>${state.world}</b>!`, "Personalised");
    })
  );
  $("#personaSkip").addEventListener("click", () => {
    const name = $("#personaName").value.trim();
    if (name) { state.name = name; applyPersona(); }
    closePersona();
  });
  $("#personaName").addEventListener("input", (e) => { state.name = e.target.value.trim() || null; });
  function applyPersona() {
    const greet = $("#heroGreeting");
    const parts = [];
    if (state.name) parts.push(`Hi ${state.name}!`);
    parts.push(state.world ? `Your ${state.world} magic awaits` : "Welcome to the magic");
    greet.innerHTML = "✨ " + parts.join(" ");
    $("#startJourney").textContent = state.world ? `🪄 Explore ${state.world}` : "🪄 Begin Your Journey";
    renderProducts($("#filterChips .chip.active")?.dataset.filter || "all");
  }
  $("#startJourney").addEventListener("click", () => {
    if (!state.world) openPersona();
    else $("#shop").scrollIntoView({ behavior: "smooth" });
  });

  /* ============================================================
     TINKER BELL CHAT
     ============================================================ */
  const chatPanel = $("#chatPanel");
  function openChat() { chatPanel.classList.add("open"); if (!$("#chatBody").children.length) tinkSay("Hi! I'm Tinker Bell 🧚 your shopping fairy. How can I sprinkle some help today?"); }
  $("#chatFab").addEventListener("click", () => chatPanel.classList.toggle("open"));
  $("#closeChat").addEventListener("click", () => chatPanel.classList.remove("open"));
  function addMsg(text, who) {
    const m = document.createElement("div");
    m.className = "msg " + who;
    m.innerHTML = text;
    $("#chatBody").appendChild(m);
    $("#chatBody").scrollTop = $("#chatBody").scrollHeight;
  }
  function tinkSay(text) { setTimeout(() => addMsg(text, "bot"), 350); }
  function tinkReply(q) {
    q = q.toLowerCase();
    if (/track|order|delivery|where/.test(q)) return "Your order #WIS-2049 is being sprinkled with pixie dust and ships tomorrow ✨ You'll get a magical tracking link by email!";
    if (/gift|idea|present/.test(q)) return "Ooh, try our Magic Gift Finder! 🪄 Just three little questions and I'll conjure the perfect present. Scroll up to the Gift Finder section!";
    if (/point|reward|pixie|loyal/.test(q)) return "You earn 10 Pixie Points per €1 spent! 🪄 Climb from Dreamer 🌱 to Royalty 👑 and unlock perks like early access and birthday surprises 🎂";
    if (/ship|return|deliver/.test(q)) return "Free magical shipping on orders over €50 🚚 and 100-day happy returns — no quibbles, just sparkle! ↩️";
    if (/discount|code|sale|cheap|offer/.test(q)) return "Spin the Pixie Wheel for a daily surprise 🎡 and new members get a 10% welcome spell. Pure magic! ✨";
    if (/hello|hi|hey/.test(q)) return "Hello there! 🧚 Ready to make some magic? Ask me about gifts, points or shipping!";
    if (/woody|buzz|jessie|toy/.test(q)) return "Our Toy Story talking figures are bestsellers at €40 each 🤠🚀 Pull the string and they really talk! Want me to add one to your bag?";
    return "That's a magical question! ✨ I can help with orders, gift ideas, Pixie Points, or shipping — just ask!";
  }
  $("#chatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const t = $("#chatText").value.trim();
    if (!t) return;
    addMsg(t, "user"); $("#chatText").value = "";
    tinkSay(tinkReply(t));
  });
  $$("#chatQuick button").forEach((b) =>
    b.addEventListener("click", () => { addMsg(b.textContent, "user"); tinkSay(tinkReply(b.textContent)); })
  );

  /* ============================================================
     NEWSLETTER
     ============================================================ */
  $("#newsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    burstConfetti(120);
    addPoints(50);
    showToast("📧", "You're on the Magic List! <b>10% code</b> sent ✨ (+50 pts)", "Welcome");
  });

  /* ============================================================
     SOCIAL-PROOF TOASTS
     ============================================================ */
  function showToast(emoji, text, time) {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span class="t-emoji">${emoji}</span><div><div class="t-text">${text}</div><div class="t-time">${time}</div></div>`;
    $("#toastStack").appendChild(t);
    setTimeout(() => t.remove(), 5200);
  }
  const PROOF = [
    ["🛍️", "<b>Emma</b> in London just bought Buzz Lightyear", "2 min ago"],
    ["💖", "<b>Jack</b> added Mickey Ears to his wishlist", "just now"],
    ["🎉", "<b>Sofia</b> reached <b>Royalty</b> tier!", "5 min ago"],
    ["🤠", "<b>Liam</b> in Leeds bought the Woody figure", "1 min ago"],
    ["❄️", "<b>Ava</b> grabbed the Elsa dress", "3 min ago"],
    ["⚔️", "<b>Noah</b> won a lightsaber on the Pixie Wheel", "just now"],
  ];
  let proofIdx = 0;
  function dripProof() {
    const [e, txt, time] = PROOF[proofIdx % PROOF.length];
    showToast(e, txt, time);
    proofIdx++;
  }
  setTimeout(() => { dripProof(); setInterval(dripProof, 9000); }, 4000);

  /* ============================================================
     REVEAL ON SCROLL
     ============================================================ */
  function setupReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$(".section, .product-card, .trust-strip").forEach((el) => { el.classList.add("reveal"); io.observe(el); });
  }

  /* ---------- small utils ---------- */
  function pulse(el) {
    el.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }],
      { duration: 350, easing: "ease" }
    );
  }

  /* ============================================================
     INIT
     ============================================================ */
  renderProducts();
  renderQuiz();
  updateCart();
  updateTiers();
  setupReveal();
})();
