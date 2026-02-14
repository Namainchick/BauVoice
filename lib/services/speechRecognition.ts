/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SpeechRecognitionCallbacks {
  onResult: (transcript: string, isFinal: boolean) => void;
  onEnd: () => void;
  onError: (error: string) => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function createSpeechRecognition(
  callbacks: SpeechRecognitionCallbacks
): any | null {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognitionAPI =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognitionAPI();

  recognition.lang = 'de-DE';
  recognition.continuous = true;
  recognition.interimResults = true;

  let finalTranscript = '';

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript + ' ';
        callbacks.onResult(finalTranscript.trim(), true);
      } else {
        interimTranscript += result[0].transcript;
        callbacks.onResult(finalTranscript + interimTranscript, false);
      }
    }
  };

  recognition.onend = () => {
    callbacks.onEnd();
  };

  recognition.onerror = (event: any) => {
    callbacks.onError(event.error);
  };

  return recognition;
}
