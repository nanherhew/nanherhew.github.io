// ================================
// TAB SWITCHING
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
