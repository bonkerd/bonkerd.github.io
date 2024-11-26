// Store API key securely
const GEMINI_API_KEY = 'AIzaSyC1JkdhJdTUgPNfCJqegucnj9EjIb4a1L4'; // Replace with your Gemini API key
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

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
        
        // Send request to Gemini API with conversation history
        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: conversationHistory
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        // Update the loading message with the AI's response
        loadingMessage.textContent = aiResponse;
        
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
