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

// Add event listener for all links in chat messages
chatMessages.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        e.preventDefault();
        window.open(e.target.href, '_blank', 'noopener,noreferrer');
    }
});

// Add initial message about model switching
const modelSwitchMessage = document.createElement('div');
modelSwitchMessage.className = 'message ai-message';
modelSwitchMessage.innerHTML = `
    <div class="message-content">You can switch between Gemini and Groq models using the switch button in the top right. 
Each model has different capabilities and memory limits:
• Gemini: Up to 20 messages (10 user + 10 AI)
• Groq / Mistral: Up to 10 messages (5 user + 5 AI)</div>
`;
chatMessages.appendChild(modelSwitchMessage);

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
    
    // Get all messages except the first two (initial greeting and model info)
    const messages = Array.from(chatMessages.children).slice(2);
    
    // Add fade-out animation to each message
    messages.forEach((message, index) => {
        // Stagger the animation slightly for each message
        setTimeout(() => {
            message.classList.add('fade-out');
        }, index * 50);
    });
    
    // Remove messages after animation completes
    setTimeout(() => {
        while (chatMessages.children.length > 2) {
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

    // Disable input and send button while processing
    userInput.disabled = true;
    sendButton.disabled = true;
    userInput.style.opacity = '0.5';
    sendButton.style.opacity = '0.5';

    // Add user message to chat and history
    addMessageToChat('user', message);
    conversationHistory.push({ role: 'user', parts: [{ text: message }] });
    
    // Different limits for each model
    const messageLimit = currentModel === 'gemini' ? 20 : 10; // 20 for Gemini (10 exchanges), 10 for Groq (5 exchanges)
    
    // Limit conversation history based on current model
    if (conversationHistory.length > messageLimit) {
        conversationHistory = conversationHistory.slice(-messageLimit);
        
        // Also remove older messages from the chat display
        while (chatMessages.children.length > messageLimit + 2) { // +2 for the initial greeting and model info messages
            chatMessages.removeChild(chatMessages.children[2]); // Remove the third element (after greeting and model info)
        }
    }
    
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
        // Update the loading message with the error
        loadingMessage.textContent = 'An error occurred while processing your message. Please try again.';
    } finally {
        // Re-enable input and send button after processing
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.style.opacity = '1';
        sendButton.style.opacity = '1';
        // Focus the input field
        userInput.focus();
    }
}

function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Use marked to render markdown for AI messages, plain text for user
    if (role === 'user') {
        contentDiv.textContent = content;
    } else {
        contentDiv.innerHTML = marked.parse(content);
        // Make all links open in new tabs for AI/model messages
        const links = contentDiv.getElementsByTagName('a');
        for (let link of links) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
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
