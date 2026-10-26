/* DigitizingDesk Quote Calculator & Form Handler
   Rates strictly calibrated to Brand Book Section 7.
*/

document.addEventListener('DOMContentLoaded', () => {
  // 1. Interactive Estimator Widget (on Home & Pricing)
  const estimatorServicePills = document.querySelectorAll('.service-pill');
  const estimatorTypePills = document.querySelectorAll('.type-pill');
  const rushToggle = document.getElementById('calcRush');
  const priceDisplay = document.getElementById('calcPrice');
  const turnaroundDisplay = document.getElementById('calcTurnaround');

  let currentService = 'embroidery';
  let currentTier = 'chest';

  const rateMatrix = {
    embroidery: {
      chest: { price: 15, name: 'Left Chest (<8k st)', time: '12 hours' },
      cap: { price: 18, name: 'Cap Front (<8k st)', time: '12 hours' },
      medium: { price: 25, name: 'Medium (8k-15k st)', time: '12 hours' },
      jacket: { price: 40, name: 'Jacket Back (15k-30k)', time: '12-24 hours' }
    },
    vector: {
      simple: { price: 8, name: 'Simple (1-3 flat col)', time: '4-8 hours' },
      standard: { price: 15, name: 'Standard Multi-color', time: '8-12 hours' },
      complex: { price: 28, name: 'Complex Illustration', time: '12 hours' },
      cleanup: { price: 6, name: 'Vector Cleanup', time: '4 hours' }
    },
    separations: {
      spot2: { price: 20, name: 'Spot Color (2 screens)', time: '12 hours' },
      spot4: { price: 40, name: 'Spot Color (4 screens)', time: '12 hours' },
      cmyk: { price: 35, name: 'CMYK 4-Process Flat', time: '12 hours' },
      sim: { price: 45, name: 'Simulated Process', time: '12 hours' }
    },
    patch: {
      art3: { price: 20, name: 'Patch Art (1-3 colors)', time: '24 hours' },
      art4: { price: 35, name: 'Patch Art (Detailed)', time: '24 hours' },
      digitized: { price: 25, name: 'Stitch File + Border', time: '24 hours' },
      pvc: { price: 35, name: 'PVC / Rubber Mold Art', time: '24 hours' }
    },
    dtf: {
      sheet60: { price: 10, name: '22" x 60" Gang Sheet', time: '6-12 hours' },
      sheet120: { price: 18, name: '22" x 120" Gang Sheet', time: '6-12 hours' },
      sheet240: { price: 30, name: '22" x 240" Gang Sheet', time: '12 hours' }
    }
  };

  function updateEstimator() {
    if (!priceDisplay) return;
    const serviceData = rateMatrix[currentService];
    if (!serviceData) return;
    const item = serviceData[currentTier] || Object.values(serviceData)[0];

    let finalPrice = item.price;
    let finalTime = item.time;

    if (rushToggle && rushToggle.checked) {
      finalPrice = Math.round(finalPrice * 1.5);
      finalTime = '2 to 4 hours (RUSH)';
    }

    priceDisplay.textContent = `$${finalPrice}`;
    if (turnaroundDisplay) {
      turnaroundDisplay.textContent = finalTime;
    }
  }

  if (estimatorServicePills.length) {
    estimatorServicePills.forEach(pill => {
      pill.addEventListener('click', () => {
        estimatorServicePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentService = pill.getAttribute('data-service');

        // Show corresponding sub-tiers
        document.querySelectorAll('.tier-group').forEach(group => {
          if (group.getAttribute('data-for-service') === currentService) {
            group.style.display = 'grid';
            const firstPill = group.querySelector('.type-pill');
            if (firstPill) {
              group.querySelectorAll('.type-pill').forEach(tp => tp.classList.remove('active'));
              firstPill.classList.add('active');
              currentTier = firstPill.getAttribute('data-tier');
            }
          } else {
            group.style.display = 'none';
          }
        });

        updateEstimator();
      });
    });
  }

  if (estimatorTypePills.length) {
    estimatorTypePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const parent = pill.closest('.tier-group');
        if (parent) {
          parent.querySelectorAll('.type-pill').forEach(tp => tp.classList.remove('active'));
        }
        pill.classList.add('active');
        currentTier = pill.getAttribute('data-tier');
        updateEstimator();
      });
    });
  }

  if (rushToggle) {
    rushToggle.addEventListener('change', updateEstimator);
  }

  // 2. Drag & Drop File Upload Handler
  const dropzone = document.getElementById('fileDropzone');
  const fileInput = document.getElementById('fileUploadInput');
  const fileList = document.getElementById('fileUploadList');
  let selectedFiles = [];

  function renderFileList() {
    if (!fileList) return;
    fileList.innerHTML = '';
    selectedFiles.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'file-item';
      const sizeStr = file.size > 1024 * 1024 
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (file.size / 1024).toFixed(0) + ' KB';

      item.innerHTML = `
        <span>📄 <strong>${file.name}</strong> (${sizeStr})</span>
        <button type="button" class="remove-file-btn" data-index="${index}" style="background:none;border:none;color:#D63C30;cursor:pointer;font-weight:bold;">×</button>
      `;
      fileList.appendChild(item);
    });

    fileList.querySelectorAll('.remove-file-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        selectedFiles.splice(idx, 1);
        renderFileList();
      });
    });
  }

  if (dropzone && fileInput) {
    ['dragenter', 'dragover'].forEach(evt => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(evt => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        Array.from(e.dataTransfer.files).forEach(f => selectedFiles.push(f));
        renderFileList();
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length) {
        Array.from(e.target.files).forEach(f => selectedFiles.push(f));
        renderFileList();
      }
    });
  }

  // 3. Quote Form Submission Simulation
  const quoteForm = document.getElementById('digitizingQuoteForm');
  const formSuccessBox = document.getElementById('quoteFormSuccess');

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = quoteForm.querySelector('[name="name"]')?.value || 'Decorator';
      const shop = quoteForm.querySelector('[name="shop_name"]')?.value || 'Shop';
      const email = quoteForm.querySelector('[name="email"]')?.value || 'your email';

      const submitBtn = quoteForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
          Submitting artwork to the desk...
        `;
      }

      setTimeout(() => {
        if (quoteForm && formSuccessBox) {
          quoteForm.style.display = 'none';
          formSuccessBox.style.display = 'block';
          formSuccessBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (window.showToast) {
          window.showToast(`Artwork received for ${shop}! Quote arriving in 30 minutes.`, 'success');
        }
      }, 900);
    });
  }
});
