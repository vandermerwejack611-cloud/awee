// =============================================
// HERO SLIDER (PROGRESS AWARE)
// =============================================
const heroSlides = document.querySelectorAll('.hero-slide');
const heroTabs = document.querySelectorAll('.hero-tab');
const heroProgressBars = document.querySelectorAll('.tab-progress');
let currentHeroSlide = 0;
let slideInterval = null;
let progressInterval = null;
let heroStartTime = 0;
const DEFAULT_DURATION = 6000;

function startHeroSlider() {
    stopHeroSlider();
    showHeroSlide(0);
}

function stopHeroSlider() {
    if (slideInterval) clearInterval(slideInterval);
    if (progressInterval) clearInterval(progressInterval);
    slideInterval = null;
    progressInterval = null;
}

function updateHeroProgress(duration) {
    if (progressInterval) clearInterval(progressInterval);
    heroStartTime = Date.now();
    progressInterval = setInterval(() => {
        const elapsed = Date.now() - heroStartTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        if (heroProgressBars[currentHeroSlide]) {
            heroProgressBars[currentHeroSlide].style.width = progress + '%';
        }
    }, 30);
}

function showHeroSlide(index) {
    heroSlides.forEach((slide, i) => {
        if (slide.classList.contains('active')) {
            slide.classList.remove('active');
            slide.classList.add('was-active');
            setTimeout(() => slide.classList.remove('was-active'), 1500);
        }
        heroTabs[i].classList.remove('active');
        if (heroProgressBars[i]) heroProgressBars[i].style.width = '0%';
    });

    heroSlides[index].classList.remove('was-active');
    heroSlides[index].classList.add('active');
    heroTabs[index].classList.add('active');
    currentHeroSlide = index;

    const activeVideo = heroSlides[index].querySelector('video');
    
    const finalizeSlideStart = (duration) => {
        updateHeroProgress(duration);
        slideInterval = setTimeout(() => {
            showHeroSlide((currentHeroSlide + 1) % heroSlides.length);
        }, duration);
    };

    if (activeVideo) {
        activeVideo.currentTime = 0;
        activeVideo.play().catch(e => console.log("Video autoplay blocked:", e));
        
        const setDynamicDuration = () => {
            activeVideo.onloadedmetadata = null;
            const videoDuration = activeVideo.duration * 1000;
            const durationToUse = (videoDuration && videoDuration > 1000) ? videoDuration : DEFAULT_DURATION;
            finalizeSlideStart(durationToUse);
        };

        if (activeVideo.readyState >= 1) {
            setDynamicDuration();
        } else {
            activeVideo.onloadedmetadata = setDynamicDuration;
            setTimeout(() => {
                if (!slideInterval && currentHeroSlide === index) {
                    finalizeSlideStart(DEFAULT_DURATION);
                }
            }, 2500);
        }
    } else {
        finalizeSlideStart(DEFAULT_DURATION);
    }
}

heroTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
        stopHeroSlider();
        showHeroSlide(i);
    });
});

startHeroSlider();


// =============================================
// SCROLL REVEAL
// =============================================
const revealEls = document.querySelectorAll('.reveal');
const observer  = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));


// =============================================
// STICKY NAVBAR
// =============================================
const navbar = document.querySelector('.navbar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    // Hide/Reveal logic
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
        navbar.classList.add('nav-hidden');
    } else {
        navbar.classList.remove('nav-hidden');
    }
    lastScrollY = window.scrollY;

    // Shadow logic
    navbar.style.boxShadow = window.scrollY > 40
        ? '0 4px 24px rgba(0,0,0,0.08)'
        : 'none';
});

// =============================================
// TESTIMONIAL SLIDER (SPOTLIGHT)
// =============================================
let currentTesti = 0;
const testiTrack = document.getElementById('testiTrack');
const testiCards = document.querySelectorAll('.testimonial-card');

function slideTestimonial(direction) {
    if (!testiTrack || testiCards.length === 0) return;
    
    currentTesti += direction;
    
    // Boundary checks
    if (currentTesti < 0) currentTesti = 0;
    if (currentTesti >= testiCards.length) currentTesti = testiCards.length - 1;
    
    // Update active classes
    testiCards.forEach((c, i) => {
        if (i === currentTesti) {
            c.classList.add('active');
        } else {
            c.classList.remove('active');
        }
    });
    
    // Calculate translation (assuming 85vw card + 30px gap)
    // 85vw = 85, plus we need to account for the gap. A simpler approach is to rely on the card's width dynamically.
    const cardWidth = testiCards[0].offsetWidth;
    const gap = 30;
    const move = currentTesti * (cardWidth + gap);
    
    testiTrack.style.transform = `translateX(-${move}px)`;
}

// Optional: Basic Drag support
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;

if(testiTrack) {
    testiTrack.addEventListener('mousedown', touchStart);
    testiTrack.addEventListener('touchstart', touchStart, {passive: true});
    testiTrack.addEventListener('mouseup', touchEnd);
    testiTrack.addEventListener('mouseleave', () => { if(isDragging) touchEnd() });
    testiTrack.addEventListener('touchend', touchEnd);
    testiTrack.addEventListener('mousemove', touchMove);
    testiTrack.addEventListener('touchmove', touchMove, {passive: true});
}

function touchStart(e) {
    isDragging = true;
    startPos = getPositionX(e);
    animationID = requestAnimationFrame(animation);
    testiTrack.style.transition = 'none';
}

function touchMove(e) {
    if (isDragging) {
        const currentPosition = getPositionX(e);
        currentTranslate = prevTranslate + currentPosition - startPos;
    }
}

function touchEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);
    testiTrack.style.transition = 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
    
    const movedBy = currentTranslate - prevTranslate;
    
    if (movedBy < -100 && currentTesti < testiCards.length - 1) currentTesti += 1;
    if (movedBy > 100 && currentTesti > 0) currentTesti -= 1;
    
    slideTestimonial(0); // This will snap to the correct slide
    
    // Update prevTranslate for next time
    const cardWidth = testiCards[0].offsetWidth;
    const gap = 30;
    prevTranslate = -(currentTesti * (cardWidth + gap));
}

function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
}
function animation() {
    testiTrack.style.transform = `translateX(${currentTranslate}px)`;
    if (isDragging) requestAnimationFrame(animation);
}
// =============================================
// MISSION VIDEO HANDLING
// =============================================
function playSectionVideo() {
    const section = document.getElementById('editorialSection');
    const vid = document.getElementById('sectionBgVideo');
    const thumb = document.getElementById('editorialThumbnail');
    const closeBtn = document.getElementById('closeSectionVideoBtn');
    const heading = document.getElementById('editorialHeading');

    // Video source from original folder configuration
    vid.src = 'https://raw.githubusercontent.com/vandermerwejack611-cloud/video-2/main/WhatsApp%20Video%202026-05-07%20at%2010.08.45%20PM%20(1).mp4';

    vid.load();
    vid.muted = false;
    vid.play().catch(e => console.log("Video playback error:", e));

    if (heading) {
        heading.style.transform = 'scale(1.05)';
    }

    section.classList.add('video-active');
    vid.style.opacity = '1';
    thumb.style.opacity = '0';
    thumb.style.pointerEvents = 'none';
    closeBtn.style.display = 'flex';

    const volCtrl = document.getElementById('videoVolumeControl');
    const volRange = document.getElementById('videoVolumeRange');
    if (volCtrl && volRange) {
        volCtrl.style.display = 'flex';
        volRange.oninput = (e) => {
            vid.volume = e.target.value;
            const icon = document.getElementById('volumeIcon');
            if (vid.volume == 0) icon.className = 'fas fa-volume-mute';
            else if (vid.volume < 0.5) icon.className = 'fas fa-volume-down';
            else icon.className = 'fas fa-volume-up';
        };
    }
}

function toggleSectionVideo() {
    const video = document.getElementById('sectionBgVideo');
    const icon = document.getElementById('playPauseIcon');
    if (video.paused) {
        video.play();
        icon.classList.replace('fa-play', 'fa-pause');
    } else {
        video.pause();
        icon.classList.replace('fa-pause', 'fa-play');
    }
}

function stopSectionVideo() {
    const section = document.getElementById('editorialSection');
    const vid = document.getElementById('sectionBgVideo');
    const thumb = document.getElementById('editorialThumbnail');
    const closeBtn = document.getElementById('closeSectionVideoBtn');
    const volCtrl = document.getElementById('videoVolumeControl');
    const heading = document.getElementById('editorialHeading');

    vid.pause();
    vid.muted = true;
    vid.style.opacity = '0';
    section.classList.remove('video-active');
    thumb.style.opacity = '1';
    thumb.style.pointerEvents = 'auto';
    closeBtn.style.display = 'none';
    if(volCtrl) volCtrl.style.display = 'none';
    if(heading) heading.style.transform = 'scale(1)';

    vid.src = '';
}
