let currentUtterance = null;

export function stopSpeech() {
  if (currentUtterance) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function speakText({ text, voice, onEnd }) {
  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 1;
  utterance.pitch = 1;

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}
