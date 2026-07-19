document.addEventListener('DOMContentLoaded', () => {
  // Hamburger Menu
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      menuToggle.classList.toggle('open');
    });
  }

  // Active Link State
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('.main-nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Cleanup href for comparison
    const cleanHref = href.replace('../', '').replace('./', '');
    const isHome = cleanHref === 'index.html' || cleanHref === '';
    
    if (isHome) {
      if (path.endsWith('/') || path.endsWith('index.html')) {
        link.classList.add('active');
      }
    } else {
      const folder = cleanHref.split('/')[0];
      if (folder && path.includes(`/${folder}`)) {
        link.classList.add('active');
      }
    }
  });

  // Application Forms
  const applyForms = document.querySelectorAll('form[data-form="apply"]');
  applyForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      
      // Honeypot check
      if (formData.get('website')) return;
      
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        course: formData.get('course')
      };
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Отправка...';
      submitBtn.disabled = true;
      
      try {
        const response = await fetch('/api/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          form.innerHTML = '<div class="success-message">Спасибо! Я свяжусь с вами в ближайшее время.</div>';
        } else {
          showFormError(form, 'Произошла ошибка при отправке. Пожалуйста, попробуйте позже.');
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      } catch (err) {
        showFormError(form, 'Ошибка сети. Проверьте подключение и повторите попытку.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  });

  function showFormError(form, message) {
    let errorEl = form.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      form.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  // Lightbox
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <button class="lightbox-close" aria-label="Закрыть">&times;</button>
      <div class="lightbox-img-container"></div>
    </div>
  `;
  document.body.appendChild(lightbox);
  
  const lightboxImgContainer = lightbox.querySelector('.lightbox-img-container');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  const closeLightbox = () => {
    lightbox.classList.remove('open');
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightboxImgContainer) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  document.querySelectorAll('.diploma-item, .gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const svg = item.querySelector('svg');
      if (svg) {
        lightboxImgContainer.innerHTML = '';
        const clone = svg.cloneNode(true);
        // Remove fixed width/height for responsive display in lightbox
        clone.removeAttribute('width');
        clone.removeAttribute('height');
        clone.style.width = '100%';
        clone.style.height = 'auto';
        lightboxImgContainer.appendChild(clone);
        lightbox.classList.add('open');
      }
    });
  });
});
