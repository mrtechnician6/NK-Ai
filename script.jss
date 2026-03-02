const API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with your actual key
const chatBox = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const typingIndicator = document.getElementById('typing-indicator');

// --- Memory & Onboarding Management ---
let userProfile = JSON.parse(localStorage.getItem('nk_user_profile')) || null;
let onboardingStep = 0;
const onboardingQuestions = [
    "What is your current primary role or occupation?",
    "What are your top 3 goals for the next six months?",
    "What is the biggest challenge you are currently facing?",
    "How do you prefer to receive advice? (Direct or Empathetic?)"
];

window.onload = () => {
    if (!userProfile) {
        addMessage("ai", "Welcome to NK AI. I am your Universal Mentor. To begin, let's get to know you. " + onboardingQuestions[0]);
    } else {
        addMessage("ai", `Welcome back! How can I help you progress toward your goals today?`);
    }
};

// --- Core Send Function ---
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage("user", text);
    userInput.value = "";

    if (!userProfile) {
        processOnboarding(text);
    } else {
        await callAI(text);
    }
}

// --- Onboarding Logic ---
function processOnboarding(text) {
    if (!userProfile) userProfile = {};
    const keys = ["role", "goals", "challenge", "style"];
    userProfile[keys[onboardingStep]] = text;
    onboardingStep++;

    if (onboardingStep < onboardingQuestions.length) {
        addMessage("ai", onboardingQuestions[onboardingStep]);
    } else {
        localStorage.setItem('nk_user_profile', JSON.stringify(userProfile));
        addMessage("ai", "Profile synchronized. I am now configured as your strategist. What is our first objective?");
    }
}

// --- AI Backend Call (Triple-Response Framework) ---
async function callAI(prompt) {
    typingIndicator.classList.remove('hidden');
    
    const systemInstruction = `
        You are NK AI, a Universal Mentor. User Profile: ${JSON.stringify(userProfile)}.
        For every response, follow the Triple-Response Framework:
        1. THE PATH: Step-by-step action plan.
        2. THE INSIGHT: Psychological/philosophical perspective.
        3. THE BRAINSTORM: 3 outside-the-box ideas.
        Tone: ${userProfile.style}. Be concise.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemInstruction + "\nUser asks: " + prompt }] }]
            })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        addMessage("ai", aiText);
    } catch (error) {
        addMessage("ai", "Error: The system encountered a connection issue. Please check your API key or network.");
        console.error("Stability Error:", error);
    } finally {
        typingIndicator.classList.add('hidden');
    }
}

// UI Helper functions (addMessage, resetProfile, drawer toggle) would go here...
