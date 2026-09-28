const eventStart = new Date('2026-11-21T21:00:00-03:00');
const intro = document.querySelector('#intro');
const invitation = document.querySelector('#invitation');
const music = document.querySelector('#music');
const audioToggle = document.querySelector('#audioToggle');
const toast = document.querySelector('#toast');
let effectsStarted = false;

function pieceFor(source){return document.querySelector(`img[src="assets/${source}"]`)?.closest('.piece');}
function addEffect(source,...classes){pieceFor(source)?.classList.add(...classes);}

addEffect('portada.png','fx-cover');
document.querySelector('.guests')?.classList.add('fx-guests');
document.querySelector('.countdown')?.classList.add('fx-countdown');
addEffect('fecha.png','fx-date');
addEffect('ubicacion.png','fx-location','fx-cta');
addEffect('dress-code.png','fx-dress');
pieceFor('dress-code.png')?.classList.add('no-seam-fade');
addEffect('regalos.png','fx-gift','fx-cta');
addEffect('fotos-poquito.png','fx-gallery');
addEffect('musica.png','fx-music');
addEffect('bloomkeep.png','fx-bloom');
addEffect('confirmacion.png','fx-confirmation','fx-cta');
addEffect('cierre.png','fx-close');

function setupFireflies(){
  if(invitation.querySelector('.firefly-layer'))return;
  const configs=[
    ['portada.png',[[8,12],[21,18],[43,11],[72,14],[91,23],[12,38],[88,43],[7,62],[21,72],[79,68],[93,79],[14,88],[39,91],[62,84],[84,92]]],
    ['invitados.png',[[8,10],[24,16],[52,11],[78,14],[92,25],[9,29],[91,63],[12,70],[29,82],[53,74],[76,86],[91,92],[7,91],[68,68]]],
    ['regalos.png',[[9,12],[28,16],[57,10],[83,17],[93,29],[8,50],[91,54],[14,68],[32,76],[58,70],[78,82],[93,91],[9,90],[47,92],[85,65]]],
    ['musica.png',[[8,11],[31,15],[57,9],[81,14],[93,27],[8,46],[91,48],[13,63],[35,72],[62,67],[82,76],[94,89],[12,91],[49,88],[74,94]]],
    ['cierre.png',[[7,10],[22,17],[45,9],[70,14],[91,21],[10,35],[89,40],[7,58],[92,61],[15,73],[34,82],[58,75],[79,84],[94,92],[9,92],[48,94],[71,65]]]
  ];
  const layers=[];
  configs.forEach(([source,points])=>{
    const piece=pieceFor(source);
    if(!piece)return;
    const layer=document.createElement('div');
    layer.className='firefly-layer';
    layer.setAttribute('aria-hidden','true');
    points.forEach(([x,y],index)=>{
      const light=document.createElement('i');
      light.style.setProperty('--x',`${x}%`);
      light.style.setProperty('--y',`${y}%`);
      light.style.setProperty('--size',`clamp(3px,${.52+(index%3)*.11}vw,6px)`);
      light.style.setProperty('--glow',`${2.8+(index%5)*.34}s`);
      light.style.setProperty('--drift',`${8+(index%4)*1.35}s`);
      light.style.setProperty('--delay',`${-(index*.43%4.7)}s`);
      layer.appendChild(light);
    });
    piece.appendChild(layer);
    layers.push(layer);
  });
  const fireflyObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>entry.target.classList.toggle('is-active',entry.isIntersecting));
  },{threshold:.08,rootMargin:'12% 0px 12%'});
  layers.forEach(layer=>fireflyObserver.observe(layer));
}

function startSectionEffects(){
  if(effectsStarted)return;
  effectsStarted=true;
  invitation.classList.add('fx-ready');
  setupFireflies();
  const animatedPieces=[...invitation.querySelectorAll('.piece:not(.footer)')];
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },{threshold:.18,rootMargin:'0px 0px -8%'});
  requestAnimationFrame(()=>animatedPieces.forEach(piece=>observer.observe(piece)));
}

// La cuenta regresiva va inmediatamente debajo de los datos del invitado.
document.querySelector('.guests').after(document.querySelector('.countdown'));

// Secciones que no forman parte de la version final.
document.querySelector('img[src="assets/fotos.png"]').closest('.piece').remove();
document.querySelector('img[src="assets/bloomkeep-portada.jpg"]').closest('.piece').remove();

// Cierre: BloomKeep, confirmacion, Te espero y footer.
document.querySelector('img[src="assets/cierre.png"]').closest('.piece').before(document.querySelector('#rsvpBtn').closest('.piece'));

function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

document.querySelectorAll('[data-enter]').forEach(button => button.addEventListener('click', async () => {
  const wantsMusic = button.dataset.enter === 'music';
  document.body.classList.remove('locked');
  setScrollInstant(0);
  intro.classList.add('is-opening');
  invitation.setAttribute('aria-hidden','false');
  setTimeout(startSectionEffects,260);
  setTimeout(armScratchLock,900);
  if(wantsMusic){
    try { await music.play(); audioToggle.hidden = false; }
    catch { showToast('Podés activar la música con el botón inferior'); audioToggle.hidden = false; audioToggle.setAttribute('aria-pressed','false'); }
  }
  setTimeout(() => intro.classList.add('is-open'),520);
  setTimeout(() => intro.remove(), 1350);
}));

audioToggle.addEventListener('click', async () => {
  if(music.paused){ await music.play(); audioToggle.setAttribute('aria-pressed','true'); audioToggle.setAttribute('aria-label','Pausar música'); }
  else { music.pause(); audioToggle.setAttribute('aria-pressed','false'); audioToggle.setAttribute('aria-label','Reproducir música'); }
  audioToggle.classList.remove('pulse');
  void audioToggle.offsetWidth;
  audioToggle.classList.add('pulse');
  setTimeout(()=>audioToggle.classList.remove('pulse'),700);
});

const params = new URLSearchParams(location.search);
const guestName = params.get('nombre') || params.get('invitado');
const seats = Math.max(1, Number.parseInt(params.get('lugares') || '1',10) || 1);
if(guestName) document.querySelector('#guestName').textContent = guestName;
document.querySelector('#guestSeats').innerHTML = `Tenés <strong>${seats} ${seats === 1 ? 'lugar' : 'lugares'}</strong> ${seats === 1 ? 'reservado' : 'reservados'}`;

function updateCountdown(){
  const distance = Math.max(0,eventStart-Date.now());
  const values = [Math.floor(distance/864e5),Math.floor(distance/36e5)%24,Math.floor(distance/6e4)%60,Math.floor(distance/1000)%60];
  ['days','hours','minutes','seconds'].forEach((id,index) => {
    const element=document.querySelector(`#${id}`);
    const next=String(values[index]).padStart(2,'0');
    if(element.textContent!==next){
      element.textContent=next;
      element.classList.remove('tick');
      void element.offsetWidth;
      element.classList.add('tick');
    }
  });
}
updateCountdown(); setInterval(updateCountdown,1000);

const scratchCard = document.querySelector('#dateScratch');
const scratchCanvas = document.querySelector('#scratchCanvas');
const scratchContext = scratchCanvas.getContext('2d',{willReadFrequently:true});
const scratchCover = new Image();
let scratching = false;
let lastScratchPoint = null;
let scratchChecks = 0;
let scratchPageLocked = false;
let scratchLockY = 0;
let scratchObserverArmed = false;

function setScrollInstant(y){
  const root=document.documentElement;
  const previous=root.style.scrollBehavior;
  root.style.scrollBehavior='auto';
  window.scrollTo(0,y);
  root.style.scrollBehavior=previous;
}

function lockPageForScratch(){
  if(scratchPageLocked || scratchCard.classList.contains('is-revealed'))return;
  scratchPageLocked=true;
  const rect=scratchCard.getBoundingClientRect();
  const centeredOffset=Math.max(0,(window.innerHeight-Math.min(rect.height,window.innerHeight))/2);
  scratchLockY=Math.max(0,Math.round(window.scrollY+rect.top-centeredOffset));
  setScrollInstant(scratchLockY);
  requestAnimationFrame(()=>{
    document.body.style.top=`-${scratchLockY}px`;
    document.body.classList.add('scratch-locked');
    scratchCard.classList.add('is-scratch-focused');
  });
}

function unlockPageAfterScratch(){
  if(!scratchPageLocked)return;
  document.body.classList.remove('scratch-locked');
  document.body.style.top='';
  setScrollInstant(scratchLockY);
  scratchCard.classList.remove('is-scratch-focused');
  scratchPageLocked=false;
}

const scratchSectionObserver=new IntersectionObserver(([entry])=>{
  if(entry.isIntersecting && entry.intersectionRatio>=.38)lockPageForScratch();
},{threshold:[.38]});

function armScratchLock(){
  if(scratchObserverArmed || scratchCard.classList.contains('is-revealed'))return;
  scratchObserverArmed=true;
  scratchSectionObserver.observe(scratchCard);
}

scratchCover.addEventListener('load',() => scratchContext.drawImage(scratchCover,0,0,scratchCanvas.width,scratchCanvas.height));
scratchCover.src = 'assets/descubrir-fecha.png';

function scratchPoint(event){
  const rect = scratchCanvas.getBoundingClientRect();
  return {x:(event.clientX-rect.left)*(scratchCanvas.width/rect.width),y:(event.clientY-rect.top)*(scratchCanvas.height/rect.height)};
}
function eraseScratch(from,to){
  scratchContext.save();
  scratchContext.globalCompositeOperation='destination-out';
  scratchContext.lineCap='round';
  scratchContext.lineJoin='round';
  scratchContext.lineWidth=115;
  scratchContext.beginPath();
  scratchContext.moveTo(from.x,from.y);
  scratchContext.lineTo(to.x,to.y);
  scratchContext.stroke();
  scratchContext.restore();
}
function revealScratchCard(){
  if(scratchCard.classList.contains('is-revealed'))return;
  scratchCanvas.classList.add('is-cleared');
  scratchCard.classList.add('is-revealed');
  document.querySelector('#calendarBtn').disabled=false;
  scratchSectionObserver.disconnect();
  setTimeout(unlockPageAfterScratch,650);
}
function checkScratchProgress(){
  const pixels=scratchContext.getImageData(0,0,scratchCanvas.width,scratchCanvas.height).data;
  let cleared=0,total=0;
  for(let i=3;i<pixels.length;i+=160){total++;if(pixels[i]<40)cleared++;}
  if(cleared/total>.60) revealScratchCard();
}
scratchCanvas.addEventListener('pointerdown',event=>{
  scratching=true;
  lastScratchPoint=scratchPoint(event);
  scratchCanvas.setPointerCapture(event.pointerId);
  eraseScratch(lastScratchPoint,lastScratchPoint);
});
scratchCanvas.addEventListener('pointermove',event=>{
  if(!scratching)return;
  const point=scratchPoint(event);
  eraseScratch(lastScratchPoint,point);
  lastScratchPoint=point;
  if(++scratchChecks%18===0)checkScratchProgress();
});
scratchCanvas.addEventListener('pointerup',()=>{scratching=false;lastScratchPoint=null;checkScratchProgress();});
scratchCanvas.addEventListener('pointercancel',()=>{scratching=false;lastScratchPoint=null;});

document.querySelector('#calendarBtn').addEventListener('click', () => {
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//BloomDate//Mia XV//ES','BEGIN:VEVENT','UID:mia-xv-20261121@bloomdate','DTSTAMP:20260928T150000Z','DTSTART:20261122T000000Z','DTEND:20261122T083000Z','SUMMARY:XV de Mía','LOCATION:Fiori\\, Escobar','DESCRIPTION:Te espero para vivir una noche mágica.','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([ics],{type:'text/calendar'})); link.download='XV-de-Mia.ics'; link.click(); URL.revokeObjectURL(link.href);
  showToast('Evento listo para agregar');
});

let modalTrigger=null;
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click',() => {
  modalTrigger=button;
  button.classList.add('is-pressed');
  const modal = document.querySelector(`#${button.dataset.open}`); modal.hidden=false; document.body.classList.add('locked'); modal.querySelector('a,button').focus();
  setTimeout(()=>button.classList.remove('is-pressed'),650);
}));
function closeModal(modal){ modal.hidden=true; document.body.classList.remove('locked'); modalTrigger?.focus(); modalTrigger=null; }
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click',() => closeModal(button.closest('.modal'))));
document.querySelectorAll('.modal').forEach(modal => modal.addEventListener('click',e => { if(e.target===modal) closeModal(modal); }));
document.addEventListener('keydown',e => { if(e.key==='Escape') document.querySelectorAll('.modal:not([hidden])').forEach(closeModal); });

document.querySelector('#copyAlias').addEventListener('click',async () => {
  try { await navigator.clipboard.writeText('mmiamb'); showToast('Alias copiado: mmiamb'); }
  catch { showToast('Alias: mmiamb'); }
});

document.querySelector('#rsvpBtn').addEventListener('click',async () => {
  const who = guestName || 'Invitado/a';
  const text = `Hola, soy ${who}. Confirmo mi asistencia a los XV de Mía el 21/11/2026. Lugares reservados: ${seats}.`;
  if(navigator.share){ try { await navigator.share({title:'Confirmación XV de Mía',text}); return; } catch(e){ if(e.name==='AbortError') return; } }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank','noopener');
});
