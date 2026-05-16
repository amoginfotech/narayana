// State Management
let allSongs = [];
let filteredSongs = [];
let currentPage = 1;
const songsPerPage = 12;
let currentSongIndex = -1;

// DOM Elements
const songList = document.getElementById('songList');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const player = document.getElementById('player');
const playerTitle = document.getElementById('playerTitle');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const seekBar = document.getElementById('seekBar');
const volumeBar = document.getElementById('volumeBar');
const currentTimeSpan = document.getElementById('currentTime');
const totalTimeSpan = document.getElementById('totalTime');
const audioElement = document.getElementById('audioElement');
const playAllBtn = document.getElementById('playAllBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const closePlayerBtn = document.getElementById('closePlayer');

// Initialize
async function init() {
    try {
        const response = await fetch('songs.json');
        allSongs = await response.json();
        filteredSongs = [...allSongs];
        
        loadState();
        renderSongs();
        setupEventListeners();
    } catch (error) {
        console.error('Error loading songs:', error);
        songList.innerHTML = '<div class="loading">Error loading collection. Please try again.</div>';
    }
}

function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    playPauseBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    seekBar.addEventListener('input', handleSeek);
    volumeBar.addEventListener('input', handleVolume);
    playAllBtn.addEventListener('click', playAll);
    shuffleBtn.addEventListener('click', shufflePlay);
    closePlayerBtn.addEventListener('click', closePlayer);

    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', playNext);
    audioElement.addEventListener('play', () => {
        playPauseBtn.textContent = '⏸';
        updateMediaMetadata();
    });
    audioElement.addEventListener('pause', () => {
        playPauseBtn.textContent = '▶';
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        if (e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        }
    });
}

// Rendering
function renderSongs() {
    const start = (currentPage - 1) * songsPerPage;
    const end = start + songsPerPage;
    const pageSongs = filteredSongs.slice(start, end);

    songList.innerHTML = pageSongs.map((song, index) => `
        <div class="song-card ${currentSongIndex !== -1 && allSongs[currentSongIndex].id === song.id ? 'active' : ''}" 
             onclick="playSongById(${song.id})">
            <div class="song-card-info">
                <div class="song-card-title">${song.title}</div>
                <div class="song-card-duration" id="duration-${song.id}">${song.duration || '...'}</div>
            </div>
            <div class="play-indicator">▶</div>
        </div>
    `).join('');

    // Fetch durations for songs on this page if they don't have them
    pageSongs.forEach(song => {
        if (!song.duration) {
            fetchDuration(song);
        }
    });

    renderPagination();
}

function fetchDuration(song) {
    const audio = new Audio();
    audio.src = song.file;
    audio.preload = 'metadata';
    
    audio.addEventListener('loadedmetadata', () => {
        const duration = formatTime(audio.duration);
        song.duration = duration;
        const durationEl = document.getElementById(`duration-${song.id}`);
        if (durationEl) {
            durationEl.textContent = duration;
        }
        // Save to temporary memory to avoid re-fetching while browsing
    });

    audio.addEventListener('error', () => {
        const durationEl = document.getElementById(`duration-${song.id}`);
        if (durationEl) {
            durationEl.textContent = 'Error';
        }
    });
}

function renderPagination() {
    const totalPages = Math.ceil(filteredSongs.length / songsPerPage);
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    pagination.innerHTML = html;
}

// Playback Logic
function playSongById(id) {
    const index = allSongs.findIndex(s => s.id === id);
    if (index === -1) return;

    if (currentSongIndex === index) {
        togglePlay();
        return;
    }

    currentSongIndex = index;
    const song = allSongs[currentSongIndex];
    
    audioElement.src = song.file;
    playerTitle.textContent = song.title;
    player.classList.remove('hidden');
    
    audioElement.play();
    renderSongs();
    saveState();
}

function togglePlay() {
    if (audioElement.paused) {
        audioElement.play();
    } else {
        audioElement.pause();
    }
}

function playNext() {
    if (currentSongIndex < allSongs.length - 1) {
        playSongById(allSongs[currentSongIndex + 1].id);
    }
}

function playPrevious() {
    if (currentSongIndex > 0) {
        playSongById(allSongs[currentSongIndex - 1].id);
    }
}

function playAll() {
    if (filteredSongs.length > 0) {
        playSongById(filteredSongs[0].id);
    }
}

function shufflePlay() {
    if (allSongs.length > 0) {
        const randomIndex = Math.floor(Math.random() * allSongs.length);
        playSongById(allSongs[randomIndex].id);
    }
}

// Controls
function handleSearch(e) {
    const term = e.target.value.toLowerCase();
    filteredSongs = allSongs.filter(s => s.title.toLowerCase().includes(term));
    currentPage = 1;
    renderSongs();
}

function handleSeek(e) {
    const time = (e.target.value / 100) * audioElement.duration;
    audioElement.currentTime = time;
}

function handleVolume(e) {
    const vol = e.target.value / 100;
    audioElement.volume = vol;
    saveState();
}

function updateProgress() {
    if (!audioElement.duration) return;
    
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    seekBar.value = progress;
    
    currentTimeSpan.textContent = formatTime(audioElement.currentTime);
    totalTimeSpan.textContent = formatTime(audioElement.duration);
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

function goToPage(page) {
    currentPage = page;
    renderSongs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closePlayer() {
    audioElement.pause();
    player.classList.add('hidden');
    currentSongIndex = -1;
    renderSongs();
}

// State Persistence
function saveState() {
    const state = {
        volume: volumeBar.value,
        lastSongId: currentSongIndex !== -1 ? allSongs[currentSongIndex].id : null
    };
    localStorage.setItem('narayana_player_state', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('narayana_player_state');
    if (saved) {
        const state = JSON.parse(saved);
        volumeBar.value = state.volume || 80;
        audioElement.volume = volumeBar.value / 100;
        
        // Don't auto-play, but prepare the player if there was a last song
        if (state.lastSongId) {
            const index = allSongs.findIndex(s => s.id === state.lastSongId);
            if (index !== -1) {
                currentSongIndex = index;
                playerTitle.textContent = allSongs[index].title;
                audioElement.src = allSongs[index].file;
                player.classList.remove('hidden');
            }
        }
    }
}

// Media Session API (OS Controls)
function updateMediaMetadata() {
    if ('mediaSession' in navigator && currentSongIndex !== -1) {
        const song = allSongs[currentSongIndex];
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: 'OM Namo Narayanaya',
            album: 'Personal Collection',
            artwork: [
                { src: 'images/narayana.jpg', sizes: '512x512', type: 'image/jpeg' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', () => audioElement.play());
        navigator.mediaSession.setActionHandler('pause', () => audioElement.pause());
        navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
        navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
}

// Start
init();
