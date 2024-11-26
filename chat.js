// Store API keys securely
const GEMINI_API_KEY = 'AIzaSyC1JkdhJdTUgPNfCJqegucnj9EjIb4a1L4'; // Replace with your Gemini API key
const GROQ_API_KEY = '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'; // Replace with your Groq API key

// API URLs
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Current model state
let currentModel = 'gemini';

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const modelSwitch = document.getElementById('model-switch');
const resetChat = document.getElementById('reset-chat');

// Model switch handler
modelSwitch.addEventListener('click', () => {
    currentModel = currentModel === 'gemini' ? 'groq' : 'gemini';
    
    // Create and show notification
    const notification = document.createElement('div');
    notification.className = 'model-notification';
    notification.innerHTML = `
        <i class="fas fa-exchange-alt"></i>
        Switched to ${currentModel.charAt(0).toUpperCase() + currentModel.slice(1)} model
    `;
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove notification after 2 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
});

// Reset chat handler
resetChat.addEventListener('click', () => {
    // Clear conversation history
    conversationHistory = [];
    
    // Get all messages except the first one (initial greeting)
    const messages = Array.from(chatMessages.children).slice(1);
    
    // Add fade-out animation to each message
    messages.forEach((message, index) => {
        // Stagger the animation slightly for each message
        setTimeout(() => {
            message.classList.add('fade-out');
        }, index * 50);
    });
    
    // Remove messages after animation completes
    setTimeout(() => {
        while (chatMessages.children.length > 1) {
            chatMessages.removeChild(chatMessages.lastChild);
        }
    }, (messages.length * 50) + 300); // Wait for all animations to complete
    
    // Clear input
    userInput.value = '';
    userInput.style.height = 'auto';
});

// Conversation history
let conversationHistory = [];

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Handle enter key
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Handle send button click
sendButton.addEventListener('click', sendMessage);

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat and history
    addMessageToChat('user', message);
    conversationHistory.push({ role: 'user', parts: [{ text: message }] });
    userInput.value = '';
    userInput.style.height = 'auto';

    try {
        // Show loading indicator
        const loadingMessage = addMessageToChat('ai', 'Thinking...');
        
        let response;
        let aiResponse;

        if (currentModel === 'gemini') {
            // Send request to Gemini API
            response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: conversationHistory
                })
            });

            const data = await response.json();
            aiResponse = data.candidates[0].content.parts[0].text;
        } else {
            // Send request to Groq API
            response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'mixtral-8x7b-32768',
                    messages: conversationHistory.map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: msg.parts[0].text
                    })),
                    temperature: 0.7,
                    max_tokens: 32768
                })
            });

            const data = await response.json();
            aiResponse = data.choices[0].message.content;
        }

        // Update the loading message with the AI's response
        loadingMessage.innerHTML = marked.parse(aiResponse);
        
        // Add AI response to conversation history
        conversationHistory.push({ role: 'model', parts: [{ text: aiResponse }] });

    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('ai', 'Sorry, I encountered an error. Please try again.');
    }
}

function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Use marked to render markdown for AI messages, plain text for user
    if (role === 'ai') {
        contentDiv.innerHTML = marked.parse(content);
    } else {
        contentDiv.textContent = content;
    }

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return contentDiv;
}

// Add loading animation
function addLoadingAnimation() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message loading';
    loadingDiv.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingDiv;
}
