const socket = io();

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;

document.querySelector('button').addEventListener('click', () => {
    recognition.start();
});

recognition.addEventListener('result', (event) => {

    let last = event.results.length - 1;
    let text = event.results[last][0].transcript;

    console.log('Confidence: ' + event.results[0][0].confidence);

    socket.emit('chat message', text);

    // We will use the Socket.IO here later…
});

socket.on('AI response', (msg) => {
    console.log('AI response: ' + msg);
    // Add AI message to chat window for checking
    document.querySelector('.chat').innerHTML += `<div class="message ai">${msg}</div>`;
    synthVoice(msg);

});

// function to syntesizing ai response to voice
function synthVoice(text) {
    // access the browser's speech synthesis API
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = text;
    synth.speak(utterance);
}
