import { useState, useRef, useEffect } from 'react';

import { Video, Mic } from 'lucide-react';

const VideoRecorder = ({ onRecordingComplete, onTranscriptionUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [frames, setFrames] = useState([]);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    startCamera();
    setupSpeechRecognition();
    return () => {
      stopCamera();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const setupSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          onTranscriptionUpdate(finalTranscript);
        }
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
      setAudioEnabled(true);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const captureFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.8);
    }
    return null;
  };

  const startRecording = () => {
    if (recognitionRef.current && audioEnabled) {
      try { recognitionRef.current.start(); } catch (e) {}
    }

    const capturedFrames = [];
    setIsRecording(true);
    
    let frameCount = 0;
    const interval = setInterval(() => {
      const frame = captureFrame();
      if (frame) {
        capturedFrames.push({ id: frameCount++, data: frame, timestamp: Date.now() });
      }
      if (frameCount >= 20) {
        clearInterval(interval);
        stopRecording(capturedFrames);
      }
    }, 250);
    
    setTimeout(() => {
      clearInterval(interval);
      if (capturedFrames.length > 0) stopRecording(capturedFrames);
    }, 5100);
  };

  const stopRecording = (capturedFrames) => {
    setIsRecording(false);
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setFrames(capturedFrames);
    onRecordingComplete(capturedFrames);
  };

   return (
      <div className="space-y-4">
        <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 px-3 py-2 rounded-full animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="text-white text-sm font-bold">REC</span>
            </div>
          )}
          {isListening && (
            <div className="absolute bottom-4 left-4 right-4 bg-blue-500 bg-opacity-90 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2 text-white">
                <Mic className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-bold">Listening...</span>
              </div>
            </div>
          )}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
        
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
            isRecording 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:shadow-xl hover:scale-105'
          }`}
        >
          <Video className="w-6 h-6" />
          {isRecording ? 'Recording...' : audioEnabled ? 'Record Video + Voice' : 'Record Video'}
        </button>
  
        {frames.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-2">Captured: {frames.length} frames</p>
            <div className="flex gap-2 overflow-x-auto">
              {frames.slice(0, 5).map((frame, idx) => (
                <img key={idx} src={frame.data} alt={`Frame ${idx}`} className="w-16 h-16 object-cover rounded" />
              ))}
              {frames.length > 5 && (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs">
                  +{frames.length - 5}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

export default VideoRecorder;