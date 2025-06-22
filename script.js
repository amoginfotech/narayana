// Sample song data - Replace with your actual songs
const allSongs = [
    { id: 1, title: "GANTASALA ALL TIME HITS _ NAMO VENKATESHA _ LORD VENKATESHWARA SWAMY HITS _ LORD BALAJI SONGS", file: "songs/GANTASALA ALL TIME HITS _ NAMO VENKATESHA _ LORD VENKATESHWARA SWAMY HITS _ LORD BALAJI SONGS.mp3", duration: "3:45" },
    { id: 2, title: "Community Namo Venkatesa Ghantasala", file: "songs/Namo Venkatesa Ghantasala.mp3", duration: "4:12" },
    { id: 3, title: "Namo Venkatesa", file: "songs/Namo Venkatesa.mp3", duration: "3:28" },
    { id: 4, title: "Narayana Nee Naamame", file: "songs/Narayana Nee Naamame.mp3", duration: "5:03" },
    { id: 5, title: "Venkateswara Songs - Namo Venkatesa", file: "songs/Venkateswara Songs - Namo Venkatesa.mp3", duration: "4:35" },
    { id: 6, title: "Change the World", file: "songs/song6.mp3", duration: "3:52" },
    { id: 7, title: "Better Tomorrow", file: "songs/song7.mp3", duration: "4:18" },
    { id: 8, title: "Helping Hands", file: "songs/song8.mp3", duration: "3:33" },
    { id: 9, title: "Love and Kindness", file: "songs/song9.mp3", duration: "4:07" },
    { id: 10, title: "Strength Together", file: "songs/song10.mp3", duration: "3:59" },
    { id: 11, title: "New Beginnings", file: "songs/song11.mp3", duration: "4:24" },
    { id: 12, title: "Bright Future", file: "songs/song12.mp3", duration: "3:41" }
];

let filteredSongs = [...allSongs];
let currentPage = 1;
const songsPerPage = 10;
let currentAudio = null;
let currentSongId = null;

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
                <div class="song-duration">${song.duration}</div>
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

// Initialize the page
displaySongs();
