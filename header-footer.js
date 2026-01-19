(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var burger = header.querySelector('.dr-header-burger');
  var nav = header.querySelector('.dr-nav');
  if (!burger || !nav) return;

  burger.addEventListener('click', function () {
    var isOpen = burger.classList.contains('dr-is-open');
    if (isOpen) {
      burger.classList.remove('dr-is-open');
      nav.classList.remove('dr-is-open');
      burger.setAttribute('aria-expanded', 'false');
    } else {
      burger.classList.add('dr-is-open');
      nav.classList.add('dr-is-open');
      burger.setAttribute('aria-expanded', 'true');
    }
  });
})();
