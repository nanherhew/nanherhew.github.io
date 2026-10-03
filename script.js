// ================================

// TAB SWITCHINGg

// ================================

const tabBtns = document.querySelectorAll('.tab-btn');

const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {

  btn.addEventListener('click', () => {

    tabBtns.forEach(b => b.classList.remove('active'));

    tabPanels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');

    const panel = document.getElementById(

      'tab-' + btn.dataset.tab

    );

    if (panel) {

      panel.classList.add('active');

    }

  });

});

// ================================

// LIGHTBOX

// ================================

const lightbox = document.getElementById('lightbox');

const lightboxContent = document.getElementById('lightboxContent');

const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.art-card').forEach(card => {

  card.addEventListener('click', () => {

    const img = card.querySelector('img');

    if (!img) return;

    const fullImg = document.createElement('img');

    fullImg.src = img.src;

    fullImg.alt = img.alt || '';

    lightboxContent.innerHTML = '';

    lightboxContent.appendChild(fullImg);

    lightbox.classList.add('open');

    document.body.style.overflow = 'hidden';

  });

});

// Close button

if (lightboxClose) {

  lightboxClose.addEventListener('click', closeLightbox);

}

// Click outside image

if (lightbox) {

  lightbox.addEventListener('click', event => {

    if (event.target === lightbox) {

      closeLightbox();

    }

  });

}

// ESC key

document.addEventListener('keydown', event => {

  if (event.key === 'Escape') {

    closeLightbox();

  }

});

function closeLightbox() {

  lightbox.classList.remove('open');

  document.body.style.overflow = '';

}

// ================================

// SCROLL REVEAL

// ================================

const observer = new IntersectionObserver((entries) => {

  entries.forEach(entry => {

    if (entry.isIntersecting) {

      entry.target.style.opacity = '1';

      entry.target.style.transform = 'translateY(0)';

      observer.unobserve(entry.target);

    }

  });

}, {

  threshold: 0.08

});

document

  .querySelectorAll(

    '.art-card, .about-section, .section-header'

  )

  .forEach(el => {

    el.style.opacity = '0';

    el.style.transform = 'translateY(30px)';

    el.style.transition =

      'opacity 0.6s ease, transform 0.6s ease';

    observer.observe(el);

  });

// ================================

// 18+ CONTENT WARNING

// ================================

const ageGate = document.getElementById('ageGate');

const ageEnter = document.getElementById('ageEnter');

const ageLeave = document.getElementById('ageLeave');

// Check if the visitor already entered

if (sessionStorage.getItem('nanherAgeVerified') === 'true') {

  ageGate.classList.add('hidden');

} else {

  document.body.style.overflow = 'hidden';

}

// ENTER SITE

if (ageEnter) {

  ageEnter.addEventListener('click', () => {

    sessionStorage.setItem(

      'nanherAgeVerified',

      'true'

    );

    ageGate.classList.add('hidden');

    document.body.style.overflow = '';

  });

}

// LEAVE

if (ageLeave) {

  ageLeave.addEventListener('click', () => {

    window.location.href = 'https://www.google.com';

  });

}

/* =========================================

   COMMISSION REQUEST MODAL

========================================= */

const commissionModal =

  document.getElementById("commissionModal");

const openCommission =

  document.getElementById("openCommission");

const closeCommission =

  document.getElementById("closeCommission");

const commissionForm =

  document.getElementById("commissionForm");

const commissionSuccess =

  document.getElementById("commissionSuccess");

const successClose =

  document.getElementById("successClose");

/* OPEN */

openCommission.addEventListener("click", () => {

  commissionModal.classList.add("open");

  document.body.style.overflow = "hidden";

});

/* CLOSE */

closeCommission.addEventListener("click", () => {

  commissionModal.classList.remove("open");

  document.body.style.overflow = "";

});

/* CLICK OUTSIDE */

document

  .querySelector(".commission-modal-bg")

  .addEventListener("click", () => {

    commissionModal.classList.remove("open");

    document.body.style.overflow = "";

  });

/* ESC */

document.addEventListener("keydown", (event) => {

  if (event.key === "Escape") {

    commissionModal.classList.remove("open");

    document.body.style.overflow = "";

  }

});

/* =========================================

   SUPABASE

========================================= */

const SUPABASE_URL =

  "https://orgrbrcfjssvdaxlxxfx.supabase.co";

const SUPABASE_KEY =

  "sb_publishable_ZDeBcBinU4rYXPemRjO4DA_-hGWs6YH";

const supabaseClient = window.supabase.createClient(

  SUPABASE_URL,

  SUPABASE_KEY

);

/* =========================================

   COMMISSION SUBMIT

========================================= */

commissionForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const formData = new FormData(commissionForm);

  const commission = {

    name: formData.get("name"),

    contact_method: formData.get("contactMethod"),

    contact: formData.get("contact"),

    email: formData.get("email"),

    commission_type: formData.get("type"),

    description: formData.get("description"),

    references_url: formData.get("references") || null,

    status: "RECEIVED",

    is_public: false

  };

  const { error } = await supabaseClient

    .from("commissions")

    .insert([commission]);

  if (error) {

    console.error("Commission submission error:", error);

    alert(

      "Something went wrong while sending your request. Please try again."

    );

    return;

  }

  /* HIDE FORM */

  commissionForm.style.display = "none";

  document.querySelector(

    ".commission-modal-intro"

  ).style.display = "none";

  /* SHOW SUCCESS */

  commissionSuccess.classList.add("show");

});

/* SUCCESS CLOSE */

successClose.addEventListener("click", () => {

  commissionSuccess.classList.remove("show");

  commissionForm.style.display = "";

  document.querySelector(

    ".commission-modal-intro"

  ).style.display = "";

  commissionForm.reset();

  commissionModal.classList.remove("open");

  document.body.style.overflow = "";

});

// =========================================

// COMMISSION CONTACT + TERMS

// =========================================

const termsModal =

  document.getElementById("termsModal");

const openTerms =

  document.getElementById("openTerms");

const closeTerms =

  document.getElementById("closeTerms");

const termsDone =

  document.getElementById("termsDone");

const termsBg =

  document.querySelector(".terms-modal-bg");

const translateTerms =

  document.getElementById("translateTerms");

const termsEnglish =

  document.getElementById("termsEnglish");

const termsSpanish =

  document.getElementById("termsSpanish");

// =========================================

// OPEN TERMS

// =========================================

if (openTerms) {

  openTerms.addEventListener("click", () => {

    termsModal.classList.add("open");

  });

}

// =========================================

// CLOSE TERMS

// =========================================

function closeTermsModal() {

  termsModal.classList.remove("open");

}

if (closeTerms) {

  closeTerms.addEventListener(

    "click",

    closeTermsModal

  );

}

if (termsDone) {

  termsDone.addEventListener(

    "click",

    closeTermsModal

  );

}

if (termsBg) {

  termsBg.addEventListener(

    "click",

    closeTermsModal

  );

}

// =========================================

// TRANSLATE TERMS

// =========================================

let termsAreSpanish = false;

if (translateTerms) {

  translateTerms.addEventListener("click", () => {

    termsAreSpanish = !termsAreSpanish;

    if (termsAreSpanish) {

      termsEnglish.style.display = "none";

      termsSpanish.style.display = "block";

      translateTerms.textContent =

        "ENGLISH / EN";

    } else {

      termsEnglish.style.display = "block";

      termsSpanish.style.display = "none";

      translateTerms.textContent =

        "TRANSLATE / ES";

    }

  });

}

// =========================================

// ESC — TERMS

// =========================================

document.addEventListener("keydown", (event) => {

  if (event.key === "Escape") {

    if (termsModal.classList.contains("open")) {

      closeTermsModal();

    }

  }

});

// =========================================

// CONTACT METHOD → PLACEHOLDER

// =========================================

const contactMethodInputs =

  document.querySelectorAll(

    'input[name="contactMethod"]'

  );

const commissionContact =

  document.getElementById(

    "commissionContact"

  );

contactMethodInputs.forEach(input => {

  input.addEventListener("change", () => {

    const platform = input.value;

    if (platform === "Discord") {

      commissionContact.placeholder =

        "@yourusername";

    }

    if (platform === "X") {

      commissionContact.placeholder =

        "@yourusername";

    }

    if (platform === "Instagram") {

      commissionContact.placeholder =

        "@yourusername";

    }

    if (platform === "Reddit") {

      commissionContact.placeholder =

        "u/yourusername";

    }

    if (platform === "Bluesky") {

      commissionContact.placeholder =

        "@yourusername.bsky.social";

    }

  });

});

        // =========================================

// COMMISSION SUBMIT LOCK

// =========================================

const commissionTerms =

  document.getElementById("commissionTerms");

const commissionSubmit =

  document.getElementById("commissionSubmit");

if (commissionTerms && commissionSubmit) {

  commissionTerms.addEventListener("change", () => {

    if (commissionTerms.checked) {

      commissionSubmit.disabled = false;

      commissionSubmit.classList.add("ready");

    } else {

      commissionSubmit.disabled = true;

      commissionSubmit.classList.remove("ready");

    }

  });

}

// =========================================

// HERO MOUSE PARALLAX

// =========================================

const hero = document.querySelector(".hero");

if (hero) {

  let targetX = 0;

  let targetY = 0;

  let currentX = 0;

  let currentY = 0;

  // MOUSE MOVEMENT

  document.addEventListener("mousemove", (event) => {

    const x =

      (event.clientX / window.innerWidth) - 0.5;

    const y =

      (event.clientY / window.innerHeight) - 0.5;

    // Maximum movement

    targetX = x * 40;

    targetY = y * 40;

  });

  // SMOOTH ANIMATION

  function animateParallax() {

    currentX +=

      (targetX - currentX) * 0.08;

    currentY +=

      (targetY - currentY) * 0.08;

    hero.style.setProperty(

      "--parallax-x",

      `${currentX}px`

    );

    hero.style.setProperty(

      "--parallax-y",

      `${currentY}px`

    );

    requestAnimationFrame(

      animateParallax

    );

  }

  animateParallax();

}

/* =========================================================

   COMM STATUS TABS

   ========================================================= */

const commStatusTabs = document.querySelectorAll(".comm-status-tab");

const commStatusPanels = document.querySelectorAll(".comm-status-panel");

commStatusTabs.forEach((tab) => {

  tab.addEventListener("click", () => {

    const target = tab.dataset.statusTab;

    /* Remove active state from all tabs */

    commStatusTabs.forEach((item) => {

      item.classList.remove("active");

    });

    /* Hide all panels */

    commStatusPanels.forEach((panel) => {

      panel.classList.remove("active");

    });

    /* Activate clicked tab */

    tab.classList.add("active");

    /* Show matching panel */

    const targetPanel = document.getElementById(

      `status-${target}`

    );

    if (targetPanel) {

      targetPanel.classList.add("active");

    }

  });

});

/* =========================================

   PUBLIC COMMISSION STATUS

========================================= */

const publicFinishedGrid =

  document.getElementById("commFinishedGrid");

const publicProgressList =

  document.getElementById("commProgressList");

const publicStatusOrder = [

  "SKETCH",

  "ADJUSTING",

  "REFINING",

  "ALMOST DONE"

];

const publicStatusClass = {

  SKETCH: "status-red",

  ADJUSTING: "status-yellow",

  REFINING: "status-green",

  "ALMOST DONE": "status-orange"

};

async function loadPublicCommissionStatus() {

  if (

    !publicFinishedGrid &&

    !publicProgressList

  ) {

    return;

  }

  const {

    data,

    error

  } = await supabaseClient

    .from("public_commission_status")

    .select(

      "id, name, commission_type, status, created_at, image_url"

    )

    .order("created_at", {

      ascending: true

    });

  if (error) {

    console.error(

      "Public commission status error:",

      error

    );

    return;

  }

  const commissions =

    data || [];

  renderPublicFinished(

    commissions

  );

  renderPublicProgress(

    commissions

  );

}

function renderPublicFinished(

  commissions

) {

  if (!publicFinishedGrid) {

    return;

  }

  const finished =

    commissions.filter(

      commission =>

        commission.status === "FINISHED"

    );

  if (!finished.length) {

    publicFinishedGrid.innerHTML = `

      <div class="comm-status-empty">

        NO FINISHED COMMISSIONS YET.

      </div>

    `;

    return;

  }

  publicFinishedGrid.innerHTML =

    finished

      .map(

        (commission, index) => {

          const image =

            commission.image_url

              ? `

                <img

                  src="${escapePublicHTML(

                    commission.image_url

                  )}"

                  alt="Commission for ${escapePublicHTML(

                    commission.name

                  )}"

                >

              `

              : `

                <div class="comm-finished-placeholder">

                  FINISHED

                </div>

              `;

          return `

            <article class="comm-finished-card">

              <div class="comm-finished-image">

                ${image}

                <span class="comm-finished-number">

                  ${String(index + 1).padStart(3, "0")}

                </span>

              </div>

              <div class="comm-finished-info">

                <span>

                  COMMISSION / FINISHED

                </span>

                <strong>

                  ${escapePublicHTML(

                    commission.name

                  )}

                </strong>

              </div>

            </article>

          `;

        }

      )

      .join("");

}

/* =========================================

   PUBLIC COMMISSION PROGRESS

========================================= */

function renderPublicProgress(commissions) {

  if (!publicProgressList) {

    return;

  }

  const progress = commissions.filter(

    commission =>

      publicStatusOrder.includes(commission.status)

  );

  if (!progress.length) {

    publicProgressList.innerHTML = `

      <div class="comm-status-empty">

        NO COMMISSIONS IN PROGRESS.

      </div>

    `;

    return;

  }

  publicProgressList.innerHTML = progress

    .map((commission, index) => {

      const status = commission.status;

      const statusClass =

        publicStatusClass[status] || "status-red";

      const image = commission.image_url

        ? `

          <img

            src="${escapePublicHTML(commission.image_url)}"

            alt="Commission for ${escapePublicHTML(commission.name)}"

          >

        `

        : `

          <div class="comm-progress-placeholder">

            NO IMAGE

          </div>

        `;

      return `

        <article class="comm-progress-item">

          <div class="comm-progress-image">

            ${image}

          </div>

          <div class="comm-progress-main">

            <span

              class="comm-progress-line ${statusClass}"

            ></span>

            <div>

              <strong>

                ${escapePublicHTML(commission.name)}

              </strong>

              <span>

                ${escapePublicHTML(status)}

              </span>

            </div>

          </div>

          <span class="comm-progress-code">

            COMM / ${String(index + 1).padStart(3, "0")}

          </span>

        </article>

      `;

    })

    .join("");

}

/* =========================================

   PUBLIC HTML ESCAPE

========================================= */

function escapePublicHTML(value) {

  if (

    value === null ||

    value === undefined

  ) {

    return "";

  }

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}

/* =========================================

   LOAD PUBLIC COMMISSIONS

========================================= */

loadPublicCommissionStatus();
