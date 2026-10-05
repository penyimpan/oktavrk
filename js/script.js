// js/script.js - Custom Cursor & Tooltip Logic

let tooltip, ttTitle, ttDetail;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

document.addEventListener('DOMContentLoaded', () => {
    initTooltip();
    initCursorHoverEffects();
});

// --- TOOLTIP LOGIC ---
function initTooltip() {
    tooltip = document.getElementById('tooltip-box');
    ttTitle = document.getElementById('tt-title');
    ttDetail = document.getElementById('tt-detail');
    
    if (!tooltip) return;

    const triggers = document.querySelectorAll('.hover-trigger');

    triggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', (e) => {
            ttTitle.textContent = trigger.getAttribute('data-title');
            ttDetail.textContent = trigger.getAttribute('data-detail');
            tooltip.style.opacity = '1';
            updateTooltipPosition();
        });

        trigger.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
    });
}

function updateTooltipPosition() {
    if (tooltip && tooltip.style.opacity === '1') {
        let x = mouseX + 25;
        let y = mouseY + 25;
        
        const ttRect = tooltip.getBoundingClientRect();
        if (x + ttRect.width > window.innerWidth) {
            x = mouseX - ttRect.width - 15;
        }
        if (y + ttRect.height > window.innerHeight) {
            y = mouseY - ttRect.height - 15;
        }
        
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    }
}

// --- INTERACTIVE CANVAS CURSOR ---
const canvas = document.getElementById('cursor-canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let mouse = { x: width / 2, y: height / 2, vx: 0, vy: 0 };
let prevMouse = { x: width / 2, y: height / 2 };
let particles = [];
let isHovering = false; 

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

window.addEventListener('mousemove', (e) => {
    prevMouse.x = mouse.x;
    prevMouse.y = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    mouse.vx = mouse.x - prevMouse.x;
    mouse.vy = mouse.y - prevMouse.y;
    
    updateTooltipPosition();

    if (Math.random() > 0.4) {
        particles.push(new Particle(mouse.x, mouse.y, isHovering));
    }
});

function initCursorHoverEffects() {
    // Add interactable class to anything you want to trigger the hover cursor
    const interactables = document.querySelectorAll('.interactable');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            isHovering = true;
            for(let i = 0; i < 10; i++) {
                particles.push(new Particle(mouse.x, mouse.y, true, true));
            }
        });
        el.addEventListener('mouseleave', () => {
            isHovering = false;
        });
    });
}

class Particle {
    constructor(x, y, hoverState, isBurst = false) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2; 
        
        if (isBurst) {
            this.speedX = (Math.random() - 0.5) * 15;
            this.speedY = (Math.random() - 0.5) * 15;
        } else {
            this.speedX = mouse.vx * 0.05 + (Math.random() - 0.5) * 2;
            this.speedY = mouse.vy * 0.05 + (Math.random() - 0.5) * 2;
        }
        
        this.color = hoverState ? '#ff00ff' : '#00ffcc';
        this.life = 1;
        this.decay = Math.random() * 0.05 + 0.02;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        if (this.size > 0.1) this.size -= 0.1;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

function drawCursor() {
    ctx.strokeStyle = isHovering ? '#fcee0a' : '#00ffcc';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(mouse.x - 12, mouse.y);
    ctx.lineTo(mouse.x + 12, mouse.y);
    ctx.moveTo(mouse.x, mouse.y - 12);
    ctx.lineTo(mouse.x, mouse.y + 12);
    ctx.stroke();
    
    if (isHovering) {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(mouse.x - 4, mouse.y - 4, 8, 8);
    } else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(mouse.x - 2, mouse.y - 2, 4, 4);
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
    
    drawCursor();
    requestAnimationFrame(animate);
}

animate();
