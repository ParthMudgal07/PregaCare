const API_BASE = "http://127.0.0.1:8000";
let currentReport = null;
let chatHistory = [];

// Elements
const assessForm = document.getElementById('assessment-form');
const reportSection = document.getElementById('report-section');
const chatSection = document.getElementById('chat-section');
const chatForm = document.getElementById('chat-form');
const chatWindow = document.getElementById('chat-window');

// 1. ASSESSMENT HANDLER
assessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-assess');
    btn.disabled = true;
    btn.innerText = "Analyzing...";

    const payload = {
        vitals: {
            Age: parseFloat(document.getElementById('age').value),
            SystolicBP: parseFloat(document.getElementById('systolic').value),
            DiastolicBP: parseFloat(document.getElementById('diastolic').value),
            BS: parseFloat(document.getElementById('bs').value),
            BodyTemp: parseFloat(document.getElementById('temp').value),
            HeartRate: parseFloat(document.getElementById('hr').value)
        },
        district: document.getElementById('district').value,
        state: document.getElementById('state').value
    };

    try {
        const response = await fetch(`${API_BASE}/assess`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (response.ok) {
            currentReport = data;
            displayReport(data);
        } else {
            alert("Error: " + data.detail);
        }
    } catch (err) {
        alert("Failed to connect to backend: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Generate Risk Report";
    }
});

function displayReport(data) {
    reportSection.classList.remove('hidden');
    chatSection.classList.remove('hidden');

    document.getElementById('combined-score').innerText = data.combined_score;
    document.getElementById('health-score').innerText = data.individual_health_score;
    document.getElementById('safety-index').innerText = data.regional_safety_index;
    document.getElementById('suggested-action').innerText = data.suggested_action;

    const badge = document.getElementById('risk-badge');
    badge.innerText = data.risk_band;
    badge.className = 'badge ' + data.risk_band.split(' ')[0].toLowerCase();

    reportSection.scrollIntoView({ behavior: 'smooth' });
}

// 2. CHAT HANDLER
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const query = input.value.trim();
    if (!query || !currentReport) return;

    addMessage(query, 'user');
    input.value = '';

    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_query: query,
                assessment_report: currentReport,
                chat_history: chatHistory
            })
        });

        const data = await response.json();
        if (response.ok) {
            addMessage(data.response, 'assistant');
            chatHistory.push({ role: 'user', content: query });
            chatHistory.push({ role: 'assistant', content: data.response });
        } else {
            addMessage("Sorry, I encountered an error: " + data.detail, 'assistant');
        }
    } catch (err) {
        addMessage("Connection error: " + err.message, 'assistant');
    }
});

function addMessage(text, role) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerText = text;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
