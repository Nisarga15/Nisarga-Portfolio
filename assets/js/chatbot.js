// AI-Powered Portfolio Chatbot
class PortfolioChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.portfolioData = {
      skills: [],
      projects: [],
      experience: {
        current: "Data Analyst Intern at Metropolitan Transportation Authority (MTA)",
        education: "MS in Computer Science (STEM) at Pace University, 4.0 GPA",
        location: "New York, NY",
        duration: "Aug 2024 - May 2026",
        certifications: ["Azure Fundamentals (AZ-900)", "Azure Developer Associate (AZ-204)"],
        email: "nisargavgowda15@gmail.com"
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
              placeholder="Ask me anything about Nisarga..."
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
    const welcomeMsg = `Hi! 👋 I'm Nisarga's AI assistant. I can answer questions about:

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
      calendarBtn.href = 'https://calendly.com/nisargavgowda15/30min';
      calendarBtn.className = 'schedule-meeting-btn primary';
      calendarBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Book on Google Calendar';
      calendarBtn.target = '_blank';

      // Email button
      const emailBtn = document.createElement('a');
      emailBtn.href = 'mailto:nisargavgowda15@gmail.com?subject=Meeting Request with Nisarga&body=Hi Nisarga,%0D%0A%0D%0AI would like to schedule a meeting with you.%0D%0A%0D%0APreferred Date/Time:%0D%0AMeeting Topic:%0D%0APreferred Platform (Google Meet/Zoom/Teams):%0D%0ADuration:%0D%0A%0D%0AThank you!';
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
    if (this.matchesPattern(lowerMsg, ['certification', 'certified', 'azure', 'microsoft'])) {
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
      return "Nisarga is currently based in New York, NY while pursuing a Master's degree at Pace University. Open to remote opportunities and relocation for full-time positions starting 2026!";
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

    return `Nisarga has expertise in both Network and Software Engineering! 🚀

**Top Skills:**
${skillList}

**Specializations:**
• Software Development (Azure certified)
• Software Development (Python, JavaScript, React)
• Cloud & DevOps (Azure, Docker, Kubernetes)
• AI Tools Engineering (PySpark, Azure Databricks)

Would you like to know about specific projects using these skills?`;
  }

  getProjectsResponse(message) {
    if (this.portfolioData.projects.length === 0) {
      return "Check out the Projects section for detailed information about Nisarga's work!";
    }

    const projectList = this.portfolioData.projects.slice(0, 3).map(p =>
      `• **${p.name}**: ${p.desc}`
    ).join('\n\n');

    return `Here are some notable projects:\n\n${projectList}\n\nVisit the Projects section to see more details, including technologies used and live demos!`;
  }

  getExperienceResponse() {
    return `**Current Position:**
Data Analyst Intern (Systems & Backend Focus) at MTA
📍 New York, NY
🕒 July 2025 – Present

**Career Timeline:**
• **Data Analyst Intern** at Metropolitan Transportation Authority (MTA) — July 2025 – Present
• **Software Developer (Client: AT&T)** at IBM — April 2023 – August 2024
• **Software Developer (Client: McLaren, Isuzu)** at Chipsync Technologies — May 2022 – March 2023
• **Software Development Intern** at SandLogic — July 2021 – Feb 2022
• **Web Development Intern** at United Dimensions — July 2021 – Sep 2021

**Key Skills Applied:**
• Python-based backend ingestion and data processing
• Enterprise cloud migration and CI/CD pipeline engineering
• Real-time reporting and operational monitoring
• Backend services using Python, Java, Node.js, .NET Core

Seeking full-time opportunities for May 2026 and beyond!`;
  }

  getEducationResponse() {
    return `**Current Education:**
🎓 Master's degree in Computer Science
🏛️ Pace University, New York, NY
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
Combining academic knowledge with hands-on experience in software development, data analytics, and cloud engineering!`;
  }

  getCertificationsResponse() {
    return `**Certifications:**
🏆 Microsoft Certified: Azure Fundamentals (AZ-900)
🏆 Microsoft Certified: Azure Developer Associate (AZ-204)
📜 Internshala Python Certification

**Publication:**
📄 "Detection Of Alzheimer's Disease from MRI Scan using Machine Learning" — IJRASET (Paper Id: IJRASET45831)

**Expertise Demonstrated:**
• Cloud platforms (Azure, AWS, GCP)
• Backend development (Python, Java, .NET Core)
• CI/CD pipelines and DevOps practices
• Data analytics and SQL databases

These certifications validate expertise in cloud computing and software development!`;
  }

  getNetworkSkillsResponse() {
    const networkSkills = this.portfolioData.skills
      .filter(s => ['python', 'java', 'cloud', 'aws', 'azure', 'docker', 'ci/cd', 'backend']
        .some(kw => s.name.toLowerCase().includes(kw)))
      .map(s => s.name)
      .slice(0, 8);

    return `**Network Engineering Expertise:**
${networkSkills.join(' • ')}

Nisarga has hands-on experience with:
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
📧 **Email:** nisargavgowda15@gmail.com
📍 **Location:** New York, NY
💼 **LinkedIn:** Visit the footer links
💻 **GitHub:** Explore the repositories
📄 **Resume:** Available for download in the About section

**Availability:**
Seeking full-time opportunities in Software Development, Data Analytics, and Backend Engineering roles starting 2026. Open to relocation and remote positions!

Feel free to reach out for collaborations, job opportunities, or networking

You can reach Nisarga through:
• 📧 Email: Check the Contact section
• 💼 LinkedIn: Visit the footer links
• 💻 GitHub: Explore the repositories
• 📄 Resume: Available for download

Nisarga is actively seeking opportunities in Software Development and Data Analytics roles. Feel free to reach out for collaborations or job opportunities!`;
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
        <strong>Schedule a Meeting with Nisarga:</strong><br><br>
        📅 <a href="https://calendly.com/your-username/event-name" target="_blank">Book a time on Calendly</a>
      </div>
    `;
  }

  getContactResponse() {
    return `You can reach Nisarga through the following channels:

📧 <strong>Email:</strong> <a href="mailto:nisargavgowda15@gmail.com">nisargavgowda15@gmail.com</a><br>
💼 <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/nisarga-vishwamanjuswamy/" target="_blank">Visit LinkedIn Profile</a><br>
💻 <strong>GitHub:</strong> <a href="https://github.com/Nisarga15" target="_blank">Explore GitHub Repositories</a><br>
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
