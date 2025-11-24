// Slideshow functionality
let currentSlideIndex = 0;
let slideInterval;
const slideDuration = 5000; // 5 giây mỗi ảnh
let originalMusicVolume = 0.7;
let videoSlideTimer = null;

// Theme colors cho background
const themes = {
    'purple': ['#667eea', '#764ba2', '#8e44ad', '#9b59b6'],
    'blue': ['#2193b0', '#6dd5ed', '#1e3c72', '#2a5298'],
    'pink': ['#ee0979', '#ff6a00', '#ff0844', '#ffb199'],
    'orange': ['#f12711', '#f5af19', '#ff6b6b', '#feca57'],
    'green': ['#11998e', '#38ef7d', '#00b894', '#00cec9'],
    'cyan': ['#00d2ff', '#3a7bd5', '#4facfe', '#00f2fe'],
    'red': ['#eb3349', '#f45c43', '#c0392b', '#e74c3c'],
    'gold': ['#f7971e', '#ffd200', '#f39c12', '#f1c40f']
};

function changeBackgroundTheme(theme) {
    const bg = document.getElementById('bgAnimation');
    bg.className = 'bg-animation theme-' + theme;
}

function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (index >= slides.length) currentSlideIndex = 0;
    if (index < 0) currentSlideIndex = slides.length - 1;
    
    // Clear video timer nếu có
    if (videoSlideTimer) {
        clearTimeout(videoSlideTimer);
        videoSlideTimer = null;
    }
    
    // Pause tất cả videos
    document.querySelectorAll('.slide-video').forEach(video => {
        video.pause();
        video.currentTime = 0;
    });
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    const currentSlide = slides[currentSlideIndex];
    currentSlide.classList.add('active');
    dots[currentSlideIndex].classList.add('active');
    
    // Thay đổi background theo theme của slide
    const theme = currentSlide.getAttribute('data-theme');
    changeBackgroundTheme(theme);
    
    // Kiểm tra nếu slide có video
    const video = currentSlide.querySelector('.slide-video');
    if (video) {
        handleVideoSlide(video);
    } else {
        // Tăng nhạc nền lại nếu không phải video slide
        restoreMusicVolume();
        // Reset interval cho ảnh thường
        resetSlideInterval();
    }
    
    // Reset progress bar
    resetProgressBar();
}

function handleVideoSlide(video) {
    // Xóa tất cả event listeners cũ
    const newVideo = video.cloneNode(true);
    video.parentNode.replaceChild(newVideo, video);
    
    // Giảm âm lượng nhạc nền
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = 0.2;
    
    // Tự động phát video
    const playPromise = newVideo.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('Video đang phát');
            
            // Dừng auto slide cho đến khi video kết thúc
            clearInterval(slideInterval);
            
            // Set timer dựa trên độ dài video
            newVideo.addEventListener('loadedmetadata', () => {
                const videoDuration = newVideo.duration * 1000; // convert sang milliseconds
                console.log('Video duration:', videoDuration);
                
                videoSlideTimer = setTimeout(() => {
                    currentSlideIndex++;
                    showSlide(currentSlideIndex);
                }, videoDuration);
            });
            
            // Xử lý khi video kết thúc
            newVideo.addEventListener('ended', () => {
                restoreMusicVolume();
                setTimeout(() => {
                    currentSlideIndex++;
                    showSlide(currentSlideIndex);
                }, 500);
            });
            
        }).catch(err => {
            console.log('Không thể tự động phát video:', err);
            // Nếu không tự động phát được, cho phép user click
            restoreMusicVolume();
            resetSlideInterval();
        });
    }
    
    // Xử lý khi user pause video
    newVideo.addEventListener('pause', () => {
        if (newVideo.currentTime < newVideo.duration) {
            restoreMusicVolume();
        }
    });
    
    // Xử lý khi user play lại video
    newVideo.addEventListener('play', () => {
        const bgMusic = document.getElementById('bgMusic');
        bgMusic.volume = 0.2;
    });
}

function restoreMusicVolume() {
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = originalMusicVolume;
}

function changeSlide(direction) {
    currentSlideIndex += direction;
    showSlide(currentSlideIndex);
}

function currentSlide(index) {
    currentSlideIndex = index;
    showSlide(currentSlideIndex);
}

function autoSlide() {
    currentSlideIndex++;
    showSlide(currentSlideIndex);
}

function resetSlideInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(autoSlide, slideDuration);
}

function resetProgressBar() {
    const progressBar = document.getElementById('progressBar');
    progressBar.style.animation = 'none';
    setTimeout(() => {
        progressBar.style.animation = `progressAnimation ${slideDuration}ms linear`;
    }, 10);
}

// Music Control
const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');
const musicText = document.querySelector('.music-text');
let isPlaying = false;

bgMusic.volume = originalMusicVolume;

musicBtn.addEventListener('click', () => {
    if (isPlaying) {
        bgMusic.pause();
        musicBtn.classList.remove('playing');
        musicText.textContent = 'Phát nhạc';
        isPlaying = false;
    } else {
        bgMusic.play().catch(err => {
            console.log('Không thể phát nhạc:', err);
            alert('Vui lòng click vào trang web trước, sau đó nhấn nút Phát nhạc lại!');
        });
        musicBtn.classList.add('playing');
        musicText.textContent = 'Đang phát';
        isPlaying = true;
    }
});

// Auto start music khi user tương tác với trang
document.addEventListener('click', () => {
    if (!isPlaying) {
        bgMusic.play().then(() => {
            isPlaying = true;
            musicBtn.classList.add('playing');
            musicText.textContent = 'Đang phát';
        }).catch(() => {
            // Không làm gì nếu không phát được
        });
    }
}, { once: true });

// Start slideshow khi trang load
window.addEventListener('load', () => {
    showSlide(0); // Bắt đầu từ slide 0 (video)
});

// Generate floating particles
const particlesContainer = document.getElementById('particles');
for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (10 + Math.random() * 10) + 's';
    particlesContainer.appendChild(particle);
}

// Generate floating hearts
const heartsContainer = document.getElementById('hearts');
setInterval(() => {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = ['❤️', '💕', '💖', '💗', '💝', '💓'][Math.floor(Math.random() * 6)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.animationDuration = (8 + Math.random() * 4) + 's';
    heartsContainer.appendChild(heart);
    
    setTimeout(() => heart.remove(), 12000);
}, 2000);

// Smooth scroll reveal
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.content-box').forEach(box => {
    observer.observe(box);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    } else if (e.key === ' ') {
        e.preventDefault();
        musicBtn.click();
    }
});