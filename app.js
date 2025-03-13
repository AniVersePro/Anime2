document.addEventListener('DOMContentLoaded', () => {
  // Detect Android devices and add a specific class
  if (/android/i.test(navigator.userAgent)) {
    document.documentElement.classList.add('android');
  }

  // Disable right-click context menu
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // -----------------------------------
  // DOM References
  // -----------------------------------
  const DOM = {
    searchInput: document.getElementById('search'),
    animeGrid: document.getElementById('anime-grid'),
    coinDisplay: document.querySelector('.coins'),
    videoModal: document.getElementById('videoModal'),
    videoPlayer: document.getElementById('videoPlayer'),
    episodeSelect: document.getElementById('episodeSelect'),
    videoContainer: document.getElementById('videoContainer'),
    loader: document.getElementById('loader'),
    loaderMessage: document.getElementById('loaderMessage'),
    adsToggleBtn: document.getElementById('adsToggleBtn'),
    backBtn: document.getElementById('backBtn'),
    platformModal: document.getElementById('platformModal'),
    closePlatformModal: document.getElementById('closePlatformModal'),
    platformFrame: document.getElementById('platformFrame'),
    platformTitle: document.getElementById('platformTitle'),
    openExternallyBtn: document.getElementById('openExternallyBtn'),
    platformLoader: document.getElementById('platformLoader'),
    platformLoaderMessage: document.getElementById('platformLoaderMessage'),
    platformFallbackContainer: document.getElementById('platformFallbackContainer'),
    signInBtn: document.getElementById('signInBtn'),
    logInBtn: document.getElementById('logInBtn'),
    authModal: document.getElementById('authModal'),
    closeAuthModal: document.getElementById('closeAuthModal'),
    registerBtn: document.getElementById('registerBtn'),
    manualLogInBtn: document.getElementById('manualLogInBtn'),
    authEmail: document.getElementById('authEmail'),
    authPassword: document.getElementById('authPassword'),
    miyuChatContainer: document.getElementById('miyuChatContainer'),
    miyuPhoneFrame: document.getElementById('miyuPhoneFrame'),
    miyuIcon: document.getElementById('miyuIcon'),
    miyuClose: document.getElementById('miyuClose'),
    miyuSend: document.getElementById('miyuSend'),
    miyuText: document.getElementById('miyuText'),
    miyuMessages: document.getElementById('miyuMessages')
  };

  let adsBlocked = true;
  let coinTrackingInterval = null;
  let rankMapping = {};

  // -----------------------------------
  // Anime Data (for the main grid)
  // -----------------------------------
  const animeData = [
    {
      title: 'Demon Slayer',
      category: 'Action,Shonen',
      coins: 1500,
      image: 'MV5BMWU1OGEwNmQtNGM3MS00YTYyLThmYmMtN2FjYzQzNzNmNTE0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
      externalUrl: 'https://anime-world.co/series/demon-slayer/'
    },
    {
      title: 'Solo Leveling',
      category: 'Adventure,Shonen',
      coins: 2000,
      image: 'MV5BNjIwZjM4MWMtOGZiOS00YTllLTkwMWYtZmQxZjM2ZGU4ZmNiXkEyXkFqcGc@._V1_.jpg',
      externalUrl: 'https://anime-world.co/series/solo-leveling/'
    },
    {
      title: 'Another',
      category: 'Horror,Romance',
      coins: 1670,
      image: 'abcdganother4.jpg'
    },
    {
      title: 'Naruto Shippuden',
      category: 'Shonen,Action',
      coins: 1800,
      image: 'narutog.jpg',
      externalUrl: 'https://anime-world.co/series/naruto-shippuden/'
    },
    {
      title: 'ReZero',
      category: 'Isekai,Drama',
      coins: 1900,
      image: 'rezerog.jpg',
      externalUrl: 'https://animedekho.net/series/rezero-starting-life-in-another-world/'
    },
    {
      title: 'KonoSuba',
      category: 'Isekai,Drama',
      coins: 1300,
      image: 'Konosubag.jpg',
      externalUrl: 'https://www.animeparadise.moe/anime/kono-subarashii-sekai-ni-shukufuku-wo'
    },
    {
      title: 'Violet Evergarden',
      category: 'Drama,Romance',
      coins: 1970,
      image: 'VioletEg.jpg',
      externalUrl: 'https://www.animeparadise.moe/anime/violet-evergarden'
    },
    {
      title: 'Takt Op. Destiny',
      category: 'Music,Fantasy',
      coins: 1356,
      image: 'Tkopdg.jpg',
      externalUrl: 'https://www.animeparadise.moe/anime/takt-op'
    },
    {
      title: 'Dr.Stone',
      category: 'Sci-Fi,Adventure',
      coins: 1903,
      image: 'drstoneg.jpg',
      externalUrl: 'https://anime-world.co/series/dr-stone/'
    },
    {
      title: 'Weathering With You',
      category: 'Romance,Mystery',
      coins: 1904,
      image: 'wwyg1.jpg',
      externalUrl: 'https://mega.nz/file/fAd2ALKC#uBylJXPrmBxPifdAwlyAiTd9U13TjN4Hhq6lznqx018'
    } 
  ];

  const anotherDriveLink = 'https://drive.google.com/drive/folders/1m0t1bR8H1Qz2joh5uJ6DoVK-ehhOpFjq';

  // -----------------------------------
  // Authentication
  // -----------------------------------
  function openAuthModal(mode) {
    document.getElementById('authTitle').textContent = mode;
    DOM.authModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
  function closeAuthModal() {
    DOM.authModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  DOM.signInBtn.addEventListener('click', () => openAuthModal('Sign Up'));
  DOM.logInBtn.addEventListener('click', () => openAuthModal('Log In'));
  DOM.closeAuthModal.addEventListener('click', closeAuthModal);
  DOM.registerBtn.addEventListener('click', () => {
    const email = DOM.authEmail.value.trim();
    const password = DOM.authPassword.value;
    if (!email || !password) { alert('Please enter both email and password.'); return; }
    if (localStorage.getItem('authUser')) { alert('User already registered. Please log in.'); return; }
    const userData = { email, password };
    localStorage.setItem('authUser', JSON.stringify(userData));
    alert('Registration successful! You are now signed in as ' + email);
    closeAuthModal();
    updateAuthUI();
  });
  DOM.manualLogInBtn.addEventListener('click', () => {
    const email = DOM.authEmail.value.trim();
    const password = DOM.authPassword.value;
    if (!email || !password) { alert('Please enter both email and password.'); return; }
    const storedData = JSON.parse(localStorage.getItem('authUser') || '{}');
    if (storedData.email === email && storedData.password === password) {
      alert('Login successful! Welcome back, ' + email);
      closeAuthModal();
      updateAuthUI();
    } else { alert('Invalid credentials. Please try again.'); }
  });
  function updateAuthUI() {
    const storedData = JSON.parse(localStorage.getItem('authUser') || '{}');
    if (storedData.email) {
      DOM.signInBtn.textContent = storedData.email;
      DOM.logInBtn.style.display = 'none';
    } else {
      DOM.signInBtn.textContent = 'Sign Up';
      DOM.logInBtn.style.display = 'inline-block';
    }
  }
  updateAuthUI();

  // -----------------------------------
  // Initialization
  // -----------------------------------
  initLeaderboard(animeData);
  renderAnimeGrid(animeData);
  startSlider();
  checkWeeklyReset();

  // -----------------------------------
  // Leaderboard & Ranking
  // -----------------------------------
  function initLeaderboard(animeList) {
    const sorted = [...animeList].sort((a, b) => b.coins - a.coins);
    rankMapping = {};
    sorted.slice(0, 10).forEach((anime, i) => {
      rankMapping[anime.title.toLowerCase().trim()] = i + 1;
    });
  }

  // -----------------------------------
  // Render Anime Grid
  // -----------------------------------
  function renderAnimeGrid(data) {
    data.sort((a, b) => b.coins - a.coins);
    DOM.animeGrid.innerHTML = '';
    data.forEach(anime => {
      const rank = rankMapping[anime.title.toLowerCase().trim()] || '';
      const rankingBadge = rank ? `<div class="ranking-badge">${rank}</div>` : '';
      const coinBadge = `<div class="coin-badge" title="Coins determine your rank & can earn you gifts!">${anime.coins} <span>🪙</span></div>`;
      const card = document.createElement('div');
      card.className = 'anime-card';
      card.innerHTML = `
        ${rankingBadge}
        ${coinBadge}
        <img src="${anime.image}" alt="${anime.title}" class="anime-poster" loading="lazy">
        <div class="card-content">
          <h4>${anime.title}</h4>
          <p>${anime.category}</p>
          <button class="cta watch-btn">Watch Now</button>
        </div>
      `;
      DOM.animeGrid.appendChild(card);
    });
  }

  // -----------------------------------
  // Hero Slider
  // -----------------------------------
  let currentSlide = 0;
  function startSlider() {
    const slides = document.querySelectorAll('.slide');
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 5000);
  }

  // -----------------------------------
  // Search Functionality
  // -----------------------------------
  DOM.searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = animeData.filter(anime =>
      anime.title.toLowerCase().includes(query) ||
      anime.category.toLowerCase().includes(query)
    );
    renderAnimeGrid(filtered);
  });

  // -----------------------------------
  // Coin System (user-specific)
  // -----------------------------------
  function getCoinKey() {
    const storedData = JSON.parse(localStorage.getItem('authUser') || '{}');
    return storedData.email ? `userCoins_${storedData.email}` : 'userCoins';
  }
  let userCoins = parseInt(localStorage.getItem(getCoinKey())) || 0;
  DOM.coinDisplay.textContent = `🪙 ${userCoins}`;
  function addCoin() {
    userCoins++;
    DOM.coinDisplay.textContent = `🪙 ${userCoins}`;
    localStorage.setItem(getCoinKey(), userCoins);
  }
  document.addEventListener('click', () => { if (Math.random() > 0.8) addCoin(); });
  function checkWeeklyReset() {
    const lastReset = localStorage.getItem('lastReset');
    const now = new Date();
    if (!lastReset || now - new Date(lastReset) > 604800000) {
      localStorage.setItem('lastReset', now);
      localStorage.setItem(getCoinKey(), 0);
      userCoins = 0;
      DOM.coinDisplay.textContent = `🪙 ${userCoins}`;
    }
  }

  // -----------------------------------
  // Video Modal Functions
  // -----------------------------------
  function openVideoModal(title) {
    DOM.videoModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    document.getElementById('animeTitle').textContent = title;
  }
  function closeModalAndCleanup() {
    DOM.videoModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    DOM.videoPlayer.src = '';
    DOM.videoContainer.style.display = 'block';
    DOM.episodeSelect.style.display = 'inline-block';
    stopCoinTracking();
  }
  function startCoinTracking() {
    let coinsEarned = 0;
    document.getElementById('earnedCoins').textContent = coinsEarned;
    const checkpoints = [443, 843];
    let fakeTime = 0;
    coinTrackingInterval = setInterval(() => {
      fakeTime++;
      checkpoints.forEach(time => {
        if (Math.abs(fakeTime - time) < 2) {
          coinsEarned++;
          document.getElementById('earnedCoins').textContent = coinsEarned;
          addCoin();
        }
      });
    }, 1000);
  }
  function stopCoinTracking() {
    clearInterval(coinTrackingInterval);
  }
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('watch-btn')) return;
    const sliderParent = e.target.closest('.slide');
    if (sliderParent) {
      document.querySelector('.anime-grid').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const animeCard = e.target.closest('.anime-card');
    if (!animeCard) return;
    const titleText = animeCard.querySelector('h4').textContent;
    const chosenAnime = animeData.find(a => a.title.toLowerCase().trim() === titleText.toLowerCase().trim());
    if (!chosenAnime) return;
    if (chosenAnime.title.toLowerCase() === 'another') {
      const a = document.createElement('a');
      a.href = anotherDriveLink;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    openVideoModal(chosenAnime.title);
    DOM.loader.style.display = 'flex';
    DOM.loaderMessage.textContent = '';
    const loaderFallback = setTimeout(() => { DOM.loader.style.display = 'none'; }, 10000);
    DOM.videoPlayer.onload = () => { DOM.loader.style.display = 'none'; clearTimeout(loaderFallback); };
    DOM.videoContainer.style.display = 'block';
    DOM.episodeSelect.style.display = 'inline-block';
    DOM.episodeSelect.innerHTML = `<option value="hindi">Hindi Dub</option><option value="japanese">Japanese Dub</option>`;
    DOM.videoPlayer.src = chosenAnime.externalUrl || 'https://anime-world.co/series/solo-leveling/';
    if (adsBlocked) { DOM.videoPlayer.setAttribute('sandbox', 'allow-scripts allow-same-origin'); }
    else { DOM.videoPlayer.removeAttribute('sandbox'); }
    startCoinTracking();
  });
  DOM.backBtn.addEventListener('click', closeModalAndCleanup);
  document.querySelector('.video-close').addEventListener('click', closeModalAndCleanup);
  DOM.adsToggleBtn.addEventListener('click', () => {
    adsBlocked = !adsBlocked;
    DOM.adsToggleBtn.textContent = adsBlocked ? 'Ads: Blocked' : 'Ads: Unblocked';
    if (adsBlocked) { DOM.videoPlayer.setAttribute('sandbox', 'allow-scripts allow-same-origin'); }
    else { DOM.videoPlayer.removeAttribute('sandbox'); }
  });

  // -----------------------------------
  // Partner Modal Handler
  // -----------------------------------
  function openPlatformModal(url, title) {
    DOM.platformModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    DOM.platformTitle.textContent = title;
    DOM.platformFallbackContainer.style.display = 'none';
    DOM.platformLoader.style.display = 'flex';
    DOM.platformLoaderMessage.textContent = 'Loading platform...';
    DOM.platformFrame.src = url;
    const domainCheck = url.includes('anime-world.co') || url.includes('animedekho.net');
    let fallbackTimeout;
    if (domainCheck) {
      fallbackTimeout = setTimeout(() => { DOM.platformLoader.style.display = 'none'; DOM.platformFallbackContainer.style.display = 'block'; }, 2000);
    } else {
      fallbackTimeout = setTimeout(() => { DOM.platformLoader.style.display = 'none'; DOM.platformFallbackContainer.style.display = 'block'; }, 8000);
    }
    DOM.platformFrame.onload = () => {
      if (!domainCheck) { clearTimeout(fallbackTimeout); DOM.platformLoader.style.display = 'none'; DOM.platformFallbackContainer.style.display = 'none'; }
    };
    DOM.platformFrame.onerror = () => { clearTimeout(fallbackTimeout); DOM.platformLoader.style.display = 'none'; DOM.platformFallbackContainer.style.display = 'block'; };
    DOM.openExternallyBtn.onclick = () => { window.open(url, '_blank', 'noopener noreferrer'); };
  }
  DOM.closePlatformModal.addEventListener('click', () => {
    DOM.platformModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    DOM.platformFrame.src = '';
  });
  const partnerLinks = document.querySelectorAll('.platform-link');
  partnerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const url = link.getAttribute('data-platform-url');
      const title = link.querySelector('img').getAttribute('alt');
      openPlatformModal(url, title);
    });
  });

  // -----------------------------------
  // Miyu Chat Integration (Pre-programmed Responses)
  // -----------------------------------
  let dragging = false, hasDragged = false, startX = 0, startY = 0, offsetX = 0, offsetY = 0;
  DOM.miyuChatContainer.style.touchAction = 'none';
  DOM.miyuIcon.addEventListener('click', () => {
    if (!hasDragged) { DOM.miyuPhoneFrame.classList.toggle('hidden'); }
    hasDragged = false;
  });
  DOM.miyuClose.addEventListener('click', () => { DOM.miyuPhoneFrame.classList.add('hidden'); });

  // Pre-programmed otaku-themed responses for Miyu
  async function callAdvancedLLM(prompt) {
    const enhancedPrompt = `You are Miyu, a super otaku anime fan girl! Answer in your unique otaku style with 25 words or fewer: ${prompt}`;
    // List of pre-programmed otaku responses
    const otakuMessages = [
       "Sugoi! That's the best idea ever, senpai!",
       "Onii-chan, your query gives me sparkles of joy!",
       "Kawaii desu~! Your question totally vibes with my otaku spirit!",
       "Ganbatte! Let's dive into this anime adventure together!",
       "Baka! Just kidding—your request is epic, like a true anime hero!"
    ];
    const randomIndex = Math.floor(Math.random() * otakuMessages.length);
    return otakuMessages[randomIndex];
  }
  async function generateMiyuReply(input) {
    return await callAdvancedLLM(input);
  }
  async function sendMessage() {
    const message = DOM.miyuText.value.trim();
    if (!message) return;
    const userBubble = document.createElement('div');
    userBubble.classList.add('chat-bubble', 'user-bubble');
    userBubble.textContent = message;
    DOM.miyuMessages.appendChild(userBubble);
    DOM.miyuText.value = '';
    DOM.miyuMessages.scrollTop = DOM.miyuMessages.scrollHeight;
    const reply = await generateMiyuReply(message);
    setTimeout(() => {
      const botBubble = document.createElement('div');
      botBubble.classList.add('chat-bubble', 'bot-bubble');
      botBubble.textContent = reply;
      DOM.miyuMessages.appendChild(botBubble);
      DOM.miyuMessages.scrollTop = DOM.miyuMessages.scrollHeight;
    }, 800);
  }
  DOM.miyuSend.addEventListener('click', sendMessage);
  DOM.miyuText.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } });

  // -----------------------------------
  // Draggable Chat Container
  // -----------------------------------
  DOM.miyuChatContainer.addEventListener('mousedown', (e) => {
    if (e.target === DOM.miyuText || e.target === DOM.miyuSend || e.target === DOM.miyuClose) return;
    dragging = true;
    hasDragged = false;
    startX = e.clientX;
    startY = e.clientY;
    const rect = DOM.miyuChatContainer.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    DOM.miyuChatContainer.classList.add('dragging');
  });
  document.addEventListener('mousemove', (e) => {
    if (dragging) {
      if (!hasDragged && (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5)) { hasDragged = true; }
      DOM.miyuChatContainer.style.left = (e.clientX - offsetX) + 'px';
      DOM.miyuChatContainer.style.top = (e.clientY - offsetY) + 'px';
      DOM.miyuChatContainer.style.position = 'fixed';
    }
  });
  document.addEventListener('mouseup', () => { dragging = false; DOM.miyuChatContainer.classList.remove('dragging'); });
});
