/* ==========================================================================
   JUST US — LUXURY ROMANTIC WEB APP
   Table of contents:
   1. Utilities & sound helper
   2. Custom cursor
   3. Background canvases (stars, hearts, particles)
   4. Screen navigation
   5. Login / Book
   6. Intro
   7. Love counter
   8. Message letter typing
   9. Gallery lightbox
   10. Moment book
   11. Video player
   12. Music control
   13. Puzzle game (5 levels, drag & drop)
   14. Confetti (final reward)
   15. Init
   ========================================================================== */

(() => {
  'use strict';

  /* ---------- 1. UTILITIES & SOUND HELPER ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function playSound(id, { volume = 0.6, restart = true } = {}) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      if (restart) el.currentTime = 0;
      el.volume = volume;
      const p = el.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* asset may be missing — fail silently */ }
  }

  function stopSound(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }

  /* ---------- 2. CUSTOM CURSOR ---------- */
  const cursor = $('#customCursor');
  const heartTrail = $('#cursorHeart');
  let lastHeartTime = 0;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    const target = e.target.closest('button, a, .nav-card, .gallery-item, input, .puzzle-piece');
    cursor.classList.toggle('hovering', !!target);
  });

  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    const now = Date.now();
    if (now - lastHeartTime < 120) return;
    lastHeartTime = now;
    heartTrail.style.left = e.clientX + 'px';
    heartTrail.style.top = e.clientY + 'px';
    heartTrail.classList.remove('pop');
    void heartTrail.offsetWidth;
    heartTrail.classList.add('pop');
  });

  /* ---------- 3. BACKGROUND CANVASES ---------- */
  const starsCanvas = $('#starsCanvas');
  const heartsCanvas = $('#heartsCanvas');
  const particlesCanvas = $('#particlesCanvas');
  const starsCtx = starsCanvas.getContext('2d');
  const heartsCtx = heartsCanvas.getContext('2d');
  const particlesCtx = particlesCanvas.getContext('2d');

  let W = 0, H = 0;
  function resizeCanvases() {
    W = window.innerWidth;
    H = window.innerHeight;
    [starsCanvas, heartsCanvas, particlesCanvas].forEach(c => {
      c.width = W * devicePixelRatio;
      c.height = H * devicePixelRatio;
      c.style.width = W + 'px';
      c.style.height = H + 'px';
      c.getContext('2d').setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    });
  }
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();

  // Stars
  const STAR_COUNT = 90;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * 0.85,
    r: Math.random() * 1.4 + 0.4,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.02 + 0.01
  }));

  function drawStars(t) {
    starsCtx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      const twinkle = 0.4 + Math.abs(Math.sin(t * s.speed + s.phase)) * 0.6;
      starsCtx.beginPath();
      starsCtx.fillStyle = `rgba(246, 231, 216, ${twinkle})`;
      starsCtx.shadowColor = 'rgba(212,175,122,0.8)';
      starsCtx.shadowBlur = 4;
      starsCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      starsCtx.fill();
    });
  }

  // Floating hearts
  let hearts = [];
  function spawnHeart() {
    hearts.push({
      x: Math.random() * W,
      y: H + 20,
      size: Math.random() * 16 + 10,
      speed: Math.random() * 0.6 + 0.3,
      drift: (Math.random() - 0.5) * 0.6,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.6,
      opacity: Math.random() * 0.4 + 0.25
    });
  }
  function drawHearts() {
    heartsCtx.clearRect(0, 0, W, H);
    for (let i = hearts.length - 1; i >= 0; i--) {
      const h = hearts[i];
      h.y -= h.speed;
      h.x += h.drift;
      h.rot += h.rotSpeed;
      if (h.y < -40) { hearts.splice(i, 1); continue; }
      heartsCtx.save();
      heartsCtx.translate(h.x, h.y);
      heartsCtx.rotate((h.rot * Math.PI) / 180);
      heartsCtx.globalAlpha = h.opacity;
      heartsCtx.font = `${h.size}px serif`;
      heartsCtx.fillStyle = '#D4AF7A';
      heartsCtx.textAlign = 'center';
      heartsCtx.fillText('❤', 0, 0);
      heartsCtx.restore();
    }
  }

  // Ambient particles
  const PARTICLE_COUNT = 40;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 2 + 0.6,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    opacity: Math.random() * 0.3 + 0.1
  }));
  function drawParticles() {
    particlesCtx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      particlesCtx.beginPath();
      particlesCtx.fillStyle = `rgba(255, 200, 200, ${p.opacity})`;
      particlesCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      particlesCtx.fill();
    });
  }

  let heartSpawnAcc = 0;
  function bgLoop(t) {
    drawStars(t * 0.001);
    heartSpawnAcc++;
    if (heartSpawnAcc > 55) { spawnHeart(); heartSpawnAcc = 0; }
    drawHearts();
    drawParticles();
    requestAnimationFrame(bgLoop);
  }
  requestAnimationFrame(bgLoop);

  /* ---------- 4. SCREEN NAVIGATION ---------- */
  function goToScreen(id) {
    const previousScreen = $('.screen.active');
    const previousId = previousScreen ? previousScreen.id : null;

    $$('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Stop background activity tied to the screen we're leaving
    if (previousId === 'screen-puzzle' && id !== 'screen-puzzle') {
      pausePuzzleTimer();
    }
    if (previousId === 'screen-message' && id !== 'screen-message') {
      stopSound('sfxTyping');
    }
    if (previousId === 'screen-video' && id !== 'screen-video') {
      const video = document.getElementById('loveVideo');
      if (video && document.pictureInPictureElement !== video) {
        video.pause();
        const playBtn = document.getElementById('videoPlayPause');
        if (playBtn) playBtn.textContent = '▶';
      }
    }

    // Start / resume activity tied to the screen we're entering
    if (id === 'screen-message') startLetterTyping();
    if (id === 'screen-momentbook') updateMomentIndicator();
    if (id === 'screen-puzzle') {
      if (!puzzleState.initialized) {
        initPuzzleGame();
      } else if (puzzleState.pendingLevel != null) {
        const lvl = puzzleState.pendingLevel;
        puzzleState.pendingLevel = null;
        buildLevel(lvl);
      } else {
        resumePuzzleTimer();
      }
    }
  }

  $$('[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('sfxClick', { volume: 0.4 });
      goToScreen(btn.dataset.target);
    });
  });

  /* ---------- 5. LOGIN / BOOK ---------- */
  const CORRECT_PASSWORD = 'rahma2024';
  const loginForm = $('#loginForm');
  const passwordInput = $('#passwordInput');
  const theBook = $('#theBook');
  const errorMessage = $('#errorMessage');
  let musicStarted = false;

  function tryStartMusic() {
    if (musicStarted) return;
    musicStarted = true;
    const music = $('#bgMusic');
    music.volume = 0.4;
    const p = music.play();
    if (p && p.catch) {
      p.then(() => {
        const icon = $('#musicIcon');
        if (icon) icon.classList.add('spinning');
      }).catch(() => {});
    }
    playSound('sfxAmbient', { volume: 0.15, restart: false });
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    tryStartMusic();
    const value = passwordInput.value.trim();

    if (value === CORRECT_PASSWORD) {
      errorMessage.classList.remove('show');
      playSound('sfxUnlock', { volume: 0.7 });
       bgMusic.volume = 0.4;
      bgMusic.play().catch(() => {});
      theBook.classList.add('is-open');
      playSound('sfxBookOpen', { volume: 0.6 });

      setTimeout(() => {
        goToScreen('screen-intro');
        startIntroSequence();
      }, 1500);
    } else {
      playSound('sfxError', { volume: 0.5 });
      errorMessage.classList.add('show');
      theBook.classList.remove('shake');
      void theBook.offsetWidth;
      theBook.classList.add('shake');
      setTimeout(() => theBook.classList.remove('shake'), 550);
    }
  });

  /* ---------- 6. INTRO ---------- */
  function startIntroSequence() {
    setTimeout(() => {
      goToScreen('screen-home');
    }, 4000);
  }

  /* ---------- 7. LOVE COUNTER ---------- */
  const START_DATE = new Date(2024, 6, 29, 0, 0, 0); // 29 June 2024

  function updateCounter() {
    const now = new Date();
    let years = now.getFullYear() - START_DATE.getFullYear();
    let months = now.getMonth() - START_DATE.getMonth();
    let days = now.getDate() - START_DATE.getDate();
    let hours = now.getHours() - START_DATE.getHours();
    let minutes = now.getMinutes() - START_DATE.getMinutes();
    let seconds = now.getSeconds() - START_DATE.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0) { months += 12; years--; }

    setCounterValue('cYears', years);
    setCounterValue('cMonths', months);
    setCounterValue('cDays', days);
    setCounterValue('cHours', hours);
    setCounterValue('cMinutes', minutes);
    setCounterValue('cSeconds', seconds);
  }

  const lastCounterValues = {};
  function setCounterValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    if (lastCounterValues[id] !== value) {
      lastCounterValues[id] = value;
      el.textContent = value;
      el.classList.remove('tick');
      void el.offsetWidth;
      el.classList.add('tick');
    }
  }

  setInterval(updateCounter, 1000);
  updateCounter();

  /* ---------- 8. MESSAGE LETTER TYPING ---------- */
  let letterTyped = false;
  function startLetterTyping() {
    if (letterTyped) return;
    letterTyped = true;
    const contentEl = $('#letterContent');
    const fullText = contentEl.textContent.trim();
    contentEl.textContent = '';
    let i = 0;

    if (!fullText) return;

    playSound('sfxTyping', { volume: 0.15, restart: true });
    const typer = setInterval(() => {
      contentEl.textContent += fullText[i];
      i++;
      if (i >= fullText.length) {
        clearInterval(typer);
        stopSound('sfxTyping');
      }
    }, 45);
  }

  /* ---------- 9. GALLERY LIGHTBOX ---------- */
  const galleryItems = $$('.gallery-item');
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  let currentGalleryIndex = 0;

  function openLightbox(index) {
    currentGalleryIndex = index;
    lightboxImg.src = galleryItems[index].dataset.full;
    lightbox.classList.add('active');
  }
  function closeLightbox() { lightbox.classList.remove('active'); }
  function showNextImage(dir) {
    currentGalleryIndex = (currentGalleryIndex + dir + galleryItems.length) % galleryItems.length;
    lightboxImg.src = galleryItems[currentGalleryIndex].dataset.full;
  }

  galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightboxPrev').addEventListener('click', () => showNextImage(-1));
  $('#lightboxNext').addEventListener('click', () => showNextImage(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  // swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) showNextImage(dx < 0 ? 1 : -1);
  });

  /* ---------- 10. MOMENT BOOK ---------- */
  const momentPages = $$('.moment-page');
  let momentIndex = 0;

  function updateMomentBook() {
    momentPages.forEach((page, i) => {
      page.style.zIndex = momentPages.length - i;
      page.classList.toggle('flipped', i < momentIndex);
    });
    updateMomentIndicator();
  }
  function updateMomentIndicator() {
    const indicator = $('#momentIndicator');
    if (indicator) indicator.textContent = `${Math.min(momentIndex + 1, momentPages.length)} / ${momentPages.length}`;
    $('#momentPrev').disabled = momentIndex <= 0;
    $('#momentNext').disabled = momentIndex >= momentPages.length;
  }

  $('#momentNext').addEventListener('click', () => {
    if (momentIndex < momentPages.length) {
      playSound('sfxPageFlip', { volume: 0.5 });
      momentIndex++;
      updateMomentBook();
    }
  });
  $('#momentPrev').addEventListener('click', () => {
    if (momentIndex > 0) {
      playSound('sfxPageFlip', { volume: 0.5 });
      momentIndex--;
      updateMomentBook();
    }
  });
  updateMomentBook();

  /* ---------- 11. VIDEO PLAYER ---------- */
  const loveVideo = $('#loveVideo');
  const videoPlayPause = $('#videoPlayPause');
  const videoSeek = $('#videoSeek');

  videoPlayPause.addEventListener('click', () => {
    if (loveVideo.paused) {
      loveVideo.play().catch(() => {});
      videoPlayPause.textContent = '❚❚';
    } else {
      loveVideo.pause();
      videoPlayPause.textContent = '▶';
    }
  });
  loveVideo.addEventListener('timeupdate', () => {
    if (loveVideo.duration) {
      videoSeek.value = (loveVideo.currentTime / loveVideo.duration) * 100;
    }
  });
  videoSeek.addEventListener('input', () => {
    if (loveVideo.duration) {
      loveVideo.currentTime = (videoSeek.value / 100) * loveVideo.duration;
    }
  });
  $('#videoPip').addEventListener('click', async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await loveVideo.requestPictureInPicture();
      }
    } catch (e) {}
  });
  $('#videoFullscreen').addEventListener('click', () => {
    if (loveVideo.requestFullscreen) loveVideo.requestFullscreen().catch(() => {});
  });

  /* ---------- 12. MUSIC CONTROL ---------- */
  const bgMusic = $('#bgMusic');
  const musicToggle = $('#musicToggle');
  const musicIcon = $('#musicIcon');
  const muteToggle = $('#muteToggle');
  const volumeSlider = $('#volumeSlider');
  let isMuted = false;

  musicToggle.addEventListener('click', () => {
    tryStartMusic();
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {});
      musicIcon.classList.add('spinning');
    } else {
      bgMusic.pause();
      musicIcon.classList.remove('spinning');
    }
  });
  volumeSlider.addEventListener('input', () => {
    bgMusic.volume = volumeSlider.value / 100;
  });
  muteToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    const ambient = document.getElementById('sfxAmbient');
    if (ambient) ambient.muted = isMuted;
    muteToggle.textContent = isMuted ? '🔇' : '🔊';
  });

  /* ---------- 13. PUZZLE GAME ---------- */
  const LEVELS = [
    { size: 3, image: 'images/puzzle1.jpg', label: 'مستوى 1' },
    { size: 3, image: 'images/puzzle2.jpg', label: 'مستوى 2' },
    { size: 4, image: 'images/puzzle3.jpg', label: 'مستوى 3' },
    { size: 4, image: 'images/puzzle4.jpg', label: 'مستوى 4' },
    { size: 5, image: 'images/puzzle5.jpg', label: 'مستوى 5' }
  ];

  let puzzleState = {
    levelIndex: 0,
    moves: 0,
    score: 0,
    seconds: 0,
    timerHandle: null,
    boardSize: 0,
    pieceSize: 0,
    gridSize: 3,
    pieces: [],
    slots: [],
    initialized: false,
    pendingLevel: null
  };

  const puzzleBoard = $('#puzzleBoard');

  function initPuzzleGame() {
    if (puzzleState.initialized) return;
    puzzleState.initialized = true;
    puzzleState.levelIndex = 0;
    puzzleState.score = 0;
    buildLevel(0);
  }

  function buildLevel(index) {
    const level = LEVELS[index];
    puzzleState.levelIndex = index;
    puzzleState.gridSize = level.size;
    puzzleState.moves = 0;
    puzzleState.seconds = 0;
    pausePuzzleTimer();

    puzzleBoard.innerHTML = '';
    const rect = puzzleBoard.getBoundingClientRect();
    puzzleState.boardSize = rect.width;
    puzzleState.pieceSize = rect.width / level.size;

    // build slot list (row,col) then shuffle piece->slot assignment
    const total = level.size * level.size;
    const slotIndexes = Array.from({ length: total }, (_, i) => i);
    let shuffled = shuffleArray([...slotIndexes]);
    // guarantee not already-solved shuffle
    if (shuffled.every((v, i) => v === i)) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }

    puzzleState.pieces = [];

    for (let correctIndex = 0; correctIndex < total; correctIndex++) {
      const correctRow = Math.floor(correctIndex / level.size);
      const correctCol = correctIndex % level.size;
      const slotIndex = shuffled[correctIndex];

      const piece = document.createElement('div');
      piece.className = 'puzzle-piece';
      piece.dataset.correctIndex = correctIndex;
      piece.style.width = puzzleState.pieceSize + 'px';
      piece.style.height = puzzleState.pieceSize + 'px';
      piece.style.backgroundImage = `url(${level.image})`;
      piece.style.backgroundSize = `${puzzleState.boardSize}px ${puzzleState.boardSize}px`;
      piece.style.backgroundPosition = `-${correctCol * puzzleState.pieceSize}px -${correctRow * puzzleState.pieceSize}px`;

      placePieceAtSlot(piece, slotIndex);
      attachDragHandlers(piece);
      puzzleBoard.appendChild(piece);
      puzzleState.pieces.push(piece);
    }

    updateHud();
    startPuzzleTimer();
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function placePieceAtSlot(piece, slotIndex) {
    const size = puzzleState.gridSize;
    const row = Math.floor(slotIndex / size);
    const col = slotIndex % size;
    piece.dataset.slotIndex = slotIndex;
    piece.style.top = (row * puzzleState.pieceSize) + 'px';
    piece.style.left = (col * puzzleState.pieceSize) + 'px';
    piece.classList.toggle('correct', Number(piece.dataset.correctIndex) === slotIndex);
  }

  function attachDragHandlers(piece) {
    let dragging = false;
    let offsetX = 0, offsetY = 0;

    piece.addEventListener('pointerdown', (e) => {
      dragging = true;
      piece.classList.add('dragging');
      piece.setPointerCapture(e.pointerId);
      const boardRect = puzzleBoard.getBoundingClientRect();
      offsetX = e.clientX - boardRect.left - parseFloat(piece.style.left);
      offsetY = e.clientY - boardRect.top - parseFloat(piece.style.top);
      playSound('sfxDrag', { volume: 0.25 });
    });

    piece.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const boardRect = puzzleBoard.getBoundingClientRect();
      let x = e.clientX - boardRect.left - offsetX;
      let y = e.clientY - boardRect.top - offsetY;
      piece.style.left = x + 'px';
      piece.style.top = y + 'px';
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      piece.classList.remove('dragging');

      const boardRect = puzzleBoard.getBoundingClientRect();
      const centerX = (e.clientX ?? boardRect.left) - boardRect.left;
      const centerY = (e.clientY ?? boardRect.top) - boardRect.top;
      const size = puzzleState.gridSize;
      let col = Math.floor(centerX / puzzleState.pieceSize);
      let row = Math.floor(centerY / puzzleState.pieceSize);
      col = Math.max(0, Math.min(size - 1, col));
      row = Math.max(0, Math.min(size - 1, row));
      const targetSlot = row * size + col;

      const occupying = puzzleState.pieces.find(p => p !== piece && Number(p.dataset.slotIndex) === targetSlot);
      const originSlot = Number(piece.dataset.slotIndex);

      if (occupying) {
        placePieceAtSlot(occupying, originSlot);
        occupying.classList.add('snap');
        setTimeout(() => occupying.classList.remove('snap'), 350);
      }
      placePieceAtSlot(piece, targetSlot);
      piece.classList.add('snap');
      setTimeout(() => piece.classList.remove('snap'), 350);

      puzzleState.moves++;
      updateHud();
      if (Number(piece.dataset.correctIndex) === targetSlot) {
        playSound('sfxSuccess', { volume: 0.4 });
      } else {
        playSound('sfxClick', { volume: 0.3 });
      }
      checkPuzzleComplete();
    }

    piece.addEventListener('pointerup', endDrag);
    piece.addEventListener('pointercancel', endDrag);
  }

  function startPuzzleTimer() {
    if (puzzleState.timerHandle) return;
    puzzleState.timerHandle = setInterval(() => {
      puzzleState.seconds++;
      updateHud();
    }, 1000);
  }

  function pausePuzzleTimer() {
    if (puzzleState.timerHandle) {
      clearInterval(puzzleState.timerHandle);
      puzzleState.timerHandle = null;
    }
  }

  function resumePuzzleTimer() {
    const puzzleScreen = document.getElementById('screen-puzzle');
    const isMidGame = puzzleScreen && !$('#levelPopup').classList.contains('active') && !$('#finalReward').classList.contains('active');
    if (isMidGame) startPuzzleTimer();
  }

  function updateHud() {
    const level = LEVELS[puzzleState.levelIndex];
    tickValue('hudLevel', puzzleState.levelIndex + 1);
    tickValue('hudMoves', puzzleState.moves);
    tickValue('hudScore', puzzleState.score);
    const mm = String(Math.floor(puzzleState.seconds / 60)).padStart(2, '0');
    const ss = String(puzzleState.seconds % 60).padStart(2, '0');
    $('#hudTimer').textContent = `${mm}:${ss}`;
    $('#hudStars').textContent = starsForCurrentAttempt();
  }

  function tickValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.textContent !== String(value)) {
      el.textContent = value;
      el.classList.remove('tick');
      void el.offsetWidth;
      el.classList.add('tick');
    }
  }

  function starsForCurrentAttempt() {
    const n = calculateStars();
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  function calculateStars() {
    const level = LEVELS[puzzleState.levelIndex];
    const total = level.size * level.size;
    const idealMoves = total; // baseline for "excellent"
    const moves = puzzleState.moves;
    const seconds = puzzleState.seconds;

    let stars = 5;
    if (moves > idealMoves * 1.2 || seconds > total * 6) stars = 4;
    if (moves > idealMoves * 1.6 || seconds > total * 10) stars = 3;
    if (moves > idealMoves * 2.2 || seconds > total * 16) stars = 2;
    if (moves > idealMoves * 3 || seconds > total * 24) stars = 1;
    return stars;
  }

  function checkPuzzleComplete() {
    const solved = puzzleState.pieces.every(p => Number(p.dataset.correctIndex) === Number(p.dataset.slotIndex));
    if (!solved) return;

    pausePuzzleTimer();
    puzzleBoard.classList.add('celebrating');
    setTimeout(() => puzzleBoard.classList.remove('celebrating'), 650);
    playSound('sfxPuzzleComplete', { volume: 0.7 });

    const stars = calculateStars();
    const levelScore = stars * 200 - puzzleState.moves * 2 - puzzleState.seconds;
    puzzleState.score += Math.max(levelScore, 50);
    updateHud();

    showLevelPopup(stars);
  }

  function showLevelPopup(stars) {
    const popup = $('#levelPopup');
    $('#popupStars').textContent = '★'.repeat(stars) + '☆'.repeat(5 - stars);
    $('#popupScore').textContent = puzzleState.score;
    const isLastLevel = puzzleState.levelIndex >= LEVELS.length - 1;
    $('#popupTitle').textContent = isLastLevel ? 'أنهيت كل المستويات! ❤' : 'أحسنت! ❤';
    $('#popupNext').textContent = isLastLevel ? 'جاري تحضير المفاجأة...' : 'جاري تحميل المستوى التالي...';
    popup.classList.add('active');

    setTimeout(() => {
      popup.classList.remove('active');
      if (isLastLevel) {
        showFinalReward();
      } else {
        const nextLevel = puzzleState.levelIndex + 1;
        const puzzleScreen = document.getElementById('screen-puzzle');
        if (puzzleScreen && puzzleScreen.classList.contains('active')) {
          buildLevel(nextLevel);
        } else {
          // board is hidden right now (0×0) — defer the rebuild until the
          // player is actually back on this screen so pieces get real sizes
          puzzleState.pendingLevel = nextLevel;
        }
      }
    }, 2200);
  }

  function showFinalReward() {
    playSound('sfxReward', { volume: 0.7 });
    playSound('sfxConfetti', { volume: 0.5 });
    const overlay = $('#finalReward');
    overlay.classList.add('active');
    startConfetti();
  }

  $('#rewardBackHome').addEventListener('click', () => {
    stopConfetti();
    $('#finalReward').classList.remove('active');
    puzzleState.initialized = false;
    goToScreen('screen-home');
  });

  // rebuild puzzle board sizing on resize while on puzzle screen
  window.addEventListener('resize', () => {
    if (document.getElementById('screen-puzzle').classList.contains('active') && puzzleState.initialized) {
      buildLevel(puzzleState.levelIndex);
    }
  });

  /* ---------- 14. CONFETTI ---------- */
  const confettiCanvas = $('#confettiCanvas');
  const confettiCtx = confettiCanvas.getContext('2d');
  let confettiParticles = [];
  let confettiRunning = false;

  function startConfetti() {
    confettiCanvas.width = confettiCanvas.offsetWidth;
    confettiCanvas.height = confettiCanvas.offsetHeight;
    confettiParticles = Array.from({ length: 120 }, () => ({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * confettiCanvas.height,
      size: Math.random() * 6 + 4,
      speed: Math.random() * 2 + 1.5,
      drift: (Math.random() - 0.5) * 2,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      color: ['#D4AF7A', '#F6E7D8', '#7A1F42', '#ffb4b4'][Math.floor(Math.random() * 4)]
    }));
    confettiRunning = true;
    requestAnimationFrame(confettiLoop);
  }
  function confettiLoop() {
    if (!confettiRunning) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach(p => {
      p.y += p.speed;
      p.x += p.drift;
      p.rot += p.rotSpeed;
      if (p.y > confettiCanvas.height + 20) p.y = -20;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rot * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confettiCtx.restore();
    });
    requestAnimationFrame(confettiLoop);
  }
  function stopConfetti() {
    confettiRunning = false;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }

  /* ---------- 15. GLOBAL CLICK FEEDBACK (ripple + click sound) ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (['musicToggle', 'muteToggle'].includes(btn.id)) return; // avoid double sound
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });

  document.addEventListener('pointerdown', () => tryStartMusic(), { once: true });

})();
