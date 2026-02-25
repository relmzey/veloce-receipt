const receiptForm = document.getElementById('receiptForm');
const downloadBtn = document.getElementById('downloadBtn');
const receiptCard = document.getElementById('receiptCard');

const rOrderId = document.getElementById('rOrderId');
const rService = document.getElementById('rService');
const rUsername = document.getElementById('rUsername');
const rQtyReq = document.getElementById('rQtyReq');
const rQtyRec = document.getElementById('rQtyRec');
const rCharge = document.getElementById('rCharge');
const rDateTime = document.getElementById('rDateTime');

let hasGenerated = false;

receiptForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const service = document.getElementById('service').value;
  const usernameInput = document.getElementById('username').value.trim();
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
      return;
    }

    const data = await response.json();

    rOrderId.textContent = data.orderId;
    rService.textContent = service;
    rUsername.textContent = usernameInput || 'Free';
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

  const canvas = await html2canvas(receiptCard, {
    scale: 1,
    width: 800,
    height: 1000,
    backgroundColor: '#ffffff'
  });

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = 800;
  outputCanvas.height = 1000;
  const ctx = outputCanvas.getContext('2d');
  ctx.drawImage(canvas, 0, 0, 800, 1000);

  const link = document.createElement('a');
  link.download = `veloce-receipt-${rOrderId.textContent}.jpg`;
  link.href = outputCanvas.toDataURL('image/jpeg', 0.95);
  link.click();
});
