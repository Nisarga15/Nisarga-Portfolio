const BUBBLE_CONFIG = {
  minRadius: 30,
  maxRadius: 80,
  gravity: 0.02,
  friction: 0.99,
  bounce: 0.5,
  hoverScale: 1.15,
  floatSpeed: 0.3
};

const PRO_LEVELS = [
  { min: 3, label: 'Expert' },
  { min: 2, label: 'Advanced' },
  { min: 1, label: 'Intermediate' },
  { min: 0, label: 'Beginner' }
];

// Network-related keywords for highlighting
const NETWORK_KEYWORDS = [
  'ccna', 'cisco', 'network', 'voip', 'vlan', 'wifi', 'security', 
  'routing', 'switching', 'infrastructure', 'dns', 'dhcp', 'tcp/ip',
  'firewall', 'vpn', 'wireless', 'ethernet', 'fiber'
];

// Software engineering keywords for highlighting
const SOFTWARE_KEYWORDS = [
  'python', 'javascript', 'java', 'node', 'react', 'docker', 'kubernetes',
  'ci/cd', 'pyspark', 'databricks', 'sql', 'mongodb', 'linux', 'aws',
  'azure', 'git', 'data', 'mcp', 'rpa', 'c', 'automation'
];

function normalizeSkill(name) {
  return name.toLowerCase();
}

function isHighlightedSkill(skillName) {
  const normalized = normalizeSkill(skillName);
  const isNetwork = NETWORK_KEYWORDS.some(kw => normalized.includes(kw));
  const isSoftware = SOFTWARE_KEYWORDS.some(kw => normalized.includes(kw));
  return { isNetwork, isSoftware, isHighlighted: isNetwork || isSoftware };
}

function matchProjects(skillName, projects) {
  const needle = normalizeSkill(skillName);
  return projects.filter(project => {
    const inTech = project.tech?.some(t => normalizeSkill(t).includes(needle) || needle.includes(normalizeSkill(t)));
    const inName = normalizeSkill(project.name).includes(needle);
    const inDesc = normalizeSkill(project.desc).includes(needle);
    return inTech || inName || inDesc;
  });
}

function getLevel(count) {
  for (const level of PRO_LEVELS) {
    if (count >= level.min) return level.label;
  }
  return 'Beginner';
}

class SkillBubble {
  constructor(skill, x, y, radius, projects) {
    this.skill = skill;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.targetY = y;
    this.floatOffset = Math.random() * Math.PI * 2;
    this.projects = projects;
    this.level = getLevel(projects.length);
    this.hovered = false;
    
    const highlight = isHighlightedSkill(skill.name);
    this.isNetwork = highlight.isNetwork;
    this.isSoftware = highlight.isSoftware;
    this.isHighlighted = highlight.isHighlighted;
  }

  update(canvasWidth, canvasHeight, mouseX, mouseY) {
    // Floating animation
    this.floatOffset += BUBBLE_CONFIG.floatSpeed * 0.02;
    const floatY = Math.sin(this.floatOffset) * 15;
    
    // Physics
    this.vy += BUBBLE_CONFIG.gravity;
    this.x += this.vx;
    this.y += this.vy;
    
    // Apply floating
    this.y += (this.targetY + floatY - this.y) * 0.02;
    
    // Friction
    this.vx *= BUBBLE_CONFIG.friction;
    this.vy *= BUBBLE_CONFIG.friction;
    
    // Bounce off walls
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -BUBBLE_CONFIG.bounce;
    } else if (this.x + this.radius > canvasWidth) {
      this.x = canvasWidth - this.radius;
      this.vx *= -BUBBLE_CONFIG.bounce;
    }
    
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy *= -BUBBLE_CONFIG.bounce;
    } else if (this.y + this.radius > canvasHeight) {
      this.y = canvasHeight - this.radius;
      this.vy *= -BUBBLE_CONFIG.bounce;
    }
    
    // Check hover
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.hovered = distance < this.radius;
  }

  draw(ctx) {
    const scale = this.hovered ? BUBBLE_CONFIG.hoverScale : 1;
    const r = this.radius * scale;
    
    // Glow effect for highlighted skills
    if (this.isHighlighted) {
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = this.isNetwork ? 'rgba(255, 122, 24, 0.6)' : 'rgba(255, 45, 128, 0.6)';
      
      // Outer glow ring
      const gradient = ctx.createRadialGradient(this.x, this.y, r * 0.5, this.x, this.y, r * 1.2);
      gradient.addColorStop(0, this.isNetwork ? 'rgba(255, 122, 24, 0.3)' : 'rgba(255, 45, 128, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // Main bubble
    const bubbleGradient = ctx.createRadialGradient(
      this.x - r * 0.3, 
      this.y - r * 0.3, 
      0,
      this.x, 
      this.y, 
      r
    );
    
    if (this.isNetwork) {
      bubbleGradient.addColorStop(0, 'rgba(255, 122, 24, 0.9)');
      bubbleGradient.addColorStop(1, 'rgba(255, 90, 24, 0.7)');
    } else if (this.isSoftware) {
      bubbleGradient.addColorStop(0, 'rgba(255, 45, 128, 0.9)');
      bubbleGradient.addColorStop(1, 'rgba(230, 30, 110, 0.7)');
    } else {
      bubbleGradient.addColorStop(0, 'rgba(154, 163, 184, 0.7)');
      bubbleGradient.addColorStop(1, 'rgba(120, 130, 150, 0.5)');
    }
    
    ctx.fillStyle = bubbleGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = this.isHighlighted 
      ? (this.isNetwork ? 'rgba(255, 122, 24, 0.9)' : 'rgba(255, 45, 128, 0.9)')
      : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = this.isHighlighted ? 3 : 2;
    ctx.stroke();
    
    // Shine effect
    const shineGradient = ctx.createRadialGradient(
      this.x - r * 0.4,
      this.y - r * 0.4,
      0,
      this.x - r * 0.4,
      this.y - r * 0.4,
      r * 0.6
    );
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shineGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fill();
    
    // Skill name (centered)
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(10, r * 0.25)}px 'Poppins', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    
    const words = this.skill.name.split(' ');
    if (words.length > 2 && r < 50) {
      // Multiline for small bubbles
      const lineHeight = r * 0.3;
      words.forEach((word, i) => {
        ctx.fillText(word, this.x, this.y + (i - words.length/2 + 0.5) * lineHeight);
      });
    } else {
      ctx.fillText(this.skill.name, this.x, this.y);
    }
    
    ctx.shadowBlur = 0;
  }
}

async function initSkillsGlobe() {
  const container = document.getElementById('skillsGlobe');
  const canvas = document.getElementById('skillsGlobeCanvas');
  const tooltip = document.getElementById('skillsGlobeTooltip');
  if (!container || !canvas || !tooltip) return;

  const ctx = canvas.getContext('2d');
  
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Fetch data
  const [skillsData, projectsData] = await Promise.all([
    fetch('/skills.json').then(r => r.json()),
    fetch('/projects/projects.json').then(r => r.json())
  ]).catch(() => [[], []]);

  if (!skillsData || skillsData.length === 0) {
    ctx.fillStyle = '#888';
    ctx.font = '16px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText('Unable to load skills data', canvas.width / 2, canvas.height / 2);
    return;
  }

  const projects = projectsData || [];
  const bubbles = [];
  
  // Create bubbles with grid-based distribution for better coverage
  const cols = Math.ceil(Math.sqrt(skillsData.length * (canvas.width / canvas.height)));
  const rows = Math.ceil(skillsData.length / cols);
  const cellWidth = canvas.width / cols;
  const cellHeight = canvas.height / rows;
  
  skillsData.forEach((skill, i) => {
    const relatedProjects = matchProjects(skill.name, projects);
    const level = getLevel(relatedProjects.length);
    
    // Size based on proficiency
    let radius;
    if (level === 'Expert') radius = BUBBLE_CONFIG.maxRadius;
    else if (level === 'Advanced') radius = BUBBLE_CONFIG.maxRadius * 0.75;
    else if (level === 'Intermediate') radius = BUBBLE_CONFIG.maxRadius * 0.55;
    else radius = BUBBLE_CONFIG.minRadius;
    
    // Grid-based position with randomness
    const col = i % cols;
    const row = Math.floor(i / cols);
    const centerX = col * cellWidth + cellWidth / 2;
    const centerY = row * cellHeight + cellHeight / 2;
    
    // Add randomness within cell (50% of cell size)
    const offsetX = (Math.random() - 0.5) * cellWidth * 0.5;
    const offsetY = (Math.random() - 0.5) * cellHeight * 0.5;
    
    const x = Math.max(radius + 10, Math.min(canvas.width - radius - 10, centerX + offsetX));
    const y = Math.max(radius + 10, Math.min(canvas.height - radius - 10, centerY + offsetY));
    
    bubbles.push(new SkillBubble(skill, x, y, radius, relatedProjects));
  });

  let mouseX = 0;
  let mouseY = 0;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
  });

  // Collision detection and resolution
  function resolveCollisions() {
    for (let i = 0; i < bubbles.length; i++) {
      for (let j = i + 1; j < bubbles.length; j++) {
        const b1 = bubbles[i];
        const b2 = bubbles[j];
        
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = b1.radius + b2.radius;
        
        if (distance < minDistance) {
          const angle = Math.atan2(dy, dx);
          const overlap = minDistance - distance;
          const moveX = Math.cos(angle) * overlap * 0.5;
          const moveY = Math.sin(angle) * overlap * 0.5;
          
          b1.x -= moveX;
          b1.y -= moveY;
          b2.x += moveX;
          b2.y += moveY;
          
          // Exchange velocities for bounce effect (gentler)
          const tempVx = b1.vx;
          const tempVy = b1.vy;
          b1.vx = b2.vx * 0.5;
          b1.vy = b2.vy * 0.5;
          b2.vx = tempVx * 0.5;
          b2.vy = tempVy * 0.5;
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw bubbles
    bubbles.forEach(bubble => {
      bubble.update(canvas.width, canvas.height, mouseX, mouseY);
    });
    
    // Resolve collisions
    resolveCollisions();
    
    // Draw bubbles (back to front)
    bubbles.forEach(bubble => {
      bubble.draw(ctx);
    });

    // Update tooltip
    const hoveredBubble = bubbles.find(b => b.hovered);
    if (hoveredBubble) {
      const category = hoveredBubble.isNetwork ? 'Network Engineering' : 
                      hoveredBubble.isSoftware ? 'Software Engineering' : 'General';
      const categoryColor = hoveredBubble.isNetwork ? '#ff7a18' : 
                           hoveredBubble.isSoftware ? '#ff2d80' : '#9aa3b8';
      
      tooltip.innerHTML = `
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px;">${hoveredBubble.skill.name}</div>
        <div style="color: ${categoryColor}; font-size: 12px; margin-bottom: 4px; font-weight: 600;">${category}</div>
        <div style="color: #ff7a18; font-size: 12px; margin-bottom: 4px;">Proficiency: ${hoveredBubble.level}</div>
        ${hoveredBubble.projects.length > 0 ? 
          `<div style="font-size: 11px; color: #888; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; margin-top: 6px;">
            <strong>Related Projects:</strong><br/>${hoveredBubble.projects.map(p => p.name).join(', ')}
          </div>` : 
          ''}
      `;
      tooltip.style.left = `${hoveredBubble.x}px`;
      tooltip.style.top = `${hoveredBubble.y - hoveredBubble.radius - 20}px`;
      tooltip.style.opacity = '1';
    } else {
      tooltip.style.opacity = '0';
    }

    requestAnimationFrame(animate);
  }

  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSkillsGlobe);
} else {
  initSkillsGlobe();
}
