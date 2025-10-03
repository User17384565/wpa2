// App State
let deferredPrompt;
let currentSection = 'home';

// DOM Elements
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-link');
const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
const contentSections = document.querySelectorAll('.content-section');
const installBanner = document.getElementById('installBanner');
const installBtn = document.getElementById('installBtn');
const dismissBtn = document.getElementById('dismissBtn');
const loadingScreen = document.getElementById('loadingScreen');
const contactForm = document.querySelector('.contact-form');

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    registerServiceWorker();
    setupEventListeners();
    setupPWAInstallPrompt();
    hideLoadingScreen();
});

// Initialize App
function initializeApp() {
    // Set initial active section
    showSection('home');
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Hide address bar on mobile
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.scrollTo(0, 1);
        }, 100);
    });
    
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Setup Event Listeners
function setupEventListeners() {
    // Menu button
    menuBtn.addEventListener('click', toggleMenu);
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
    
    // Bottom navigation
    bottomNavItems.forEach(item => {
        item.addEventListener('click', handleBottomNavClick);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
            closeMenu();
        }
    });
    
    // Handle back button
    window.addEventListener('popstate', handlePopState);
    
    // Contact form
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Install banner buttons
    if (installBtn) {
        installBtn.addEventListener('click', installApp);
    }
    
    if (dismissBtn) {
        dismissBtn.addEventListener('click', dismissInstallBanner);
    }
    
    // Handle resize
    window.addEventListener('resize', handleResize);
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(handleResize, 100);
    });
    
    // Prevent pull-to-refresh
    document.body.addEventListener('touchstart', e => {
        if (e.touches.length === 1 && window.pageYOffset === 0) {
            e.preventDefault();
        }
    }, { passive: false });
    
    document.body.addEventListener('touchmove', e => {
        if (e.touches.length === 1 && window.pageYOffset === 0) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Menu Functions
function toggleMenu() {
    nav.classList.toggle('active');
    menuBtn.classList.toggle('active');
}

function closeMenu() {
    nav.classList.remove('active');
    menuBtn.classList.remove('active');
}

// Navigation Functions
function handleNavClick(e) {
    e.preventDefault();
    const targetSection = e.target.getAttribute('href').substring(1);
    showSection(targetSection);
    closeMenu();
    updateURL(targetSection);
}

function handleBottomNavClick(e) {
    e.preventDefault();
    const targetSection = e.target.closest('.bottom-nav-item').getAttribute('href').substring(1);
    showSection(targetSection);
    updateURL(targetSection);
}

function showSection(sectionId) {
    // Hide all sections
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
    }
    
    // Update navigation states
    updateNavigationStates(sectionId);
    
    // Scroll to top
    document.querySelector('.app-main').scrollTop = 0;
}

function updateNavigationStates(sectionId) {
    // Update top navigation
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Update bottom navigation
    bottomNavItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${sectionId}`) {
            item.classList.add('active');
        }
    });
}

function updateURL(section) {
    const newURL = `${window.location.origin}${window.location.pathname}#${section}`;
    history.pushState({ section }, '', newURL);
}

function handlePopState(event) {
    const section = event.state?.section || getHashFromURL() || 'home';
    showSection(section);
}

function getHashFromURL() {
    return window.location.hash.substring(1);
}

// Contact Form
function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };
    
    // Show loading state
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Wird gesendet...';
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        alert('Nachricht erfolgreich gesendet!');
        e.target.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// PWA Installation
function setupPWAInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallBanner();
    });
    
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        hideInstallBanner();
        console.log('PWA was installed');
    });
}

function showInstallBanner() {
    if (installBanner && !isAppInstalled()) {
        installBanner.classList.remove('hidden');
        setTimeout(() => {
            installBanner.classList.add('show');
        }, 100);
    }
}

function hideInstallBanner() {
    if (installBanner) {
        installBanner.classList.remove('show');
        setTimeout(() => {
            installBanner.classList.add('hidden');
        }, 300);
    }
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
            hideInstallBanner();
        });
    }
}

function dismissInstallBanner() {
    hideInstallBanner();
    localStorage.setItem('installBannerDismissed', 'true');
}

function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true ||
           localStorage.getItem('installBannerDismissed') === 'true';
}

// Service Worker Registration
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('Service Worker registered successfully:', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content is available
                        showUpdateNotification();
                    }
                });
            });
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span>Neue Version verfügbar!</span>
            <button onclick="window.location.reload()">Aktualisieren</button>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}

// Loading Screen
function hideLoadingScreen() {
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 1500);
}

// Utility Functions
function handleResize() {
    // Update viewport height for mobile browsers
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Close menu on resize
    closeMenu();
}

// Touch and Gesture Handling
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Swipe detection (horizontal swipes for navigation)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
            // Swipe left - next section
            navigateToNextSection();
        } else {
            // Swipe right - previous section
            navigateToPreviousSection();
        }
        
        touchStartX = 0;
        touchStartY = 0;
    }
});

function navigateToNextSection() {
    const sections = ['home', 'services', 'about', 'contact'];
    const currentIndex = sections.indexOf(currentSection);
    const nextIndex = (currentIndex + 1) % sections.length;
    showSection(sections[nextIndex]);
    updateURL(sections[nextIndex]);
}

function navigateToPreviousSection() {
    const sections = ['home', 'services', 'about', 'contact'];
    const currentIndex = sections.indexOf(currentSection);
    const prevIndex = (currentIndex - 1 + sections.length) % sections.length;
    showSection(sections[prevIndex]);
    updateURL(sections[prevIndex]);
}

// Performance Optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized resize handler
const optimizedResize = debounce(handleResize, 250);
window.addEventListener('resize', optimizedResize);

// App Analytics (Optional)
function trackEvent(action, section) {
    console.log(`Event: ${action} in ${section}`);
    // Add your analytics tracking here
}

// Initialize URL-based navigation
window.addEventListener('load', () => {
    const initialSection = getHashFromURL() || 'home';
    showSection(initialSection);
});

// Add CSS for update notification
const style = document.createElement('style');
style.textContent = `
    .update-notification {
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateY(-100px);
        transition: transform 0.3s ease;
    }
    
    .update-notification.show {
        transform: translateY(0);
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
    }
    
    .notification-content button {
        background: rgba(255,255,255,0.2);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
    }
`;
document.head.appendChild(style);