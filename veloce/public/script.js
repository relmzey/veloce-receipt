const receiptForm = document.getElementById('receiptForm');
const serviceSelect = document.getElementById('service');
const identityLabel = document.getElementById('identityLabel');
const usernameInput = document.getElementById('username');
const downloadBtn = document.getElementById('downloadBtn');
const receiptCard = document.getElementById('receiptCard');

const rOrderId = document.getElementById('rOrderId');
const rService = document.getElementById('rService');
const rIdentityLabel = document.getElementById('rIdentityLabel');
const rUsername = document.getElementById('rUsername');
const rQtyReq = document.getElementById('rQtyReq');
const rQtyRec = document.getElementById('rQtyRec');
const rCharge = document.getElementById('rCharge');
const rDateTime = document.getElementById('rDateTime');

let hasGenerated = false;

function usesLink(service) {
  return service === 'Instagram Likes' || service === 'Instagram Reel Views';
}

function syncIdentityLabel() {
  const service = serviceSelect.value;
  const label = usesLink(service) ? 'Link' : 'Username';
  const placeholder = usesLink(service) ? 'https://instagram.com/reel/...' : '@username';

  identityLabel.textContent = label;
  rIdentityLabel.textContent = label;
  usernameInput.placeholder = placeholder;
}

async function captureReceiptCard() {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const cloneHost = document.createElement('div');
  cloneHost.style.position = 'fixed';
  cloneHost.style.left = '-99999px';
  cloneHost.style.top = '0';
  cloneHost.style.width = '800px';
  cloneHost.style.height = '1000px';
  cloneHost.style.pointerEvents = 'none';

  const receiptClone = receiptCard.cloneNode(true);
  receiptClone.style.width = '800px';
  receiptClone.style.minHeight = '1000px';
  receiptClone.style.height = '1000px';
  receiptClone.style.padding = '50px 56px';

  cloneHost.appendChild(receiptClone);
  document.body.appendChild(cloneHost);

  try {
    const sourceCanvas = await html2canvas(receiptClone, {
      backgroundColor: '#ffffff',
      scale: 2,
      width: 800,
      height: 1000,
      windowWidth: 1400,
      windowHeight: 1200,
      useCORS: true
    });

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = 800;
    outputCanvas.height = 1000;

    const context = outputCanvas.getContext('2d');
    context.drawImage(sourceCanvas, 0, 0, 1600, 2000, 0, 0, 800, 1000);

    return outputCanvas;
  } finally {
    cloneHost.remove();
  }
}

serviceSelect.addEventListener('change', syncIdentityLabel);
syncIdentityLabel();

receiptForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const service = serviceSelect.value;
  const identityValue = usernameInput.value.trim();
  const quantityRequested = document.getElementById('quantityRequested').value;
  const quantityReceived = document.getElementById('quantityReceived').value;
  const chargeValue = Number(document.getElementById('charge').value || 0);

  try {
    const response = await fetch('/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      hasGenerated = false;
      downloadBtn.disabled = true;
      return;
    }

    const data = await response.json();

    rOrderId.textContent = data.orderId;
    rService.textContent = service;
    rIdentityLabel.textContent = usesLink(service) ? 'Link' : 'Username';
    rUsername.textContent = identityValue || 'Free';
    rQtyReq.textContent = quantityRequested;
    rQtyRec.textContent = quantityReceived;
    rCharge.textContent = chargeValue === 0 ? 'FREE' : `₹${chargeValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

    const generatedDate = new Date(data.date);
    rDateTime.textContent = generatedDate.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    hasGenerated = true;
    downloadBtn.disabled = false;
  } catch (error) {
    hasGenerated = false;
    downloadBtn.disabled = true;
  }
});

downloadBtn.addEventListener('click', async () => {
  if (!hasGenerated) {
    return;
  }

  const outputCanvas = await captureReceiptCard();

  const link = document.createElement('a');
  link.download = `veloce-receipt-${rOrderId.textContent}.jpg`;
  link.href = outputCanvas.toDataURL('image/jpeg', 0.95);
  link.click();
});
