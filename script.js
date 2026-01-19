(function() {
  'use strict';

  if (!window.__app) {
    window.__app = {};
  }

  var _app = window.__app;

  if (_app.initialized) {
    return;
  }

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var args = arguments;
      var context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (_app.burgerInit) return;
    _app.burgerInit = true;

    var toggle = document.querySelector('.navbar-toggler, .c-nav__toggle');
    var navCollapse = document.querySelector('.navbar-collapse, #mainNav');

    if (!toggle || !navCollapse) return;

    var isOpen = false;

    function openMenu() {
      isOpen = true;
      navCollapse.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
    }

    function closeMenu() {
      isOpen = false;
      navCollapse.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    }

    function toggleMenu() {
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleMenu();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', function(e) {
      if (isOpen && !navCollapse.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    var navLinks = document.querySelectorAll('.nav-link, .c-nav__link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        closeMenu();
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && isOpen) {
        closeMenu();
      }
    }, 200);

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function initSmoothScroll() {
    if (_app.smoothScrollInit) return;
    _app.smoothScrollInit = true;

    function getHeaderHeight() {
      var header = document.querySelector('.l-header, .navbar');
      return header ? header.offsetHeight : 80;
    }

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      var href = target.getAttribute('href');
      if (!href || !href.startsWith('#') || href === '#' || href === '#!') return;

      var targetId = href.substring(1);
      var targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        var offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - getHeaderHeight();
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  }

  function initScrollSpy() {
    if (_app.scrollSpyInit) return;
    _app.scrollSpyInit = true;

    var navLinks = document.querySelectorAll('.nav-link[href^="#"], .c-nav__link[href^="#"]');
    if (navLinks.length === 0) return;

    var sections = [];
    for (var i = 0; i < navLinks.length; i++) {
      var href = navLinks[i].getAttribute('href');
      if (href && href.length > 1) {
        var section = document.querySelector(href);
        if (section) {
          sections.push({
            id: href,
            element: section,
            link: navLinks[i]
          });
        }
      }
    }

    function updateActiveLink() {
      var scrollPos = window.pageYOffset + 100;
      var currentSection = null;

      for (var i = 0; i < sections.length; i++) {
        var sectionTop = sections[i].element.offsetTop;
        var sectionBottom = sectionTop + sections[i].element.offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          currentSection = sections[i];
          break;
        }
      }

      for (var j = 0; j < sections.length; j++) {
        sections[j].link.classList.remove('active');
        sections[j].link.removeAttribute('aria-current');
      }

      if (currentSection) {
        currentSection.link.classList.add('active');
        currentSection.link.setAttribute('aria-current', 'page');
      }
    }

    var scrollHandler = throttle(updateActiveLink, 100);
    window.addEventListener('scroll', scrollHandler, { passive: true });
    updateActiveLink();
  }

  function initActiveMenu() {
    if (_app.activeMenuInit) return;
    _app.activeMenuInit = true;

    var navLinks = document.querySelectorAll('.nav-link:not([href^="#"]), .c-nav__link:not([href^="#"])');
    var currentPath = location.pathname;

    if (currentPath === '' || currentPath === '/') {
      currentPath = '/index.html';
    }

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkHref = link.getAttribute('href');

      link.classList.remove('active');
      link.removeAttribute('aria-current');

      if (linkHref) {
        var linkPath = linkHref.split('#')[0];
        if (linkPath === currentPath || (currentPath === '/index.html' && (linkPath === '/' || linkPath === '/index.html'))) {
          link.setAttribute('aria-current', 'page');
          link.classList.add('active');
        }
      }
    }
  }

  function initForms() {
    if (_app.formsInit) return;
    _app.formsInit = true;

    var forms = document.querySelectorAll('#contactForm, .c-form');

    function validateName(value) {
      var regex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
      return regex.test(value);
    }

    function validateEmail(value) {
      var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(value);
    }

    function validatePhone(value) {
      var regex = /^[\+\d\s\-\(\)]{10,20}$/;
      return regex.test(value);
    }

    function validateMessage(value) {
      return value && value.length >= 10;
    }

    function showError(field, message) {
      var parent = field.closest('.c-form__group, .form-group, .mb-3, .mb-4');
      if (parent) {
        parent.classList.add('has-error');
        var errorDiv = parent.querySelector('.c-form__error, .invalid-feedback');
        if (errorDiv) {
          errorDiv.textContent = message;
          errorDiv.classList.add('d-block');
        }
      }
      field.setAttribute('aria-invalid', 'true');
    }

    function clearError(field) {
      var parent = field.closest('.c-form__group, .form-group, .mb-3, .mb-4');
      if (parent) {
        parent.classList.remove('has-error');
        var errorDiv = parent.querySelector('.c-form__error, .invalid-feedback');
        if (errorDiv) {
          errorDiv.textContent = '';
          errorDiv.classList.remove('d-block');
        }
      }
      field.removeAttribute('aria-invalid');
    }

    _app.notify = function(message, type) {
      type = type || 'info';
      var container = document.getElementById('toast-container');

      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }

      var toast = document.createElement('div');
      toast.className = 'alert alert-' + type + ' alert-dismissible fade show';
      toast.setAttribute('role', 'alert');
      toast.innerHTML = message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';

      container.appendChild(toast);

      var closeBtn = toast.querySelector('.btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          toast.classList.remove('show');
          setTimeout(function() {
            if (toast.parentNode) {
              toast.parentNode.removeChild(toast);
            }
          }, 150);
        });
      }

      setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 150);
      }, 5000);
    };

    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var form = e.target;
        var isValid = true;

        var firstName = form.querySelector('#firstName');
        var lastName = form.querySelector('#lastName');
        var email = form.querySelector('#email');
        var phone = form.querySelector('#phone');
        var message = form.querySelector('#message');
        var privacy = form.querySelector('#privacy');

        if (firstName) {
          clearError(firstName);
          if (!firstName.value.trim()) {
            showError(firstName, 'Bitte geben Sie Ihren Vornamen ein.');
            isValid = false;
          } else if (!validateName(firstName.value.trim())) {
            showError(firstName, 'Bitte geben Sie einen gültigen Vornamen ein.');
            isValid = false;
          }
        }

        if (lastName) {
          clearError(lastName);
          if (!lastName.value.trim()) {
            showError(lastName, 'Bitte geben Sie Ihren Nachnamen ein.');
            isValid = false;
          } else if (!validateName(lastName.value.trim())) {
            showError(lastName, 'Bitte geben Sie einen gültigen Nachnamen ein.');
            isValid = false;
          }
        }

        if (email) {
          clearError(email);
          if (!email.value.trim()) {
            showError(email, 'Bitte geben Sie Ihre E-Mail-Adresse ein.');
            isValid = false;
          } else if (!validateEmail(email.value.trim())) {
            showError(email, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
            isValid = false;
          }
        }

        if (phone) {
          clearError(phone);
          if (!phone.value.trim()) {
            showError(phone, 'Bitte geben Sie Ihre Telefonnummer ein.');
            isValid = false;
          } else if (!validatePhone(phone.value.trim())) {
            showError(phone, 'Bitte geben Sie eine gültige Telefonnummer ein.');
            isValid = false;
          }
        }

        if (message) {
          clearError(message);
          if (!message.value.trim()) {
            showError(message, 'Bitte geben Sie eine Nachricht ein.');
            isValid = false;
          } else if (!validateMessage(message.value.trim())) {
            showError(message, 'Die Nachricht muss mindestens 10 Zeichen lang sein.');
            isValid = false;
          }
        }

        if (privacy) {
          clearError(privacy);
          if (!privacy.checked) {
            showError(privacy, 'Bitte akzeptieren Sie die Datenschutzerklärung.');
            isValid = false;
          }
        }

        if (!isValid) {
          return;
        }

        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          var originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';

          setTimeout(function() {
            _app.notify('Ihre Nachricht wurde erfolgreich gesendet!', 'success');
            form.reset();
            
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
            }

            setTimeout(function() {
              window.location.href = 'thank_you.html';
            }, 1500);
          }, 1000);
        }
      });
    }
  }

  function initScrollToTop() {
    if (_app.scrollToTopInit) return;
    _app.scrollToTopInit = true;

    var scrollTopBtn = document.querySelector('.scroll-to-top, [data-scroll-top]');
    if (!scrollTopBtn) return;

    function toggleScrollTopBtn() {
      if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('is-visible');
      } else {
        scrollTopBtn.classList.remove('is-visible');
      }
    }

    var scrollHandler = throttle(toggleScrollTopBtn, 200);
    window.addEventListener('scroll', scrollHandler, { passive: true });

    scrollTopBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    toggleScrollTopBtn();
  }

  function initModals() {
    if (_app.modalsInit) return;
    _app.modalsInit = true;

    var modalTriggers = document.querySelectorAll('[data-modal]');
    
    for (var i = 0; i < modalTriggers.length; i++) {
      modalTriggers[i].addEventListener('click', function(e) {
        e.preventDefault();
        var modalId = this.getAttribute('data-modal');
        var modal = document.getElementById(modalId);
        
        if (modal) {
          modal.classList.add('is-open');
          document.body.classList.add('u-no-scroll');
          
          var overlay = document.createElement('div');
          overlay.className = 'modal-overlay';
          overlay.setAttribute('data-modal-overlay', modalId);
          document.body.appendChild(overlay);

          overlay.addEventListener('click', function() {
            modal.classList.remove('is-open');
            document.body.classList.remove('u-no-scroll');
            document.body.removeChild(overlay);
          });

          var closeBtn = modal.querySelector('[data-modal-close]');
          if (closeBtn) {
            closeBtn.addEventListener('click', function() {
              modal.classList.remove('is-open');
              document.body.classList.remove('u-no-scroll');
              var overlayToRemove = document.querySelector('[data-modal-overlay="' + modalId + '"]');
              if (overlayToRemove) {
                document.body.removeChild(overlayToRemove);
              }
            });
          }
        }
      });
    }
  }

  function initCountUp() {
    if (_app.countUpInit) return;
    _app.countUpInit = true;

    var counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    function animateCount(element) {
      if (element.getAttribute('data-counted') === 'true') return;

      var target = parseInt(element.getAttribute('data-count'), 10);
      var duration = parseInt(element.getAttribute('data-duration') || '2000', 10);
      var start = 0;
      var increment = target / (duration / 16);
      var current = start;

      var timer = setInterval(function() {
        current += increment;
        if (current >= target) {
          element.textContent = target;
          clearInterval(timer);
          element.setAttribute('data-counted', 'true');
        } else {
          element.textContent = Math.floor(current);
        }
      }, 16);
    }

    var observer = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          animateCount(entries[i].target);
        }
      }
    }, { threshold: 0.5 });

    for (var i = 0; i < counters.length; i++) {
      observer.observe(counters[i]);
    }
  }

  function initImages() {
    if (_app.imagesInit) return;
    _app.imagesInit = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.hasAttribute('loading') && !img.classList.contains('c-logo__img')) {
        img.setAttribute('loading', 'lazy');
      }

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      img.addEventListener('error', function(e) {
        var target = e.target;
        var svgPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e9ecef"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%236c757d"%3EBild nicht verfügbar%3C/text%3E%3C/svg%3E';
        target.src = svgPlaceholder;
      });
    }

    var videos = document.querySelectorAll('video');
    for (var j = 0; j < videos.length; j++) {
      if (!videos[j].hasAttribute('loading')) {
        videos[j].setAttribute('loading', 'lazy');
      }
    }
  }

  _app.init = function() {
    if (_app.initialized) return;
    _app.initialized = true;

    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenu();
    initForms();
    initScrollToTop();
    initModals();
    initCountUp();
    initImages();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _app.init);
  } else {
    _app.init();
  }

})();
