// AI-Powered Portfolio Chatbot
class PortfolioChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.portfolioData = {
      skills: [],
      projects: [],
      experience: {
        current: "Network & Telecommunications Assistant at Clark University ITS",
        education: "Master's in Computer Science at Clark University",
        location: "Worcester, MA (Boston area)",
        duration: "Aug 2024 - May 2026",
        certifications: ["CCNA (Cisco Certified Network Associate)", "Cisco Routing & Switching"],
        email: "poornacd24@gmail.com"
      }
    };
    this.init();
  }

  async init() {
    await this.loadPortfolioData();
    this.createChatUI();
    this.addEventListeners();
    this.addWelcomeMessage();
  }

  async loadPortfolioData() {
    try {
      const [skills, projects] = await Promise.all([
        fetch('/skills.json').then(r => r.json()).catch(() => []),
        fetch('/projects/projects.json').then(r => r.json()).catch(() => [])
      ]);
      this.portfolioData.skills = skills;
      this.portfolioData.projects = projects;
    } catch (error) {
      console.log('Error loading portfolio data:', error);
    }
  }

  createChatUI() {
    const chatHTML = `
      <div id="chatbot-container" class="chatbot-container">
        <!-- Chat Button -->
        <button id="chat-toggle" class="chat-toggle" aria-label="Open chat assistant">
          <i class="fas fa-robot"></i>
          <span class="chat-badge">AI</span>
        </button>

        <!-- Chat Window -->
        <div id="chat-window" class="chat-window">
          <div class="chat-header">
            <div class="chat-header-info">
              <i class="fas fa-robot"></i>
              <div>
                <h3>Portfolio Assistant</h3>
                <span class="chat-status">Online • Powered by AI</span>
              </div>
            </div>
            <button id="chat-close" class="chat-close-btn" aria-label="Close chat">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div id="chat-messages" class="chat-messages">
            <!-- Messages will be added here -->
          </div>

          <div class="chat-suggestions" id="chat-suggestions">
            <button class="suggestion-btn" data-question="What are your main skills?">
              💻 Main Skills
            </button>
            <button class="suggestion-btn" data-question="Tell me about your projects">
              🚀 Projects
            </button>
            <button class="suggestion-btn" data-question="What is your experience?">
              💼 Experience
            </button>
            <button class="suggestion-btn" data-question="Schedule a meeting with me">
              📅 Schedule Meeting
            </button>
            <button class="suggestion-btn" data-question="What certifications do you have?">
              🏆 Certifications
            </button>
          </div>

          <div class="chat-input-container">
            <input 
              type="text" 
              id="chat-input" 
              class="chat-input" 
              placeholder="Ask me anything about Poorna..."
              autocomplete="off"
            />
            <button id="chat-send" class="chat-send-btn" aria-label="Send message">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatHTML);
  }

  addEventListeners() {
    const toggleBtn = document.getElementById('chat-toggle');
    const closeBtn = document.getElementById('chat-close');
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    const suggestions = document.querySelectorAll('.suggestion-btn');

    toggleBtn.addEventListener('click', () => this.toggleChat());
    closeBtn.addEventListener('click', () => this.closeChat());
    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    suggestions.forEach(btn => {
      btn.addEventListener('click', () => {
        const question = btn.dataset.question;
        input.value = question;
        this.sendMessage();
      });
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chatWindow = document.getElementById('chat-window');
    const toggleBtn = document.getElementById('chat-toggle');
    
    if (this.isOpen) {
      chatWindow.classList.add('open');
      toggleBtn.classList.add('active');
      document.getElementById('chat-input').focus();
    } else {
      chatWindow.classList.remove('open');
      toggleBtn.classList.remove('active');
    }
  }

  closeChat() {
    this.isOpen = false;
    document.getElementById('chat-window').classList.remove('open');
    document.getElementById('chat-toggle').classList.remove('active');
  }

  addWelcomeMessage() {
    const welcomeMsg = `Hi! 👋 I'm Poorna's AI assistant. I can answer questions about:

• Skills & Technologies
• Projects & Experience
• Education & Certifications
• Contact Information

What would you like to know?`;
    this.addMessage(welcomeMsg, 'bot');
    
    // Add schedule prompt after a delay
    setTimeout(() => {
      this.addMessage("💡 Tip: Click '📅 Schedule Meeting' to book time with me!", 'bot');
    }, 2000);
  }

  sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;

    // Add user message
    this.addMessage(message, 'user');
    input.value = '';

    // Hide suggestions after first message
    document.getElementById('chat-suggestions').style.display = 'none';

    // Show typing indicator
    this.showTypingIndicator();

    // Generate response
    setTimeout(() => {
      this.hideTypingIndicator();
      const response = this.generateResponse(message);
      this.addMessage(response, 'bot');
    }, 800);
  }

  addMessage(text, type) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = type === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = text.replace(/\n/g, '<br>');
    
    // Add schedule button for schedule response
    if (type === 'bot' && text.includes('Schedule a Meeting')) {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'schedule-buttons';
      
      // Google Calendar button
      const calendarBtn = document.createElement('a');
      calendarBtn.href = 'https://calendly.com/poornacd24/30min';
      calendarBtn.className = 'schedule-meeting-btn primary';
      calendarBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Book on Google Calendar';
      calendarBtn.target = '_blank';
      
      // Email button
      const emailBtn = document.createElement('a');
      emailBtn.href = 'mailto:poornacd24@gmail.com?subject=Meeting Request with Poorna&body=Hi Poorna,%0D%0A%0D%0AI would like to schedule a meeting with you.%0D%0A%0D%0APreferred Date/Time:%0D%0AMeeting Topic:%0D%0APreferred Platform (Google Meet/Zoom/Teams):%0D%0ADuration:%0D%0A%0D%0AThank you!';
      emailBtn.className = 'schedule-meeting-btn secondary';
      emailBtn.innerHTML = '<i class="fas fa-envelope"></i> Email Instead';
      emailBtn.target = '_blank';
      
      buttonContainer.appendChild(calendarBtn);
      buttonContainer.appendChild(emailBtn);
      content.appendChild(buttonContainer);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messagesContainer.appendChild(messageDiv);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-avatar"><i class="fas fa-robot"></i></div>
      <div class="message-content">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  generateResponse(message) {
    const lowerMsg = message.toLowerCase();

    // Skills questions
    if (this.matchesPattern(lowerMsg, ['skill', 'technology', 'tech stack', 'programming', 'language', 'what do you know'])) {
      return this.getSkillsResponse(lowerMsg);
    }

    // Projects questions
    if (this.matchesPattern(lowerMsg, ['project', 'built', 'developed', 'work on', 'portfolio'])) {
      return this.getProjectsResponse(lowerMsg);
    }

    // Experience questions
    if (this.matchesPattern(lowerMsg, ['experience', 'work', 'job', 'position', 'role', 'currently working'])) {
      return this.getExperienceResponse();
    }

    // Education questions
    if (this.matchesPattern(lowerMsg, ['education', 'degree', 'university', 'study', 'gpa', 'school'])) {
      return this.getEducationResponse();
    }

    // Certifications
    if (this.matchesPattern(lowerMsg, ['certification', 'certified', 'ccna', 'cisco'])) {
      return this.getCertificationsResponse();
    }

    // Network-specific
    if (this.matchesPattern(lowerMsg, ['network', 'voip', 'vlan', 'wifi', 'routing', 'switching'])) {
      return this.getNetworkSkillsResponse();
    }

    // Software-specific
    if (this.matchesPattern(lowerMsg, ['python', 'javascript', 'react', 'docker', 'software', 'coding'])) {
      return this.getSoftwareSkillsResponse();
    }

    // Contact questions
    if (this.matchesPattern(lowerMsg, ['contact', 'email', 'linkedin', 'github', 'reach', 'hire'])) {
      return this.getContactResponse();
    }

    // Schedule/Meeting questions
    if (this.matchesPattern(lowerMsg, ['schedule', 'meeting', 'appointment', 'call', 'interview', 'talk', 'discuss', 'meet'])) {
      return this.getScheduleResponse();
    }

    // Location
    if (this.matchesPattern(lowerMsg, ['location', 'where', 'live', 'based'])) {
      return "Poorna is currently based in Worcester, MA (Boston area) while pursuing a Master's degree at Clark University. Open to remote opportunities and relocation for full-time positions starting 2026!";
    }

    // Default response
    return this.getDefaultResponse();
  }

  matchesPattern(message, keywords) {
    return keywords.some(keyword => message.includes(keyword));
  }

  getSkillsResponse(message) {
    const topSkills = this.portfolioData.skills.slice(0, 10).map(s => s.name);
    const skillList = topSkills.join(', ');
    
    return `Poorna has expertise in both Network and Software Engineering! 🚀

**Top Skills:**
${skillList}

**Specializations:**
• Network Engineering (CCNA certified)
• Software Development (Python, JavaScript, React)
• Cloud & DevOps (Azure, Docker, Kubernetes)
• Data Engineering (PySpark, Azure Databricks)

Would you like to know about specific projects using these skills?`;
  }

  getProjectsResponse(message) {
    if (this.portfolioData.projects.length === 0) {
      return "Check out the Projects section for detailed information about Poorna's work!";
    }

    const projectList = this.portfolioData.projects.slice(0, 3).map(p => 
      `• **${p.name}**: ${p.desc}`
    ).join('\n\n');

    return `Here are some notable projects:\n\n${projectList}\n\nVisit the Projects section to see more details, including technologies used and live demos!`;
  }

  getExperienceResponse() {
    return `**Current Position:**
Network & Telecommunications Assistant at Clark University ITS
📍 Worcester, MA (Boston area)
🕒 Sep 2025 – Present (Part-time)
🎯 Promoted from Network Engineering Intern

**Career Progression at Clark University:**
→ Network Assistant (Apr 2025 - May 2025)
→ Network Engineering Intern (May 2025 - Sep 2025)  
→ Network & Telecommunications Assistant (Sep 2025 - Present) ✨

**Previous Experience:**
• **Software Engineer** at TEKsystems Global Services (Apr 2024 – Aug 2024, Full-time)
• **Senior Software Engineer** at TEKsystems Global Services (Promoted)
• **Associate Software Engineer** at TEKsystems Global Services

**Key Skills Applied:**
• Enterprise network infrastructure design and implementation
• VoIP, VLAN, WiFi optimization, and network troubleshooting
• Software development and data engineering
• System administration and technical support

Seeking full-time opportunities for May 2026 and beyond - looking to leverage both technical expertise and leadership experience!`;
  }

  getEducationResponse() {
    return `**Current Education:**
🎓 Master's degree in Computer Science
🏛️ Clark University, Worcester, MA
📅 Aug 2024 - May 2026 (Expected Graduation)

**Master's Coursework:**
• Application Engineering & Development
• Program Structures & Algorithms
• Concepts of Object-Oriented Programming (Java)
• Data Management & Database Design
• Network Structures & Cloud Computing
• High Performance Computing / AI (elective)

**Previous Education:**
Bachelor of Engineering (BE) in Information Science and Engineering
Vidyavardhaka College of Engineering, Karnataka, India (2018-2022)

**Bachelor's Core Subjects:**
• Advanced Computer Algorithms
• Information Technology & Computer Networks
• Operating Systems
• Data Structures

**Career Focus:**
Combining academic knowledge with hands-on experience in network engineering, data engineering (Azure Databricks, PySpark), and full-stack software development!`;
  }

  getCertificationsResponse() {
    return `**Certifications:**
🏆 CCNA (Cisco Certified Network Associate)

**Expertise Demonstrated:**
• Enterprise network design and architecture
• Routing protocols (OSPF, EIGRP, BGP)
• Switching technologies and VLANs
• Network security and access control
• WAN technologies and services

**Additional Skills:**
• Cloud platforms (Azure, AWS)
• DevOps tools & practices (Docker, Kubernetes)
• Data engineering (PySpark, Azure Databricks)
• Network troubleshooting and optimization

These certifications validate expertise in designing, implementing, and managing enterprise network infrastructure!`;
  }

  getNetworkSkillsResponse() {
    const networkSkills = this.portfolioData.skills
      .filter(s => ['cisco', 'network', 'voip', 'vlan', 'wifi', 'routing', 'ccna', 'security']
        .some(kw => s.name.toLowerCase().includes(kw)))
      .map(s => s.name)
      .slice(0, 8);

    return `**Network Engineering Expertise:**
${networkSkills.join(' • ')}

Poorna has hands-on experience with:
• Cisco routing & switching infrastructure
• VoIP implementation and troubleshooting
• VLAN configuration and network segmentation
• WiFi optimization and wireless networking
• Network security and firewall management

Check out the network-related projects in the Projects section!`;
  }

  getSoftwareSkillsResponse() {
    const softwareSkills = this.portfolioData.skills
      .filter(s => ['python', 'javascript', 'react', 'docker', 'node', 'sql', 'pyspark', 'azure']
        .some(kw => s.name.toLowerCase().includes(kw)))
      .map(s => s.name)
      .slice(0, 8);

    return `**Software Engineering Skills:**
${softwareSkills.join(' • ')}

**Development Experience:**
• Full-stack web development (React, Node.js)
• Backend systems (Python, APIs)
• Cloud infrastructure (Azure, Docker, Kubernetes)
• Data engineering (PySpark, Azure Databricks)
📧 **Email:** poornacd24@gmail.com
📍 **Location:** Worcester, MA (Boston area)
💼 **LinkedIn:** Visit the footer links
💻 **GitHub:** Explore the repositories
📄 **Resume:** Available for download in the About section

**Availability:**
Seeking full-time opportunities in Network Engineering, Software Engineering, and Data Engineering roles starting 2026. Open to relocation and remote positions!

Feel free to reach out for collaborations, job opportunities, or networking

You can reach Poorna through:
• 📧 Email: Check the Contact section
• 💼 LinkedIn: Visit the footer links
• 💻 GitHub: Explore the repositories
• 📄 Resume: Available for download

Poorna is actively seeking opportunities in Software and Network Engineering roles. Feel free to reach out for collaborations or job opportunities!`;
  }

  getDefaultResponse() {
    return `I'm here to help! I can answer questions about:

• 💻 Technical skills and expertise
• 🚀 Projects and achievements
• 💼 Work experience and roles
• 🎓 Education and certifications
• 📞 Contact information

Try asking something specific, or click one of the suggestion buttons below!`;
  }

  getScheduleResponse() {
    return `
      <div style="line-height: 1.6;">
        <strong>Schedule a Meeting with Poorna:</strong><br><br>
        📅 <a href="https://calendly.com/your-username/event-name" target="_blank">Book a time on Calendly</a>
      </div>
    `;
  }

  getContactResponse() {
    return `You can reach Poorna through the following channels:

📧 <strong>Email:</strong> <a href="mailto:poornacd24@gmail.com">poornacd24@gmail.com</a><br>
💼 <strong>LinkedIn:</strong> <a href="www.linkedin.com/in/poorna-chandra-dinesh" target="_blank">Visit LinkedIn Profile</a><br>
💻 <strong>GitHub:</strong> <a href="https://github.com/Poorna-Chandra-D" target="_blank">Explore GitHub Repositories</a><br>
📄 <strong>Resume:</strong> Available for download in the About section<br><br>
Feel free to reach out for collaborations, job opportunities, or networking!`;
  }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PortfolioChatbot());
} else {
  new PortfolioChatbot();
}
