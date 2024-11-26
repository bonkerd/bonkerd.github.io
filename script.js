// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add intersection observer for scroll animations
const cards = document.querySelectorAll('.card');
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    observer.observe(card);
});

// Add hover effect for cards
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// Tooltip functionality
document.addEventListener('DOMContentLoaded', () => {
    const tooltipContainer = document.querySelector('.tooltip-container');
    const tooltip = document.querySelector('.tooltip');
    let timeoutId;

    tooltipContainer.addEventListener('click', (e) => {
        tooltip.classList.add('show');
        
        // Hide tooltip after 2 seconds
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            tooltip.classList.remove('show');
        }, 2000);
    });

    // Hide tooltip when clicking anywhere else
    document.addEventListener('click', (e) => {
        if (!tooltipContainer.contains(e.target)) {
            tooltip.classList.remove('show');
        }
    });
});

// Music player functionality
document.addEventListener('DOMContentLoaded', () => {
    const musicToggle = document.getElementById('music-toggle');
    const musicIcon = musicToggle.querySelector('i');
    const volumeContainer = document.querySelector('.volume-container');
    const volumeSlider = document.getElementById('volume-slider');
    const audio = new Audio('song.mp3');
    
    // Add ended event listener to reset the button
    audio.addEventListener('ended', () => {
        musicToggle.classList.remove('playing');
        musicIcon.classList.remove('fa-pause');
        musicIcon.classList.add('fa-play');
        volumeContainer.classList.remove('show');
    });

    // Volume slider functionality
    volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        audio.volume = value / 100;
        // Update the gradient to match the volume level
        volumeSlider.style.background = `linear-gradient(to right, var(--primary) ${value}%, var(--surface) ${value}%)`;
    });

    musicToggle.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            musicToggle.classList.add('playing');
            musicIcon.classList.remove('fa-play');
            musicIcon.classList.add('fa-pause');
            volumeContainer.classList.add('show');
        } else {
            audio.pause();
            musicToggle.classList.remove('playing');
            musicIcon.classList.remove('fa-pause');
            musicIcon.classList.add('fa-play');
            volumeContainer.classList.remove('show');
        }
    });
});

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme === 'light');

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme === 'light');
    });

    function updateThemeIcon(isLight) {
        themeIcon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    }
});
