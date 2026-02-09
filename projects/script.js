$(document).ready(function () {

    $('#menu').click(function () {
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });

    $(window).on('scroll load', function () {
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');

        if (window.scrollY > 60) {
            document.querySelector('#scroll-top').classList.add('active');
        } else {
            document.querySelector('#scroll-top').classList.remove('active');
        }
    });
});

document.addEventListener('visibilitychange',
    function () {
        if (document.visibilityState === "visible") {
            document.title = "Projects | Portfolio Poorna Chandra Dinesh";
            $("#favicon").attr("href", "/assets/images/favicon.png");
        }
        else {
            document.title = "Come Back To Portfolio";
            $("#favicon").attr("href", "/assets/images/favhand.png");
        }
    });


// fetch projects start
function getProjects() {
    return fetch("projects.json")
        .then(response => response.json())
        .then(data => {
            return data
        });
}


function showProjects(projects) {
    let projectsContainer = document.querySelector("#projectsContainer");
    let projectsHTML = "";
    
    projects.forEach((project, index) => {
        const techStack = project.tech.map(tech => 
            `<span class="tech-badge">${tech}</span>`
        ).join('');
        
        const features = project.features.map(feature =>
            `<li>${feature}</li>`
        ).join('');
        
        const demoButton = project.demo ? `<button class="demo-btn" data-demo-id="${index}" title="Open Interactive Demo"><i class="fas fa-play-circle"></i> Try Demo</button>` : '';
        
        projectsHTML += `<div class="project-card"><div class="project-image"><img src="/assets/images/projects/${project.image}.png" alt="${project.name}" /><div class="project-zoom"><i class="fas fa-search"></i></div></div><div class="project-content"><h3 class="project-title">${project.name}</h3><ul class="project-features">${features}</ul><div class="project-tech">${techStack}</div><div class="project-links">${demoButton}<a href="${project.links.view}" target="_blank" title="View Project"><i class="fas fa-external-link-alt"></i> View</a><a href="${project.links.code}" target="_blank" title="View Code"><i class="fas fa-code"></i> Code</a></div></div></div>`;
    });
    
    projectsContainer.innerHTML = projectsHTML;
    
    // Add demo modal if it doesn't exist
    if (!document.querySelector('.demo-modal')) {
        const modal = document.createElement('div');
        modal.className = 'demo-modal';
        modal.innerHTML = `<div class="demo-modal-content"><div class="demo-modal-header"><h2 id="demo-title">Project Demo</h2><button class="demo-close-btn"><i class="fas fa-times"></i></button></div><div class="demo-modal-body"><p id="demo-description"></p><div class="demo-container"><iframe id="demo-iframe" frameborder="0" allowfullscreen></iframe></div></div></div>`;
        document.body.appendChild(modal);
        
        modal.querySelector('.demo-close-btn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
    
    // Attach demo button listeners
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const demoId = btn.getAttribute('data-demo-id');
            const project = projects[demoId];
            const modal = document.querySelector('.demo-modal');
            
            if (project && project.demo) {
                document.getElementById('demo-title').textContent = project.name + ' - Interactive Demo';
                document.getElementById('demo-description').textContent = project.demo.description;
                document.getElementById('demo-iframe').src = project.demo.url;
                modal.style.display = 'flex';
            }
        });
    });
        
    attachProjectPointerEffects();
    attachProjectHoverTooltip();
    attachProjectClickZoom();
}

    function attachProjectPointerEffects() {
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--px', `${x}px`);
                card.style.setProperty('--py', `${y}px`);
            });
            card.addEventListener('mouseleave', () => {
                card.style.removeProperty('--px');
                card.style.removeProperty('--py');
            });
        });
    }

    function getOrCreateCursorTooltip() {
        let tooltip = document.querySelector('.cursor-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'cursor-tooltip';
            tooltip.innerHTML = '<span class="avatar"></span><span class="label"></span>';
            document.body.appendChild(tooltip);
        }
        return tooltip;
    }

    function attachProjectHoverTooltip() {
        const tooltip = getOrCreateCursorTooltip();
        const cards = document.querySelectorAll('.project-card');
        const show = () => { tooltip.style.display = 'inline-flex'; };
        const hide = () => { tooltip.style.display = 'none'; };
        const setContent = (card) => {
            const titleEl = card.querySelector('.project-title');
            const name = titleEl ? titleEl.textContent.trim() : 'Project';
            const short = name.length > 22 ? name.slice(0, 22).trim() + '…' : name;
            const avatar = name.charAt(0).toUpperCase();
            tooltip.querySelector('.avatar').textContent = avatar;
            tooltip.querySelector('.label').textContent = short;
        };
        const move = (e) => {
            const offsetX = 16;
            const offsetY = 20;
            let x = e.clientX + offsetX;
            let y = e.clientY + offsetY;
            const rect = tooltip.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            if (x + rect.width > vw - 8) x = vw - rect.width - 8;
            if (y + rect.height > vh - 8) y = vh - rect.height - 8;
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        };
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                setContent(card);
                show();
            });
            card.addEventListener('mousemove', move);
            card.addEventListener('mouseleave', hide);
        });
    }

    function attachProjectClickZoom() {
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            const add = () => card.classList.add('is-clicked');
            const remove = () => card.classList.remove('is-clicked');
            card.addEventListener('mousedown', add);
            card.addEventListener('mouseup', () => {
                setTimeout(remove, 120);
            });
            card.addEventListener('mouseleave', remove);
            card.addEventListener('touchstart', add, { passive: true });
            card.addEventListener('touchend', () => {
                setTimeout(remove, 160);
            }, { passive: true });
        });
    }

getProjects().then(data => {
    showProjects(data);
})
// fetch projects end


// disable developer mode
document.onkeydown = function (e) {
    if (e.keyCode == 123) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
}