// Sample song data - Replace with your actual songs
const allSongs = [
    { id: 1, title: "Namo Venkatesa Ghantasala collection", file: "songs/Namo Venkatesa Ghantasala collection.mp3" },
    { id: 2, title: "Namo Venkatesa", file: "songs/Namo Venkatesa.mp3" },
    { id: 3, title: "Narayana Nee Naamame", file: "songs/Narayana Nee Naamame.mp3" },
    { id: 4, title: "ghantasala bhakti geetalu 1 to 20", file: "songs/ghantasala bhakti geetalu 1 to 20.mp3" },
    { id: 5, title: "Adivo Alladivo", file: "songs/Adivo Alladivo.mp3" },
    { id: 6, title: "Atharva Veda_health prosper", file: "songs/Atharva Veda_health prosper.mp3" },
    { id: 7, title: "Enni Janmala Punyamo", file: "songs/Enni Janmala Punyamo.mp3" },
    { id: 8, title: "GHANTASALA---NEE KONDAKU NEEVE--- RARE SONG", file: "songs/GHANTASALA---NEE KONDAKU NEEVE--- RARE SONG.mp3" },
    { id: 9, title: "Govinda Namalu ttd", file: "songs/Govinda Namalu ttd.mp3" },
    { id: 10, title: "Hare Krishna ISKCON Original Maha Mantra", file: "songs/Hare Krishna ISKCON Original Maha Mantra.mp3" },
    { id: 11, title: "Maha Lakshmi Ashtakam", file: "songs/Maha Lakshmi Ashtakam.mp3" },
    { id: 12, title: "Mahalakshmi Mantra 108 times", file: "songs/Mahalakshmi Mantra 108 times.mp3" },
    { id: 13, title: "Om Namo Venkatesaya 108 Times", file: "songs/Om Namo Venkatesaya 108 Times.mp3" },
    { id: 14, title: "Sri Mahalakshmi Astakam Telugu", file: "songs/Sri Mahalakshmi Astakam Telugu.mp3" },
    { id: 15, title: "Vedamule Nee Nivaasamata-narasimha", file: "songs/Vedamule Nee Nivaasamata-narasimha.mp3" },
     { id: 11, title: "Kubera Ashtalakshmi Mantra_108 Times Chanting", file: "songs/Kubera Ashtalakshmi Mantra_108 Times Chanting.mp3" }
];

let filteredSongs = [...allSongs];
let currentPage = 1;
const songsPerPage = 10;
let currentAudio = null;
let currentSongId = null;

// --- Advanced Audio Player Controls ---
let isPlaying = false;
let seekBar = null;
let currentTimeSpan = null;
let totalTimeSpan = null;
let playPauseBtn = null;
let prevBtn = null;
let nextBtn = null;
let rewindBtn = null;
let forwardBtn = null;

function displaySongs() {
    const startIndex = (currentPage - 1) * songsPerPage;
    const endIndex = startIndex + songsPerPage;
    const songsToShow = filteredSongs.slice(startIndex, endIndex);

    const songList = document.getElementById('songList');
    songList.innerHTML = '';

    songsToShow.forEach(song => {
        const songItem = document.createElement('div');
        songItem.className = `song-item ${currentSongId === song.id ? 'current-playing' : ''}`;
        songItem.innerHTML = `
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-duration">${song.duration || '...'}</div>
            </div>
            <button class="play-btn" onclick="playSong(${song.id}, '${song.file}', '${song.title}')">
                ${currentSongId === song.id ? '⏸️' : '▶️'}
            </button>
        `;
        songList.appendChild(songItem);
    });

    displayPagination();
}

function displayPagination() {
    const totalPages = Math.ceil(filteredSongs.length / songsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => goToPage(i);
        pagination.appendChild(pageBtn);
    }
}

function goToPage(page) {
    currentPage = page;
    displaySongs();
}

function searchSongs() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    filteredSongs = allSongs.filter(song => 
        song.title.toLowerCase().includes(query)
    );
    currentPage = 1;
    displaySongs();
}

function playSong(id, file, title) {
    const audioPlayer = document.getElementById('audioPlayer');
    const audioElement = document.getElementById('audioElement');
    const nowPlaying = document.getElementById('nowPlaying');

    if (currentSongId === id && currentAudio && !currentAudio.paused) {
        // Pause current song
        currentAudio.pause();
        currentSongId = null;
        audioPlayer.style.display = 'none';
    } else {
        // Play new song
        if (currentAudio) {
            currentAudio.pause();
        }

        audioElement.src = file;
        audioElement.load();
        audioElement.play();

        currentAudio = audioElement;
        currentSongId = id;
        nowPlaying.textContent = `🎵 ${title}`;
        audioPlayer.style.display = 'block';
    }

    displaySongs();
}

function playAll() {
    if (filteredSongs.length > 0) {
        const firstSong = filteredSongs[0];
        playSong(firstSong.id, firstSong.file, firstSong.title);
    }
}

function stopAll() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentSongId = null;
        document.getElementById('audioPlayer').style.display = 'none';
        displaySongs();
    }
}

function shufflePlay() {
    if (filteredSongs.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredSongs.length);
        const randomSong = filteredSongs[randomIndex];
        playSong(randomSong.id, randomSong.file, randomSong.title);
    }
}

function closePlayer() {
    document.getElementById('audioPlayer').style.display = 'none';
    if (currentAudio) {
        currentAudio.pause();
        currentSongId = null;
        displaySongs();
    }
}

// Auto-play next song when current ends
document.getElementById('audioElement').addEventListener('ended', function() {
    const currentIndex = filteredSongs.findIndex(song => song.id === currentSongId);
    if (currentIndex < filteredSongs.length - 1) {
        const nextSong = filteredSongs[currentIndex + 1];
        playSong(nextSong.id, nextSong.file, nextSong.title);
    } else {
        stopAll();
    }
});

// --- Advanced Audio Player Controls ---
function setupAdvancedPlayer() {
    seekBar = document.getElementById('seekBar');
    currentTimeSpan = document.getElementById('currentTime');
    totalTimeSpan = document.getElementById('totalTime');
    playPauseBtn = document.getElementById('playPauseBtn');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    rewindBtn = document.getElementById('rewindBtn');
    forwardBtn = document.getElementById('forwardBtn');
    const audioElement = document.getElementById('audioElement');

    // Play/Pause toggle
    playPauseBtn.onclick = function() {
        if (audioElement.paused) {
            audioElement.play();
        } else {
            audioElement.pause();
        }
    };
    audioElement.onplay = function() {
        playPauseBtn.textContent = '⏸️';
        isPlaying = true;
    };
    audioElement.onpause = function() {
        playPauseBtn.textContent = '▶️';
        isPlaying = false;
    };

    // Seek bar
    audioElement.addEventListener('timeupdate', function() {
        if (audioElement.duration) {
            seekBar.value = (audioElement.currentTime / audioElement.duration) * 100;
            currentTimeSpan.textContent = formatTime(audioElement.currentTime);
            totalTimeSpan.textContent = formatTime(audioElement.duration);
        }
    });
    seekBar.addEventListener('input', function() {
        if (audioElement.duration) {
            audioElement.currentTime = (seekBar.value / 100) * audioElement.duration;
        }
    });

    // Forward/Rewind
    rewindBtn.onclick = function() {
        if (!isNaN(audioElement.duration) && audioElement.duration > 0) {
            audioElement.currentTime = Math.max(0, audioElement.currentTime - 10);
        }
    };
    forwardBtn.onclick = function() {
        if (!isNaN(audioElement.duration) && audioElement.duration > 0) {
            audioElement.currentTime = Math.min(audioElement.duration, audioElement.currentTime + 10);
        }
    };

    // Previous/Next
    prevBtn.onclick = function() {
        playPrevSong();
    };
    nextBtn.onclick = function() {
        playNextSong();
    };
}

function formatTime(sec) {
    sec = Math.floor(sec);
    const min = Math.floor(sec / 60);
    const s = (sec % 60).toString().padStart(2, '0');
    return `${min}:${s}`;
}

function playNextSong() {
    const currentIndex = filteredSongs.findIndex(song => song.id === currentSongId);
    if (currentIndex < filteredSongs.length - 1) {
        const nextSong = filteredSongs[currentIndex + 1];
        playSong(nextSong.id, nextSong.file, nextSong.title);
    }
}

function playPrevSong() {
    const currentIndex = filteredSongs.findIndex(song => song.id === currentSongId);
    if (currentIndex > 0) {
        const prevSong = filteredSongs[currentIndex - 1];
        playSong(prevSong.id, prevSong.file, prevSong.title);
    }
}

// Initialize the page
displaySongs();

// Call setup after DOM is ready
window.addEventListener('DOMContentLoaded', setupAdvancedPlayer);

// Make allSongs and displaySongs globally accessible
window.allSongs = allSongs;
window.displaySongs = displaySongs;
