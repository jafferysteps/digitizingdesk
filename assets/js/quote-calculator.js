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
      chest: { price: 8, name: 'Left Chest Digitizing', time: '12 hours' },
      cap: { price: 8, name: 'Cap / Hat Digitizing', time: '12 hours' },
      puff: { price: 8, name: '3D Puff Digitizing', time: '12 hours' },
      applique: { price: 10, name: 'Applique Digitizing', time: '12 hours' },
      jacket: { price: 28, name: 'Jacket Back Digitizing', time: '12-24 hours' }
    },
    vector: {
      simple: { price: 8, name: 'Simple Vector', time: '4-8 hours' },
      complex: { price: 18, name: 'Complex Vector', time: '8-12 hours' },
      sponsor: { price: 50, name: 'Sponsor Vector Board', time: '12 hours' },
      cleanup: { price: 5, name: 'Vector Cleanup & Node Fixing', time: '4 hours' }
    },
    separations: {
      spot: { price: 10, name: 'Spot Color (1-3 screens)', time: '12 hours' },
      spot6: { price: 18, name: 'Spot Color (4-6 screens)', time: '12 hours' },
      cmyk: { price: 25, name: 'CMYK 4-Color Process', time: '12 hours' },
      sim: { price: 35, name: 'Simulated Process', time: '12 hours' }
    },
    patch: {
      standard: { price: 15, name: 'Standard Patch Art & Specs', time: '24 hours' },
      detailed: { price: 25, name: 'Detailed Patch Art (4+ col)', time: '24 hours' },
      digitized: { price: 8, name: 'Embroidered Patch Stitch File', time: '12-24 hours' },
      pvc: { price: 25, name: 'PVC / Rubber Mold Art', time: '24 hours' }
    },
    dtf: {
      sheet24: { price: 8, name: '22" x 24" Gang Sheet', time: '6-12 hours' },
      sheet60: { price: 12, name: '22" x 60" Gang Sheet', time: '6-12 hours' },
      sheet120: { price: 20, name: '22" x 120" Gang Sheet', time: '6-12 hours' },
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
        <span><strong>${file.name}</strong> (${sizeStr})</span>
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
