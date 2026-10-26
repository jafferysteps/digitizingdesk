/* DigitizingDesk Before/After Comparison Slider
   Engineered for seamless responsive touch, pointer, and click interaction.
*/

function initBeforeAfterSliders() {
  const containers = document.querySelectorAll('.before-after-container');

  containers.forEach(container => {
    const afterWrapper = container.querySelector('.ba-after-wrapper');
    const handle = container.querySelector('.ba-slider-handle');
    if (!afterWrapper || !handle) return;

    // Set exact container width variable so the inside image clips without distortion
    function syncWidth() {
      const containerWidth = container.clientWidth;
      container.style.setProperty('--ba-width', `${containerWidth}px`);
    }

    syncWidth();

    let isDragging = false;

    function updateSlider(clientX) {
      const rect = container.getBoundingClientRect();
      let offsetX = clientX - rect.left;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;

      const percentage = (offsetX / rect.width) * 100;
      afterWrapper.style.width = `${percentage}%`;
      handle.style.left = `${percentage}%`;
    }

    // Modern Pointer Events (Works identically for Mouse, Touch & Pen with no lag)
    handle.addEventListener('pointerdown', (e) => {
      isDragging = true;
      handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    handle.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    });

    handle.addEventListener('pointerup', (e) => {
      isDragging = false;
      try {
        handle.releasePointerCapture(e.pointerId);
      } catch (err) {}
    });

    handle.addEventListener('pointercancel', () => {
      isDragging = false;
    });

    // Tap/Click anywhere on the container to move divider immediately
    container.addEventListener('pointerdown', (e) => {
      if (e.target !== handle && !handle.contains(e.target)) {
        updateSlider(e.clientX);
      }
    });

    // Resize observer or window resize listener to keep image widths synchronized
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => syncWidth());
      ro.observe(container);
    }
  });

  window.addEventListener('resize', () => {
    containers.forEach(c => {
      c.style.setProperty('--ba-width', `${c.clientWidth}px`);
    });
  });
}

document.addEventListener('DOMContentLoaded', initBeforeAfterSliders);
