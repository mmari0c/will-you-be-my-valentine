// Elements

const envelope = document.querySelector('#envelope');
const envelopeContainer = document.querySelector('#envelope-container');
const letter = document.querySelector('#letter-container');
const noBtn = document.querySelector('.no-btn');
const yesBtn = document.querySelector('.yes-btn');

const title = document.querySelector('#letter-title');
const catImg = document.querySelector('#letter-cat');
const buttons = document.querySelector('#letter-buttons');
const scratchCard = document.querySelector('#scratch-card');
const scratchCanvas = document.querySelector('#scratch-canvas');
const calendarLink = document.querySelector('#calendar-link');

let scratchCtx;
let isScratching = false;
let scratchReady = false;
let revealDone = false;
let lastCheck = 0;

// Click Envelope

envelope?.addEventListener('click', () => {
   envelopeContainer.style.display = 'none';
   letter.style.display = 'flex';

   setTimeout(() => {
      document.querySelector(".letter-window").classList.add('open');
   }, 50);
});

// Logic to move NO btn

noBtn?.addEventListener('mouseover', () => {
   const min = 200;
   const max = 200;

   const distance = Math.random() * (max - min) + min;
   const angle = Math.random() * 2 * Math.PI;

   const x = distance * Math.cos(angle);
   const y = distance * Math.sin(angle);

   noBtn.style.transition = 'transform 0.3s ease';
   noBtn.style.transform = `translate(${x}px, ${y}px)`;
});

// Yes is clicked

yesBtn?.addEventListener('click', () => {
   title.textContent = 'I knew you would say yes!';
   catImg.src = "cat_dance.gif";
   
   document.querySelector(".letter-window").classList.add('final');

   buttons.style.display = 'none';
   scratchCard.style.display = 'block';
   setupScratchCard();
   setupCalendarLink();
});

function setupScratchCard() {
   if (!scratchCanvas || scratchReady) {
      return;
   }

   const dpr = window.devicePixelRatio || 1;
   const rect = scratchCanvas.getBoundingClientRect();
   scratchCanvas.width = Math.floor(rect.width * dpr);
   scratchCanvas.height = Math.floor(rect.height * dpr);

   scratchCtx = scratchCanvas.getContext('2d');
   scratchCtx.scale(dpr, dpr);
   paintScratchLayer(rect.width, rect.height);

   scratchCanvas.addEventListener('pointerdown', handleScratchStart);
   scratchCanvas.addEventListener('pointermove', handleScratchMove);
   scratchCanvas.addEventListener('pointerup', handleScratchEnd);
   scratchCanvas.addEventListener('pointerleave', handleScratchEnd);

   scratchReady = true;
}

function paintScratchLayer(width, height) {
   if (!scratchCtx) {
      return;
   }

   const gradient = scratchCtx.createLinearGradient(0, 0, width, height);
   gradient.addColorStop(0, '#d4d4d4');
   gradient.addColorStop(1, '#bcbcbc');

   scratchCtx.globalCompositeOperation = 'source-over';
   scratchCtx.fillStyle = gradient;
   scratchCtx.fillRect(0, 0, width, height);

   scratchCtx.fillStyle = 'rgba(70, 70, 70, 0.95)';
   scratchCtx.font = `bold ${Math.max(20, width * 0.07)}px "Jersey 10", sans-serif`;
   scratchCtx.textAlign = 'center';
   scratchCtx.fillText('Scratch Here', width / 2, height / 2 + 8);
}

function handleScratchStart(event) {
   if (revealDone) {
      return;
   }

   isScratching = true;
   scratchAt(event);
}

function handleScratchMove(event) {
   if (!isScratching || revealDone) {
      return;
   }

   scratchAt(event);
}

function handleScratchEnd() {
   isScratching = false;
}

function scratchAt(event) {
   if (!scratchCtx || !scratchCanvas) {
      return;
   }

   const rect = scratchCanvas.getBoundingClientRect();
   const x = event.clientX - rect.left;
   const y = event.clientY - rect.top;

   scratchCtx.globalCompositeOperation = 'destination-out';
   scratchCtx.beginPath();
   scratchCtx.arc(x, y, 18, 0, Math.PI * 2);
   scratchCtx.fill();

   const now = performance.now();
   if (now - lastCheck > 150 && scratchedEnough()) {
      revealScratchResult();
   }
   lastCheck = now;
}

function scratchedEnough() {
   if (!scratchCtx || !scratchCanvas) {
      return false;
   }

   const pixels = scratchCtx.getImageData(
      0,
      0,
      scratchCanvas.width,
      scratchCanvas.height
   ).data;

   let transparentCount = 0;
   const alphaStep = 4;

   for (let i = 3; i < pixels.length; i += alphaStep * 16) {
      if (pixels[i] === 0) {
         transparentCount += 1;
      }
   }

   const totalSamples = pixels.length / (alphaStep * 16);
   return transparentCount / totalSamples > 0.38;
}

function revealScratchResult() {
   revealDone = true;
   scratchCanvas.classList.add('revealed');
}

function setupCalendarLink() {
   if (!calendarLink) {
      return;
   }

   const eventStart = new Date(2026, 1, 14, 19, 0, 0);
   const eventEnd = new Date(2026, 1, 14, 21, 0, 0);

   const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Valentine Ask//EN',
      'BEGIN:VEVENT',
      `DTSTART:${toIcsDate(eventStart)}`,
      `DTEND:${toIcsDate(eventEnd)}`,
      'SUMMARY:Valentine Date - Homemade Pasta Dinner',
      'DESCRIPTION:Pasta dinner at home together',
      'LOCATION:Home',
      'END:VEVENT',
      'END:VCALENDAR'
   ].join('\r\n');

   const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
   const url = URL.createObjectURL(blob);

   calendarLink.href = url;
   calendarLink.download = 'valentine-date.ics';
}

function toIcsDate(date) {
   const pad = (value) => String(value).padStart(2, '0');
   return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}
