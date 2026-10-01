// ================================
// TAB SWITCHINGG
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


/* SUBMIT */

commissionForm.addEventListener("submit", (event) => {

  event.preventDefault();

  commissionForm.style.display = "none";

  document.querySelector(
    ".commission-modal-intro"
  ).style.display = "none";

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
