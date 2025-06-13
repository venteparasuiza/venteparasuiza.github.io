// Vente para Suiza - Mobile-First JavaScript
// Optimized for performance and conversions

'use strict';

// Global variables
let currentStep = 1;
let currentTestimonial = 1;
let testimonialInterval;
let isModalOpen = false;
let formSubmitted = false;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize App
function initializeApp() {
    setupEventListeners();
    startTestimonialRotation();
    setupFormValidation();
    setupSmoothScrolling();
    setupPerformanceOptimizations();
    
    // Analytics events (if needed later)
    trackPageView();
}

// Event Listeners Setup
function setupEventListeners() {
    // Modal events
    const modal = document.getElementById('cvModal');
    if (modal) {
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Form submission
    const form = document.getElementById('cvForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Prevent double-tap zoom on buttons (mobile optimization)
    const buttons = document.querySelectorAll('button, .btn, .cta-button-primary, .cta-button-secondary');
    buttons.forEach(button => {
        button.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.click();
        });
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isModalOpen) {
            closeModal();
        }
    });
    
    // File input validation
    const fileInput = document.getElementById('cv');
    if (fileInput) {
        fileInput.addEventListener('change', validateFile);
    }
    
    // Real-time form validation
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// Modal Functions
function openModal() {
    const modal = document.getElementById('cvModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        isModalOpen = true;
        currentStep = 1;
        showStep(1);
        
        // Focus first input for better UX
        setTimeout(() => {
            const firstInput = modal.querySelector('input:not([type="hidden"])');
            if (firstInput) firstInput.focus();
        }, 300);
        
        // Track modal open
        trackEvent('modal_opened', 'engagement');
    }
}

function openModalWithJob(jobTitle) {
    document.getElementById('jobInterest').value = jobTitle;
    openModal();
    trackEvent('job_interest', 'conversion', jobTitle);
}

function closeModal() {
    const modal = document.getElementById('cvModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        isModalOpen = false;
        resetForm();
    }
}

// Form Step Navigation
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < 3) {
            currentStep++;
            showStep(currentStep);
            trackEvent(`step_${currentStep}_reached`, 'form_progress');
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

function showStep(step) {
    // Hide all steps
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(s => s.classList.remove('active'));
    
    // Show current step
    const currentStepElement = document.getElementById(`step${step}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
        
        // Focus first input in current step
        setTimeout(() => {
            const firstInput = currentStepElement.querySelector('input:not([type="hidden"]), select, textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

// Form Validation
function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    if (!currentStepElement) return false;
    
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({target: field})) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous errors
    clearFieldError({target: field});
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'Este campo es obligatorio';
        isValid = false;
    }
    
    // Email validation
    else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Por favor, introduce un email válido';
            isValid = false;
        }
    }
    
    // Phone validation
    else if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,}$/;
        if (!phoneRegex.test(value)) {
            errorMessage = 'Por favor, introduce un teléfono válido';
            isValid = false;
        }
    }
    
    // Show error if validation fails
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.style.borderColor = '#f44336';
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#f44336';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(e) {
    const field = e.target;
    field.style.borderColor = '#e0e0e0';
    
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// File Validation
function validateFile(e) {
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (file) {
        // Check file size
        if (file.size > maxSize) {
            showFieldError(e.target, 'El archivo no puede ser mayor a 5MB');
            e.target.value = '';
            return false;
        }
        
        // Check file type
        if (!allowedTypes.includes(file.type)) {
            showFieldError(e.target, 'Solo se permiten archivos PDF, DOC o DOCX');
            e.target.value = '';
            return false;
        }
        
        clearFieldError(e);
        return true;
    }
}

// Form Submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (formSubmitted) {
        return; // Prevent double submission
    }
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    formSubmitted = true;
    
    // Submit form via Formspree
    const formData = new FormData(e.target);
    
    fetch(e.target.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            showSuccessMessage();
            trackEvent('form_submitted', 'conversion');
        } else {
            throw new Error('Error en el envío');
        }
    })
    .catch(error => {
        showErrorMessage();
        console.error('Error:', error);
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        formSubmitted = false;
    });
}

function showSuccessMessage() {
    const modal = document.querySelector('.modal-content');
    modal.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
            <h2 style="color: #4caf50; margin-bottom: 16px;">¡CV enviado correctamente!</h2>
            <p style="margin-bottom: 24px; color: #666;">Nos pondremos en contacto contigo en las próximas 24 horas.</p>
            <button onclick="closeModal()" style="background: #d32f2f; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;">Cerrar</button>
        </div>
    `;
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        closeModal();
    }, 5000);
}

function showErrorMessage() {
    const modal = document.querySelector('.modal-content');
    modal.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 20px;">❌</div>
            <h2 style="color: #f44336; margin-bottom: 16px;">Error al enviar</h2>
            <p style="margin-bottom: 24px; color: #666;">Ha ocurrido un error. Por favor, inténtalo de nuevo o contáctanos directamente.</p>
            <div style="margin-bottom: 24px;">
                <a href="mailto:venteparasuiza@gmail.com" style="display: inline-block; background: #d32f2f; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-right: 12px;">Enviar Email</a>
                <button onclick="location.reload()" style="background: #666; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;">Reintentar</button>
            </div>
        </div>
    `;
}

function resetForm() {
    const form = document.getElementById('cvForm');
    if (form) {
        form.reset();
        currentStep = 1;
        showStep(1);
        
        // Clear all error messages
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
        
        // Reset field styles
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.style.borderColor = '#e0e0e0';
        });
    }
}

// Testimonials Carousel
function startTestimonialRotation() {
    testimonialInterval = setInterval(() => {
        currentTestimonial = currentTestimonial === 3 ? 1 : currentTestimonial + 1;
        showTestimonial(currentTestimonial);
    }, 5000);
}

function showTestimonial(index) {
    // Hide all testimonials
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.dot');
    
    testimonials.forEach(t => t.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    // Show selected testimonial
    const selectedTestimonial = testimonials[index - 1];
    const selectedDot = dots[index - 1];
    
    if (selectedTestimonial) selectedTestimonial.classList.add('active');
    if (selectedDot) selectedDot.classList.add('active');
    
    currentTestimonial = index;
}

function currentTestimonialClick(index) {
    clearInterval(testimonialInterval);
    showTestimonial(index);
    startTestimonialRotation();
}

// FAQ Functions
function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('.faq-icon');
    
    // Close all other FAQs
    const allAnswers = document.querySelectorAll('.faq-answer');
    const allIcons = document.querySelectorAll('.faq-icon');
    
    allAnswers.forEach(a => {
        if (a !== answer) {
            a.classList.remove('active');
        }
    });
    
    allIcons.forEach(i => {
        if (i !== icon) {
            i.textContent = '+';
        }
    });
    
    // Toggle current FAQ
    answer.classList.toggle('active');
    icon.textContent = answer.classList.contains('active') ? '−' : '+';
    
    trackEvent('faq_clicked', 'engagement', element.textContent.trim());
}

// Smooth Scrolling
function setupSmoothScrolling() {
    // Handle scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            scrollToSection('beneficios');
        });
    }
    
    // Handle navigation scrolling
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-scroll]')) {
            e.preventDefault();
            const target = e.target.getAttribute('data-scroll');
            scrollToSection(target);
        }
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navHeight = document.querySelector('.nav-sticky').offsetHeight;
        const sectionTop = section.offsetTop - navHeight - 20;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
        
        trackEvent('section_scrolled', 'navigation', sectionId);
    }
}

// Performance Optimizations
function setupPerformanceOptimizations() {
    // Lazy load images (if any added later)
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    // Preload critical resources
    const preloadCritical = () => {
        const formspreeLink = document.createElement('link');
        formspreeLink.rel = 'preconnect';
        formspreeLink.href = 'https://formspree.io';
        document.head.appendChild(formspreeLink);
    };
    
    // Run after page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preloadCritical);
    } else {
        preloadCritical();
    }
}

// Analytics & Tracking (Basic implementation)
function trackEvent(eventName, category, label = '') {
    // Basic tracking - can be extended with Google Analytics, etc.
    console.log(`Event: ${eventName}, Category: ${category}, Label: ${label}`);
    
    // If Google Analytics is added later:
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', eventName, {
    //         event_category: category,
    //         event_label: label
    //     });
    // }
}

function trackPageView() {
    trackEvent('page_view', 'engagement');
}

// Utility Functions
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Mobile-specific optimizations
function setupMobileOptimizations() {
    // Prevent zoom on input focus (iOS)
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (window.innerWidth < 768) {
                document.querySelector('meta[name="viewport"]').setAttribute('content', 
                    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
                );
            }
        });
        
        input.addEventListener('blur', function() {
            if (window.innerWidth < 768) {
                document.querySelector('meta[name="viewport"]').setAttribute('content', 
                    'width=device-width, initial-scale=1.0, user-scalable=yes'
                );
            }
        });
    });
    
    // Handle iOS Safari viewport issues
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        const fixViewport = () => {
            document.documentElement.style.height = window.innerHeight + 'px';
        };
        
        window.addEventListener('resize', debounce(fixViewport, 100));
        window.addEventListener('orientationchange', () => {
            setTimeout(fixViewport, 100);
        });
        
        fixViewport();
    }
}

// Initialize mobile optimizations
document.addEventListener('DOMContentLoaded', setupMobileOptimizations);

// Service Worker Registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for global access
window.openModal = openModal;
window.openModalWithJob = openModalWithJob;
window.closeModal = closeModal;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.toggleFAQ = toggleFAQ;
window.currentTestimonial = currentTestimonialClick;
window.scrollToSection = scrollToSection;
