require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxies AI calls to Anthropic so the API key never reaches the browser.
// Proxies AI calls to Gemini or Anthropic, and falls back to a smart mock generator if no key is present.
app.post('/api/ai', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    console.log(`[AI Request] Prompt received (length: ${prompt.length})`);

    // Helper for mock fallback
    const getMockResponse = (pr) => {
      const prLower = pr.toLowerCase();
      
      // 1. Session Summary
      if (prLower.includes("session summary") || prLower.includes("the teacher")) {
        let teacher = "Your partner";
        let skill = "the skill";
        const teacherMatch = pr.match(/The teacher ([^]+?) taught/i);
        if (teacherMatch) teacher = teacherMatch[1].trim();
        const skillMatch = pr.match(/taught ([^]+?) to/i);
        if (skillMatch) skill = skillMatch[1].trim();

        return `It was a great session today! ${teacher} walked through the core concepts of ${skill}, explaining the initial setup and basic patterns. We practiced several hands-on examples together, troubleshooting small syntax details along the way. For homework, try implementing a small project using what we covered. Next session, we'll dive deeper and look into optimization and advanced use-cases.`;
      }
      
      // 2. Personalized Roadmap
      if (prLower.includes("personalized roadmap") || prLower.includes("learning goal") || prLower.includes("missing skills")) {
        let goal = "your learning goal";
        const goalMatch = pr.match(/goal: "([^"]+)"/i);
        if (goalMatch) goal = goalMatch[1].trim();

        const goalLower = goal.toLowerCase();
        if (goalLower.includes("machine learning") || goalLower.includes("ml") || goalLower.includes("ai")) {
          return `Missing Skills:
- Linear Algebra & Probability
- Scikit-Learn & regression algorithms
- Neural Networks (PyTorch/TensorFlow)
- MLOps & model hosting

4-Week Roadmap:
Week 1: Master data manipulation using Pandas, NumPy, and clean real datasets.
Week 2: Learn supervised learning theory and implement basic classifiers with Scikit-Learn.
Week 3: Deep dive into neural networks and learn the basics of PyTorch or TensorFlow.
Week 4: Build a complete end-to-end ML pipeline and deploy it as a simple API web service.`;
        } else if (goalLower.includes("web") || goalLower.includes("javascript") || goalLower.includes("frontend") || goalLower.includes("react")) {
          return `Missing Skills:
- Advanced CSS Grid/Flexbox
- DOM manipulation & modern JS (ES6+)
- Frontend Frameworks (React, Vue, or Svelte)
- Git & deployment services (Netlify/Vercel)

4-Week Roadmap:
Week 1: Solidify semantic HTML structure and build fully responsive CSS layouts.
Week 2: Study JavaScript ES6+ features, fetch APIs, and state handling.
Week 3: Choose a framework (like React) and build a multi-page dashboard.
Week 4: Integrate a backend API, write unit tests, and deploy your site to production.`;
        } else if (goalLower.includes("python") || goalLower.includes("programming") || goalLower.includes("backend")) {
          return `Missing Skills:
- Object-Oriented Programming (OOP)
- Database management (SQL & ORMs)
- REST API design (Express/Flask)
- Test-driven development (TDD)

4-Week Roadmap:
Week 1: Learn core programming logic, variables, data structures, and functions.
Week 2: Study object-oriented concepts, error handling, and file input/output.
Week 3: Connect your code to a database and design endpoints using Flask/Express.
Week 4: Write unit tests, secure your API routes, and deploy the backend container.`;
        } else if (goalLower.includes("ui") || goalLower.includes("design") || goalLower.includes("figma") || goalLower.includes("ux")) {
          return `Missing Skills:
- Typography hierarchy & color theory
- Auto-layout & component library creation in Figma
- Wireframing & user testing methodologies
- Design handoff specifications

4-Week Roadmap:
Week 1: Study visual principles (contrast, alignment, grids) and recreate premium layouts.
Week 2: Master Figma auto-layout, components, variants, and interactive prototyping.
Week 3: Conduct a user research session, sketch wireframes, and design a high-fidelity application.
Week 4: Define a style guide, document design decisions, and practice developer handoff.`;
        } else {
          return `Missing Skills:
- Foundational theory & terminologies
- Practical tools and workspace environment
- Core workflows and best practices
- Portfolio project creation

4-Week Roadmap:
Week 1: Learn the basics, terminology, and set up your development/design workspace.
Week 2: Study fundamental concepts and follow step-by-step beginner tutorials.
Week 3: Work on your first guided project, applying what you've learned.
Week 4: Build a small independent project, document your process, and share it with peers.`;
        }
      }
      
      // 3. AI Learning Assistant
      if (prLower.includes("ai learning assistant") || prLower.includes("learner's question")) {
        let question = "";
        const questionMatch = pr.match(/markdown symbols:\s*"([^"]+)"/i) || pr.match(/symbols:\s*"([^"]+)"/i) || pr.match(/"([^"]+)"\s*$/);
        if (questionMatch) question = questionMatch[1].trim();

        const qLower = question.toLowerCase();
        if (qLower.includes("python") || qLower.includes("loop") || qLower.includes("list")) {
          return `Python is a high-level, readable language. For lists, you can append elements, slice them, or iterate through them using loops. For example, 'for item in my_list:' is the standard way to loop. If you are struggling with a specific script, write a small test block or print variables to understand how data flows. You can find excellent Python mentors in the Matches tab on SkillSphere who would be glad to do a live coding session with you!`;
        } else if (qLower.includes("react") || qLower.includes("state") || qLower.includes("props")) {
          return `React uses state to store component-specific data that changes over time, and props to pass data down from parent to child components. When state changes, React automatically re-renders the component. Remember to never mutate state directly; always use the state setter function returned by the useState hook. Find a peer in the Programming category here to co-create a simple React app together!`;
        } else if (qLower.includes("git") || qLower.includes("commit") || qLower.includes("push")) {
          return `Git is a version control system. Use 'git init' to start a repo, 'git add' to stage files, 'git commit' to save your changes locally, and 'git push' to upload them to a remote server like GitHub. If you encounter conflicts, Git will highlight the differences in the file; you simply choose which version to keep, commit again, and push. Practice this with a study partner in a shared project!`;
        } else if (qLower.includes("peer") || qLower.includes("exchange") || qLower.includes("learn") || qLower.includes("teach") || qLower.includes("work")) {
          return `SkillSphere works by matching your teaching skills with another user's learning goals. When you find a match, send a request. Once they accept, you can message them in the Chat tab and schedule a video or audio learning session under the Sessions tab. We recommend spending half the session learning their skill, and the other half teaching yours!`;
        } else if (question) {
          return `That is a great learning question! To master this topic, I recommend breaking it down into smaller components. Start by reading basic documentation, practice with a small project, and use the Matches tab to connect with an expert in the SkillSphere community who can guide you. Teaching someone else what you learn is also a proven way to solidify your understanding!`;
        } else {
          return `Hello! I am your SkillSphere AI Assistant. I can help you analyze skill gaps, design custom learning roadmaps, explain programming concepts, or offer study guidance. What skill or concept are you trying to learn today?`;
        }
      }

      return "I'm here to help you exchange skills and learn. Let me know what you want to cover today!";
    };

    // 1. Check if Gemini API key exists
    if (process.env.GEMINI_API_KEY) {
      console.log('Using Gemini API key to generate response...');
      try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1000 }
          })
        });
        const data = await geminiResponse.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log('Gemini API call succeeded.');
          return res.json({ text: text.trim() });
        } else {
          console.warn('Gemini response format unexpected:', data);
        }
      } catch (err) {
        console.error('Gemini API call failed, falling back to mock:', err);
      }
    }

    // 2. Check if Anthropic API key exists
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_api_key_here') {
      console.log('Using Anthropic API key to generate response...');
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-latest',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        const data = await response.json();
        if (data.error) {
          console.warn('Anthropic API error response, falling back to mock:', data.error.message);
        } else {
          const text = (data.content || [])
            .map((block) => block.text || '')
            .join('\n')
            .trim();
          if (text) {
            console.log('Anthropic API call succeeded.');
            return res.json({ text });
          }
        }
      } catch (err) {
        console.error('Anthropic API call failed, falling back to mock:', err);
      }
    }

    // 3. Fallback to mock response
    console.log('Using smart local mock generator...');
    const mockText = getMockResponse(prompt);
    res.json({ text: mockText });

  } catch (err) {
    console.error('AI proxy error:', err);
    res.status(500).json({ error: 'Something went wrong calling the AI service.' });
  }
});

// Fallback to index.html for any other route (simple SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SkillSphere running at http://localhost:${PORT}`);
});
