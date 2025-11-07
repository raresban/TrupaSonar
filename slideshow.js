document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('.slideshow');
  if (!root) return;

  const slidesWrapper = root.querySelector('.slides');
  const slides = Array.from(root.querySelectorAll('.slide'));
  const dotsBox = root.querySelector('.dots');

  console.log('Total slides:', slides.length); // debug

  // Declare i early
  let i = slides.findIndex(s => s.classList.contains('is-active'));
  if (i < 0 && slides.length > 0) { 
    slides[0].classList.add('is-active'); 
    i = 0; 
  }

  // Set blurred background for each slide
  slides.forEach(slide => {
    const img = slide.querySelector('img');
    const setBg = () => {
      slide.style.setProperty('--bg', `url("${img.currentSrc || img.src}")`);
      if (slide.classList.contains('is-active')) {
        adjustHeight();
      }
    };
    
    if (img.complete) setBg();
    else img.addEventListener('load', setBg, { once:true });
  });

  // Build dots
  slides.forEach((_, idx) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Slide ${idx+1}`);
    b.addEventListener('click', () => goTo(idx));
    dotsBox.appendChild(b);
  });
  const dots = Array.from(dotsBox.children);

  updateDots();
  adjustHeight();

  function adjustHeight(){
    const activeSlide = slides[i];
    if (!activeSlide) return;
    const img = activeSlide.querySelector('img');
    if (img && img.complete && img.naturalHeight > 0) {
      // Calculate height based on image aspect ratio within max constraints
      const containerWidth = slidesWrapper.offsetWidth;
      const maxWidth = containerWidth * 0.9; // 90% of container
      const maxHeight = window.innerHeight * 0.75; // 75vh
      
      const imgRatio = img.naturalHeight / img.naturalWidth;
      let displayWidth = Math.min(img.naturalWidth, maxWidth);
      let displayHeight = displayWidth * imgRatio;
      
      if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
      }
      
      slidesWrapper.style.height = `${displayHeight + 40}px`; // +40 for caption/dots
    }
  }

  function goTo(idx){
    slides[i].classList.remove('is-active');
    i = (idx + slides.length) % slides.length;
    slides[i].classList.add('is-active');
    updateDots();
    setTimeout(adjustHeight, 150);
  }
  
  function next(dir=1){ goTo(i + dir); }
  
  function updateDots(){ 
    dots.forEach((d,k) => d.classList.toggle('active', k===i)); 
  }

  let timer, paused=false;
  function play(){ 
    clearInterval(timer); 
    timer = setInterval(() => next(1), 4000); 
  }
  play();

  root.querySelector('.slide-nav.prev').addEventListener('click', () => { next(-1); play(); });
  root.querySelector('.slide-nav.next').addEventListener('click', () => { next(1); play(); });

  root.addEventListener('mouseenter', () => { if(!paused){ clearInterval(timer); paused=true; }});
  root.addEventListener('mouseleave', () => { if(paused){ play(); paused=false; }});

  root.setAttribute('tabindex','0');
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { next(-1); play(); }
    if (e.key === 'ArrowRight') { next(1); play(); }
  });

  let sx=0;
  root.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, {passive:true});
  root.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40){ next(dx < 0 ? 1 : -1); play(); }
  });

  window.addEventListener('resize', adjustHeight);
});