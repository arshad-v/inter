import React, { useState, useEffect, useRef, useCallback } from 'react';

interface InterviewScreenProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  onSubmitAnswer: (answer: string, videoDataUrl?: string) => void;
}

// Check for Web Speech API vendor prefixes
// Use SpeechRecognitionAPI to avoid conflict with the SpeechRecognition interface type
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

export const InterviewScreen: React.FC<InterviewScreenProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onSubmitAnswer,
}) => {
  const [answer, setAnswer] = useState<string>(''); // Stores final transcribed answer
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
  // Camera & Video Recording state
  const [isCameraMicEnabled, setIsCameraMicEnabled] = useState<boolean>(false);
  const [cameraMicError, setCameraMicError] = useState<string | null>(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false); // Specifically for video
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // TTS & STT State
  const [isAISpeaking, setIsAISpeaking] = useState<boolean>(false);
  const [isListeningSTT, setIsListeningSTT] = useState<boolean>(false); // User speaking, STT active
  const [sttError, setSttError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>(''); // Live STT results
  const finalTranscriptRef = useRef<string>(''); // Accumulates final STT segments
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null); // Type is now global SpeechRecognition interface
  const ttsError = useRef<string | null>(null);


  // Initialize SpeechRecognition
  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      setSttError("Speech recognition is not supported by your browser. Please try on a different browser like Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => { // Type is now global SpeechRecognitionEvent
      let currentInterim = '';
      let currentFinal = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(finalTranscriptRef.current + currentInterim);
      if (currentFinal) {
        finalTranscriptRef.current += currentFinal.trim() + ' '; // Add space after each final segment
        setAnswer(finalTranscriptRef.current.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => { // Type is now global SpeechRecognitionErrorEvent
      console.error("Speech recognition error:", event.error, event.message);
      let errorMsg = `Speech recognition error: ${event.error}.`;
      if (event.error === 'no-speech') {
        errorMsg = "No speech was detected. Please try speaking louder or closer to the microphone.";
      } else if (event.error === 'audio-capture') {
        errorMsg = "Audio capture failed. Please ensure your microphone is working and permissions are granted.";
      } else if (event.error === 'not-allowed') {
        errorMsg = "Microphone access was denied. Please grant permission to use this feature.";
      }
      setSttError(errorMsg);
      setIsListeningSTT(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop(); // Stop video if STT fails
      }
    };
    
    recognition.onend = () => {
      // If STT stops while we expect it to be listening (e.g., due to long silence with continuous=false, or error)
      // For continuous=true, this usually means it was explicitly stopped or an error occurred.
      // We handle explicit stop in handleToggleRecording.
      // If it stops unexpectedly, isListeningSTT might still be true. We can reset it here or rely on error handler.
       if(isListeningSTT && !isSubmitting) { // Stopped unexpectedly
         // setIsListeningSTT(false); // Can be uncommented if needed
       }
    };
    speechRecognitionRef.current = recognition;

    // TTS support check
    if (!('speechSynthesis' in window)) {
        ttsError.current = "Speech synthesis (AI speaking) is not supported by your browser.";
    }
    
    return () => { // Cleanup
      speechRecognitionRef.current?.abort(); // Use abort to stop immediately
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      window.speechSynthesis?.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount, SpeechRecognitionAPI is stable

  // Speak question & reset states
  useEffect(() => {
    setIsMounted(false); // For animation
    const mountTimer = setTimeout(() => setIsMounted(true), 10);
    
    setAnswer('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    setIsSubmitting(false);
    setSttError(null); // Clear STT error for new question

    if (question && 'speechSynthesis' in window && isCameraMicEnabled) {
      window.speechSynthesis.cancel(); // Cancel any previous speech
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.lang = 'en-US';
      utterance.pitch = 1;
      utterance.rate = 0.95; // Slightly slower for clarity
      utterance.onstart = () => setIsAISpeaking(true);
      utterance.onend = () => setIsAISpeaking(false);
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsAISpeaking(false);
        ttsError.current = `Error speaking question: ${event.error}. You can still read the question.`;
      };
      window.speechSynthesis.speak(utterance);
    }
    
    return () => clearTimeout(mountTimer);
  }, [question, isCameraMicEnabled]); // Rerun when question changes or camera/mic status changes

  const requestCameraMicPermissions = async () => {
    setCameraMicError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn("Video play interrupted or failed:", e));
        }
        setIsCameraMicEnabled(true);
      } catch (err) {
        console.error("Error accessing camera/microphone:", err);
        let errorMsg = "Could not access camera/microphone.";
        if (err instanceof Error) {
            if (err.name === "NotAllowedError" || err.message.includes("Permission denied")) {
                errorMsg = "Permission for camera/microphone was denied. Please grant access in your browser settings.";
            } else if (err.name === "NotFoundError" || err.message.includes("not found")) {
                errorMsg = "No camera/microphone found. Please ensure they are connected and enabled.";
            } else if (err.name === "NotReadableError" || err.message.includes("hardware error")) {
                 errorMsg = "Camera/microphone is already in use by another application or a hardware error occurred.";
            }
        }
        setCameraMicError(errorMsg);
        setIsCameraMicEnabled(false);
      }
    } else {
      setCameraMicError("Camera/microphone access is not supported by your browser.");
      setIsCameraMicEnabled(false);
    }
  };

  const startVideoRecording = () => {
    if (streamRef.current && isCameraMicEnabled) {
      recordedChunksRef.current = [];
      const options = { mimeType: 'video/webm; codecs=vp9' };
      try {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      } catch (e) {
        console.warn(`Preferred mimeType ${options.mimeType} not supported, trying default webm.`);
        try {
            mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
        } catch (e2) {
             console.warn(`video/webm also not supported, trying without specific mimeType.`);
             mediaRecorderRef.current = new MediaRecorder(streamRef.current); // Browser default
        }
      }
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.start();
      setIsRecordingVideo(true);
    }
  };

  const handleToggleRecording = async () => {
    if (isAISpeaking) return;

    if (isListeningSTT) { // === Stop Recording & Submit ===
      setIsSubmitting(true);
      setIsListeningSTT(false);
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop(); // STT onresult/onend will handle final transcript
      }

      let videoDataUrl: string | undefined = undefined;
      if (isRecordingVideo && mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        videoDataUrl = await new Promise<string | undefined>((resolve) => {
          mediaRecorderRef.current!.onstop = () => {
            setIsRecordingVideo(false);
            const mimeType = mediaRecorderRef.current?.mimeType || 'video/webm'; // Use actual mimeType
            const videoBlob = new Blob(recordedChunksRef.current, { type: mimeType });
            recordedChunksRef.current = []; // Clear for next recording
            if (videoBlob.size > 0) {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = () => { console.error("FileReader error"); resolve(undefined); };
              reader.readAsDataURL(videoBlob);
            } else {
              resolve(undefined);
            }
          };
          mediaRecorderRef.current!.stop();
        });
      } else {
         setIsRecordingVideo(false); // Ensure this is reset
      }
      
      // Use the 'answer' state which should be updated by STT's final result.
      // Or finalTranscriptRef.current if 'answer' state update is delayed.
      const finalAnswer = answer.trim() || finalTranscriptRef.current.trim();
      onSubmitAnswer(finalAnswer, videoDataUrl);
      // States will be reset by the useEffect hook when the question changes.
      // Explicitly clear finalTranscriptRef for robustness before next recording
      finalTranscriptRef.current = ''; 
      setInterimTranscript('');


    } else { // === Start Recording ===
      if (!isCameraMicEnabled || !streamRef.current) {
        setCameraMicError("Please enable camera and microphone first.");
        return;
      }
      if (!speechRecognitionRef.current) {
        setSttError("Speech recognition is not initialized. Please refresh.");
        return;
      }

      setSttError(null);
      setInterimTranscript('');
      finalTranscriptRef.current = '';
      setAnswer('');

      try {
        speechRecognitionRef.current.start();
        setIsListeningSTT(true);
        startVideoRecording(); // Start video recording along with STT
      } catch (e) {
        console.error("STT start error:", e);
        setSttError("Could not start speech recognition. Check mic permissions and ensure no other tab is using it.");
        setIsListeningSTT(false);
      }
    }
  };
  
  const disableInteractions = isAISpeaking || isSubmitting;
  const isLastQuestion = questionNumber === totalQuestions;

  return (
    <div className={`w-full p-6 md:p-8 bg-slate-800 rounded-xl shadow-2xl space-y-6 transition-all duration-500 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl md:text-2xl font-semibold text-sky-400">Interview Question</h2>
        <span className="text-sm text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>
      
      {ttsError.current && <p className="text-amber-400 text-sm text-center py-2">{ttsError.current}</p>}
      <div className="p-4 bg-slate-700/50 rounded-lg min-h-[80px] flex items-center justify-center relative">
        <p className="text-lg text-slate-200 leading-relaxed text-center">{question}</p>
        {isAISpeaking && (
          <div className="absolute bottom-2 right-2 flex items-center text-xs text-sky-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 animate-pulse">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
            AI Speaking...
          </div>
        )}
      </div>

      {/* Camera/Mic and Video Section */}
      <div className="space-y-3">
        {!isCameraMicEnabled && (
          <button
            type="button"
            onClick={requestCameraMicPermissions}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
            </svg>
            <span>Enable Camera & Microphone</span>
          </button>
        )}
        {cameraMicError && <p className="text-red-400 text-sm text-center py-1">{cameraMicError}</p>}

        {isCameraMicEnabled && (
          <div className="relative aspect-video bg-slate-900 rounded-md overflow-hidden border-2 border-slate-700 shadow-inner">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
            {isRecordingVideo && ( // Video specific recording indicator
              <div className="absolute top-2 right-2 flex items-center space-x-1 bg-red-600/80 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                <span>REC VIDEO</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STT Section & Controls */}
      {isCameraMicEnabled && (
        <div className="space-y-4 pt-2">
          <div className="min-h-[60px] p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400">
            {isListeningSTT && !interimTranscript && <p className="text-slate-400 italic">Listening...</p>}
            {interimTranscript ? <p>{interimTranscript}</p> : (!isListeningSTT && !answer && <p className="text-slate-400">Your transcribed answer will appear here.</p>)}
            {!isListeningSTT && answer && <p className="font-medium">{answer}</p>} {/* Show final answer when not listening */}
          </div>
          
          {sttError && <p className="text-red-400 text-sm text-center py-1">{sttError}</p>}
          
          <button
            type="button"
            onClick={handleToggleRecording}
            disabled={disableInteractions || !SpeechRecognitionAPI}
            className={`w-full px-6 py-3 text-white font-bold rounded-lg shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-opacity-75 flex items-center justify-center space-x-2
              ${isListeningSTT ? 'bg-red-600 hover:bg-red-500 focus:ring-red-400' : 'bg-green-600 hover:bg-green-500 focus:ring-green-400'}
              ${disableInteractions || !SpeechRecognitionAPI ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isListeningSTT ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5h0v-6A6 6 0 0 1 6 6.75a6 6 0 0 1 6-6v0a6 6 0 0 1 6 6v7.5a6 6 0 0 1-6 6h0v-1.5m0 0a1.5 1.5 0 0 1-1.5-1.5v-13.5a1.5 1.5 0 0 1 1.5-1.5Zm0 0h0" />
              </svg>
            )}
            <span>
              {isSubmitting 
                  ? (isLastQuestion ? "Submitting & Generating Feedback..." : "Submitting Answer...") 
                  : isListeningSTT 
                    ? "Stop Recording & Submit Answer" 
                    : "Start Recording Answer"
              }
            </span>
          </button>
           {!SpeechRecognitionAPI && <p className="text-xs text-amber-500 text-center mt-2">Voice input is not available on your browser. Consider using Chrome or Edge.</p>}
        </div>
      )}
    </div>
  );
};
