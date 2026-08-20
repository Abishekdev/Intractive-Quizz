const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', (event) => event.preventDefault());
});

if (!reduceMotion) {
  document.querySelectorAll('.panel').forEach((panel) => {
    panel.addEventListener('pointermove', (event) => {
      const bounds = panel.getBoundingClientRect();
      const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -3;
      const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 3;
      panel.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
      panel.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
      panel.classList.add('is-tilting');
    });
    panel.addEventListener('pointerleave', () => panel.classList.remove('is-tilting'));
  });

  document.querySelectorAll('.button, .text-button, .host-link').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const bounds = button.getBoundingClientRect();
      button.style.setProperty('--cursor-x', `${event.clientX - bounds.left}px`);
      button.style.setProperty('--cursor-y', `${event.clientY - bounds.top}px`);
    });
    button.addEventListener('click', () => {
      button.classList.remove('is-clicked');
      requestAnimationFrame(() => button.classList.add('is-clicked'));
    });
  });

  document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (event) => {
      const ripple = document.createElement('span');
      ripple.className = 'click-ripple';
      const bounds = button.getBoundingClientRect();
      ripple.style.left = `${event.clientX - bounds.left}px`;
      ripple.style.top = `${event.clientY - bounds.top}px`;
      button.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  document.querySelectorAll('.question-list-row, .leader-row, .admin-choice, .option').forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min(index * 35, 420)}ms`);
    item.classList.add('reveal-item');
  });
}
