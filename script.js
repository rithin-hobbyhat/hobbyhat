/**
 * HOBBY HAT — Interactive Behaviors
 * Handles Mobile Menu, Age Navigation, Smart Quiz, FAQ Accordions, and Amazon Stage Lists
 */

// ============================================================================
// AMAZON STAGE LISTS CONFIGURATION
// You can paste your Amazon Wishlist or Curated List links here for each age!
// ============================================================================
const AMAZON_STAGE_LISTS = {
  '0-1': 'https://www.amazon.in/hz/wishlist/ls/1FF9EPRZ78034?ref_=wl_share&tag=ristore03b-21', // 0–1 Years Curated List
  '1-3': 'https://www.amazon.in/hz/wishlist/ls/3GCYRC1NQG3LQ?tag=ristore03b-21', // 1–3 Years Curated List
  '3-5': 'https://www.amazon.in/hz/wishlist/ls/UWMK2IXM2B1Y?ref_=wl_share&tag=ristore03b-21', // 3–5 Years Curated List
  '6-8': 'https://www.amazon.in/hz/wishlist/ls/24H5UMEJVK6PM?tag=ristore03b-21', // 6–8 Years Curated List
  '9-12': 'https://www.amazon.in/hz/wishlist/ls/1YQZ54XHB46IW?tag=ristore03b-21', // 9–12 Years Curated List
  '13-15': 'https://www.amazon.in/hz/wishlist/ls/VZOG630V0T52?tag=ristore03b-21', // 13–15 Years Curated List
  '15-plus': 'https://www.amazon.in/hz/wishlist/ls/2ZRVOO4EQVONO?tag=ristore03b-21', // 15+ Years Curated List
  // 15+ Hobbies
  'hobby-baking': 'https://www.amazon.in/hz/wishlist/ls/5TVNI45CYORJ?tag=ristore03b-21',
  'hobby-fishing': 'https://www.amazon.in/hz/wishlist/ls/1AX6AFGVC6533?tag=ristore03b-21',
  'hobby-sports': 'https://www.amazon.in/hz/wishlist/ls/1VBTZZ3UB1ZBX?tag=ristore03b-21',
  'hobby-grooming': 'https://www.amazon.in/hz/wishlist/ls/1Z1Z0PSF447C7?tag=ristore03b-21',
  'hobby-anime': 'https://www.amazon.in/hz/wishlist/ls/3MXSIIBKKWVBC?tag=ristore03b-21',
  'hobby-games': 'https://www.amazon.in/hz/wishlist/ls/36906YTZZFHWB?tag=ristore03b-21',
  'hobby-cycling': 'https://www.amazon.in/hz/wishlist/ls/331YY4EK4TZN9?tag=ristore03b-21',
  'hobby-painting': 'https://www.amazon.in/hz/wishlist/ls/2R9SQV04CKGLU?tag=ristore03b-21',
  'hobby-diecast': 'https://www.amazon.in/hz/wishlist/ls/193TA4OGI3VXP?tag=ristore03b-21',
  'hobby-aquarium': 'https://www.amazon.in/hz/wishlist/ls/3V0QP93I3ONK1?tag=ristore03b-21',
  'hobby-crafts': 'https://www.amazon.in/hz/wishlist/ls/2XDEFNIGXXSV4?tag=ristore03b-21',
  'hobby-travel': 'https://www.amazon.in/hz/wishlist/ls/2Z2C4NIMYKUHL?tag=ristore03b-21',
  'hobby-educational': 'https://www.amazon.in/hz/wishlist/ls/1S12BMRX9E2O8?tag=ristore03b-21',
  'hobby-electronics': 'https://www.amazon.in/hz/wishlist/ls/65IHU1PO5CII?tag=ristore03b-21',
  'hobby-robotics': 'https://www.amazon.in/hz/wishlist/ls/EKWXJJ5SAH4U?tag=ristore03b-21',
  'hobby-reading': 'https://www.amazon.in/hz/wishlist/ls/34DMYQ76MNA8Y?tag=ristore03b-21',
  'hobby-rc-drones': 'https://www.amazon.in/hz/wishlist/ls/1IRP112WAJ3AK?tag=ristore03b-21'
};

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initFaqAccordion();
  initSmartQuiz();
  initContactForm();
  initSmoothScrollSpy();
  initAmazonStageLinks();
});

/* --------------------------------------------------------------------------
   1. Mobile Menu Navigation
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const drawer = document.querySelector('.mobile-nav-drawer');
  if (!menuBtn || !drawer) return;

  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : !drawer.classList.contains('open');
    drawer.classList.toggle('open', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  menuBtn.addEventListener('click', () => toggleMenu());

  // Close when clicking outside drawer panel
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) toggleMenu(false);
  });

  // Close when clicking any nav link inside drawer
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggleMenu(false);
    }
  });
}

/* --------------------------------------------------------------------------
   2. FAQ Accordion Interaction
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close other accordions for clean single view
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherBtn = otherItem.querySelector('.faq-question-btn');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('active', !isActive);
      btn.setAttribute('aria-expanded', !isActive ? 'true' : 'false');
    });
  });
}

/* --------------------------------------------------------------------------
   3. Smart Toy Quiz Widget
   -------------------------------------------------------------------------- */
function initSmartQuiz() {
  const quizWrapper = document.querySelector('.quiz-wrapper');
  if (!quizWrapper) return;

  const state = {
    age: '3-5',
    interest: 'stem'
  };

  let currentStep = 1;
  const totalSteps = 2;

  const stepPanes = quizWrapper.querySelectorAll('.quiz-step-pane');
  const stepIndicators = quizWrapper.querySelectorAll('.step-indicator');
  const nextBtn = document.getElementById('quiz-next-btn');
  const backBtn = document.getElementById('quiz-back-btn');
  const resultPane = document.getElementById('quiz-step-result');
  const retakeBtn = document.getElementById('quiz-retake-btn');

  // Option selection logic
  quizWrapper.querySelectorAll('.quiz-opt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const group = btn.closest('.quiz-options-grid');
      const param = group.getAttribute('data-param');
      const val = btn.getAttribute('data-value');

      group.querySelectorAll('.quiz-opt-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state[param] = val;
    });
  });

  const updateUI = () => {
    stepPanes.forEach(pane => pane.classList.remove('active'));
    stepIndicators.forEach((ind, i) => {
      const stepIdx = i + 1;
      ind.classList.remove('active', 'completed');
      if (stepIdx === currentStep) {
        ind.classList.add('active');
      } else if (stepIdx < currentStep) {
        ind.classList.add('completed');
      }
    });

    if (currentStep <= totalSteps) {
      const activePane = quizWrapper.querySelector(`.quiz-step-pane[data-step="${currentStep}"]`);
      if (activePane) activePane.classList.add('active');
      if (backBtn) backBtn.style.visibility = currentStep > 1 ? 'visible' : 'hidden';
      if (nextBtn) {
        nextBtn.textContent = currentStep === totalSteps ? 'See Recommendations →' : 'Next Step →';
      }
    } else {
      // Show result
      if (resultPane) {
        renderQuizResults(state);
        resultPane.classList.add('active');
      }
      if (backBtn) backBtn.style.visibility = 'hidden';
      if (nextBtn) nextBtn.style.display = 'none';
    }
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep <= totalSteps) {
        currentStep++;
        updateUI();
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateUI();
      }
    });
  }

  if (retakeBtn) {
    retakeBtn.addEventListener('click', () => {
      currentStep = 1;
      if (nextBtn) nextBtn.style.display = 'inline-flex';
      updateUI();
    });
  }

  function renderQuizResults(quizState) {
    const ageNames = {
      '0-1': 'Infant (0–1 Years) — Sensory Discovery',
      '1-3': 'Toddler (1–3 Years) — Motor Exploration',
      '3-5': 'Early Explorer (3–5 Years) — Imagination & Spatial',
      '6-8': 'Curious Thinker (6–8 Years) — Early STEM & Logic',
      '9-12': 'Young Inventor (9–12 Years) — Robotics & Making',
      '13-15': 'Master Builder (13–15 Years) — Advanced STEM',
      '15+': 'Deep Hobbyist (15+ Years) — Maker & Technical Skills'
    };

    const targetSection = quizState.age === '15+' ? '#hobbies' : `#age-${quizState.age}`;
    const resultTitle = document.getElementById('quiz-result-title');
    const resultDesc = document.getElementById('quiz-result-desc');
    const resultTargetLink = document.getElementById('quiz-result-link');
    const resultItemName = document.getElementById('quiz-suggested-item-name');
    const resultItemReason = document.getElementById('quiz-suggested-item-reason');

    const recommendations = {
      '0-1': {
        name: 'Interactive Baby Activity Play Gym',
        reason: 'Perfect for tummy time, visual tracking, and early sensory stimulation.'
      },
      '1-3': {
        name: 'Geometric Shape Sorting Cube & Stacking Rings',
        reason: 'Develops bilateral hand coordination, fine motor pinch, and spatial trial-and-error.'
      },
      '3-5': {
        name: 'Translucent Magnetic Building Tile Set',
        reason: 'Encourages open-ended 3D spatial thinking, geometry intuition, and collaborative play.'
      },
      '6-8': {
        name: 'Snap-Circuit Modular Electronics Discovery Lab',
        reason: 'Safely teaches closed-loop circuit physics and deductive troubleshooting.'
      },
      '9-12': {
        name: 'Arduino-Compatible Autonomous Smart Rover Kit',
        reason: 'Bridges block-coding and real-world electromechanical sensors and robotics.'
      },
      '13-15': {
        name: 'Precision Modular Analog Synthesizer Kit',
        reason: 'Combines acoustic waveform physics with hands-on circuit assembly.'
      },
      '15+': {
        name: 'Open-Source 3D Printer & Robotics Maker Track',
        reason: 'Master CAD design, additive manufacturing, and physical prototype engineering.'
      }
    };

    const picked = recommendations[quizState.age] || recommendations['3-5'];

    if (resultTitle) resultTitle.textContent = ageNames[quizState.age] || 'Curated Recommendations';
    if (resultDesc) {
      resultDesc.textContent = `Based on your interest in ${quizState.interest.toUpperCase()}, we've identified the highest-value evidence-backed recommendations for this developmental window.`;
    }
    if (resultItemName) resultItemName.textContent = picked.name;
    if (resultItemReason) resultItemReason.textContent = picked.reason;
    if (resultTargetLink) {
      resultTargetLink.setAttribute('href', targetSection);
      resultTargetLink.textContent = `Explore All ${quizState.age === '15+' ? 'Hobbies' : quizState.age + ' Years'} Guides →`;
    }
  }

  // Initialize view
  updateUI();
}

/* --------------------------------------------------------------------------
   4. Contact Form Submission
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusMsg = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Basic validation check
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name || !email || !message) {
      alert('Please fill out all required fields before sending.');
      return;
    }

    // Friendly confirmation
    if (statusMsg) {
      statusMsg.className = 'form-status-msg success';
      statusMsg.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <div>
          <strong>Thank you, ${name}!</strong> Your message has been received. Our pediatric curation team will respond to <em>${email}</em> within 1-2 business days.
        </div>
      `;
      statusMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    form.reset();
  });
}

/* --------------------------------------------------------------------------
   5. Active Navigation & Smooth Scroll Highlighting
   -------------------------------------------------------------------------- */
function initSmoothScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!navLinks.length) return;

  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   6. Amazon Curated Stage Lists Handler & Friendly Toast
   -------------------------------------------------------------------------- */
function initAmazonStageLinks() {
  const amazonButtons = document.querySelectorAll('.amazon-stage-link, .btn-amazon-stage-card, .btn-hobby-explore');
  if (!amazonButtons.length) return;

  amazonButtons.forEach(btn => {
    const stage = btn.getAttribute('data-stage') || btn.getAttribute('data-amazon-stage');
    
    // If a link is configured in AMAZON_STAGE_LISTS, dynamically set href
    if (stage && AMAZON_STAGE_LISTS[stage] && AMAZON_STAGE_LISTS[stage].trim() !== '') {
      btn.href = AMAZON_STAGE_LISTS[stage];
      btn.target = '_blank';
      btn.rel = 'noopener sponsored';
    }

    btn.addEventListener('click', (e) => {
      const currentHref = btn.getAttribute('href');
      // If still placeholder or empty
      if (!currentHref || currentHref.startsWith('#') || currentHref.includes('placeholder')) {
        e.preventDefault();
        const stageName = getStageDisplayName(stage);
        showHobbyToast(`🧭 Explore Items (${stageName}): Add your link to AMAZON_STAGE_LISTS in script.js!`);
      }
    });
  });
}

function getStageDisplayName(stage) {
  const names = {
    '0-1': '0–1 Years',
    '1-3': '1–3 Years',
    '3-5': '3–5 Years',
    '6-8': '6–8 Years',
    '9-12': '9–12 Years',
    '13-15': '13–15 Years',
    '15-plus': '15+ Years',
    'hobby-baking': 'Baking',
    'hobby-fishing': 'Fishing',
    'hobby-sports': 'Sports',
    'hobby-grooming': 'Grooming',
    'hobby-anime': 'Anime',
    'hobby-games': 'Games',
    'hobby-cycling': 'Cycling',
    'hobby-painting': 'Painting',
    'hobby-diecast': 'Diecast Cars',
    'hobby-aquarium': 'Aquarium',
    'hobby-crafts': 'Art & Crafts',
    'hobby-travel': 'Travelling',
    'hobby-educational': 'Educational Hobbies',
    'hobby-electronics': 'Electronics',
    'hobby-robotics': 'Robotics',
    'hobby-reading': 'Reading',
    'hobby-rc-drones': 'RC & Drones'
  };
  return names[stage] || 'Selected Hobby';
}

let toastTimeout = null;
function showHobbyToast(message) {
  let toast = document.querySelector('.hobby-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'hobby-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span class="hobby-toast-icon">✨</span><span>${message}</span>`;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4200);
}

