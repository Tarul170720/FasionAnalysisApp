import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Mic, Wand2, ShoppingBag, Sparkles, TrendingUp, Heart, Share2, ChevronRight, Star, ExternalLink, Upload, Loader2, AlertCircle, Film, Palette, Shuffle, Calendar, Sun, Zap, LogOut, User } from 'lucide-react';
import { auth } from '../firebase-config'; // You'll need to create this
import { signOut, onAuthStateChanged } from 'firebase/auth';

const AnimationPanel = ({ analysisData, authToken, onAnimationGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('complete');
  const [animationPackage, setAnimationPackage] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const API_BASE_URL = 'http://localhost:8080/api';

  // Generate Complete Package
  const generateCompletePackage = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/generate-complete-package`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ analysis_data: analysisData })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Generation failed');
      }
      
      const result = await response.json();
      if (result.success) {
        setAnimationPackage(result.package);
        onAnimationGenerated?.(result);
      }
    } catch (err) {
      console.error('Package generation failed:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Animation Player
  React.useEffect(() => {
    if (!isPlaying || !animationPackage?.styling_sequence) return;

    const timer = setTimeout(() => {
      setCurrentFrame((prev) => 
        (prev + 1) % animationPackage.styling_sequence.length
      );
    }, animationPackage.styling_sequence[currentFrame]?.delay || 1000);

    return () => clearTimeout(timer);
  }, [currentFrame, isPlaying, animationPackage]);

  return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-purple-600" />
              AI Fashion Studio
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Generate stunning variations and animations
            </p>
          </div>
          
          {animationPackage && (
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="text-xs text-gray-500">Total Generations</div>
              <div className="text-2xl font-bold text-purple-600">
                {(animationPackage.variations?.length || 0) + 
                 (animationPackage.occasion_adaptations?.length || 0) +
                 (animationPackage.seasonal_versions?.length || 0) +
                 (animationPackage.color_remixes?.length || 0)}
              </div>
            </div>
          )}
        </div>
  
        {/* Generate Button */}
        {!animationPackage && (
          <button
            onClick={generateCompletePackage}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white px-6 py-4 rounded-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg font-semibold">Generating Magic...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span className="text-lg font-semibold">Generate Complete Package</span>
              </>
            )}
          </button>
        )}
  
        {/* Loading Progress */}
        {loading && (
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              {['Style Variations', 'Styling Sequence', 'Occasion Adaptations', 'Seasonal Versions', 'Color Remixes'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                  </div>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
  
        {/* Results */}
        {animationPackage && !loading && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm overflow-x-auto">
              {[
                { id: 'complete', label: 'Overview', icon: Sparkles },
                { id: 'variations', label: 'Styles', icon: Palette },
                { id: 'animation', label: 'Animation', icon: Film },
                { id: 'occasions', label: 'Occasions', icon: Calendar },
                { id: 'seasons', label: 'Seasons', icon: Sun },
                { id: 'colors', label: 'Colors', icon: Zap }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
  
            {/* Overview Tab */}
            {activeTab === 'complete' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Outfit Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Item</p>
                      <p className="text-base font-semibold text-gray-900 capitalize">
                        {animationPackage.outfit_summary.item}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Type</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        animationPackage.outfit_summary.is_ethnic
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {animationPackage.outfit_summary.is_ethnic ? 'Ethnic' : 'Casual'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Colors</p>
                      <div className="flex gap-2">
                        {animationPackage.outfit_summary.colors.map((color, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm capitalize">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Style</p>
                      <p className="text-base font-medium text-gray-700 capitalize">
                        {animationPackage.outfit_summary.style.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
  
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <Palette className="w-8 h-8 mb-2 opacity-80" />
                    <div className="text-2xl font-bold">{animationPackage.variations?.length || 0}</div>
                    <div className="text-sm opacity-90">Style Variations</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-4 text-white">
                    <Film className="w-8 h-8 mb-2 opacity-80" />
                    <div className="text-2xl font-bold">{animationPackage.styling_sequence?.length || 0}</div>
                    <div className="text-sm opacity-90">Animation Frames</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white">
                    <Calendar className="w-8 h-8 mb-2 opacity-80" />
                    <div className="text-2xl font-bold">{animationPackage.occasion_adaptations?.length || 0}</div>
                    <div className="text-sm opacity-90">Occasions</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4 text-white">
                    <Sun className="w-8 h-8 mb-2 opacity-80" />
                    <div className="text-2xl font-bold">{animationPackage.seasonal_versions?.length || 0}</div>
                    <div className="text-sm opacity-90">Seasons</div>
                  </div>
                </div>
              </div>
            )}
  
            {/* Style Variations Tab */}
            {activeTab === 'variations' && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Style Variations</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {animationPackage.variations?.map((variation, idx) => (
                    <div key={idx} className="group relative bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                      <div className="aspect-[3/4] relative">
                        <img 
                          src={variation.image_url} 
                          alt={variation.style}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <p className="font-semibold">{variation.style}</p>
                            <p className="text-sm opacity-90">{variation.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-gray-900">{variation.style}</p>
                        <p className="text-xs text-gray-500 mt-1">via {variation.service}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
  
            {/* Animation Tab */}
            {activeTab === 'animation' && (
              <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-gray-900">Styling Animation</h4>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                </div>
                
                {/* Main Animation Display */}
                <div className="aspect-[3/4] max-w-md mx-auto bg-gray-100 rounded-xl overflow-hidden">
                  <img 
                    src={animationPackage.styling_sequence?.[currentFrame]?.image_url} 
                    alt="Animation frame"
                    className="w-full h-full object-cover"
                  />
                </div>
  
                {/* Frame Info */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Frame {currentFrame + 1} / {animationPackage.styling_sequence?.length}
                  </p>
                  <p className="text-gray-700 font-medium">
                    {animationPackage.styling_sequence?.[currentFrame]?.description}
                  </p>
                </div>
  
                {/* Thumbnails */}
                <div className="grid grid-cols-6 gap-2">
                  {animationPackage.styling_sequence?.map((frame, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentFrame(idx)}
                      className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                        currentFrame === idx ? 'border-purple-600 scale-105' : 'border-transparent'
                      }`}
                    >
                      <img 
                        src={frame.image_url} 
                        alt={`Frame ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
  
            {/* Occasions Tab */}
            {activeTab === 'occasions' && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Occasion Adaptations</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {animationPackage.occasion_adaptations?.map((occasion, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                      <div className="aspect-[3/4] relative">
                        <img 
                          src={occasion.image_url} 
                          alt={occasion.occasion}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-3 right-3">
                          <div className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                            {occasion.formality_level}/10
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h5 className="font-semibold text-gray-900 capitalize">{occasion.occasion}</h5>
                        <p className="text-sm text-gray-600 mt-1">{occasion.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
  
            {/* Seasons Tab */}
            {activeTab === 'seasons' && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Seasonal Versions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {animationPackage.seasonal_versions?.map((season, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                      <div className="aspect-[3/4] relative">
                        <img 
                          src={season.image_url} 
                          alt={season.season}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h5 className="font-semibold text-gray-900">{season.season}</h5>
                        <p className="text-xs text-gray-600 mt-1">{season.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
  
            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Color Palette Remixes</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {animationPackage.color_remixes?.map((remix, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                      <div className="aspect-[3/4] relative">
                        <img 
                          src={remix.image_url} 
                          alt={remix.palette}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h5 className="font-semibold text-gray-900">{remix.palette}</h5>
                        <p className="text-sm text-gray-600 mt-1 capitalize">{remix.colors}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
  
            {/* Regenerate Button */}
            <button
              onClick={generateCompletePackage}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white text-purple-600 border-2 border-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50 transition-all"
            >
              <Shuffle className="w-5 h-5" />
              <span className="font-semibold">Regenerate All</span>
            </button>
          </div>
        )}
      </div>
    );
};

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

const FashionStylistUI = () => {
  // Auth state
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // App state
  const [activeTab, setActiveTab] = useState('analysis');
  const [sessions, setSessions] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [frames, setFrames] = useState([]);
  const [transcription, setTranscription] = useState('');
  const [status, setStatus] = useState('Ready');
  const [showAdvice, setShowAdvice] = useState(false);
  
  const API_BASE_URL = 'http://localhost:8080/api';

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const token = await user.getIdToken();
        setAuthToken(token);
        fetchUserData(token);
      } else {
        setAuthToken(null);
        setAnalyses([]);
        setSessions([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch user's analyses and sessions
  const fetchUserData = async (token) => {
    try {
      const [analysesRes, sessionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/my-analyses?limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/my-sessions?limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (analysesRes.ok) {
        const analysesData = await analysesRes.json();
        setAnalyses(analysesData.analyses || []);
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData.sessions || []);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAnalysisData(null);
      setSelectedSession(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Fetch specific analysis
  const fetchAnalysis = async (analysisId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (!response.ok) throw new Error('Analysis not found');
      
      const data = await response.json();
      setAnalysisData(data.analysis);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analysis');
      console.error('Error fetching analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  // Analyze session with Firebase auth
  const analyzeSession = async (sessionId) => {
    try {
      setAnalyzing(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/analyze-fashion`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          sessionId,
          body_type: 'average',
          gender: 'female',
          user_preferences: 'modern minimalism'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze');
      }
      
      const data = await response.json();
      setAnalysisData(data.analysis);
      setSelectedSession(sessionId);
      await fetchUserData(authToken);
    } catch (err) {
      setError(err.message || 'Failed to analyze fashion');
      console.error('Error analyzing:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Upload and analyze video frames
  const uploadAndAnalyze = async (frames, transcription) => {
    try {
      setAnalyzing(true);
      setError(null);
      setStatus('📤 Uploading to Firebase Storage...');
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          frames,
          transcription,
          recordedAt: new Date().toISOString(),
          totalFrames: frames.length
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setStatus('✅ Upload complete! Analyzing...');
        setSelectedSession(result.sessionId);
        
        // Now analyze the session
        await analyzeSession(result.sessionId);
        
        return result.sessionId;
      }
    } catch (err) {
      setError(err.message || 'Failed to upload and analyze');
      setStatus('❌ ' + err.message);
      console.error('Error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Direct image analysis
  const analyzeDirectImage = async (base64Images) => {
    try {
      setAnalyzing(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/analyze-direct`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          images: base64Images,
          transcription: '',
          body_type: 'average',
          gender: 'female',
          user_preferences: 'modern minimalism'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle analysis limit
        if (response.status === 403) {
          throw new Error(errorData.message || 'Analysis limit reached. Upgrade to premium!');
        }
        
        throw new Error(errorData.message || 'Failed to analyze image');
      }

      const data = await response.json();
      setAnalysisData(data.analysis);
      setActiveTab('analysis');
      await fetchUserData(authToken); // Refresh user data
    } catch (err) {
      setError(err.message || 'Failed to analyze image');
      console.error('Error uploading image:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRecordingComplete = (recordedFrames) => {
    setFrames(recordedFrames);
    setStatus(`✅ ${recordedFrames.length} frames captured`);
  };

  const handleTranscriptionUpdate = (text) => {
    setTranscription(prev => (prev + ' ' + text).trim());
  };

  const analyzeFashion = async () => {
    if (frames.length === 0) return;
    
    setStatus('🤖 Analyzing with AI...');
    await uploadAndAnalyze(
      frames.map(f => ({ id: f.id, data: f.data, timestamp: f.timestamp })),
      transcription || 'Give me styling advice'
    );
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];

    try {
      setUploadingImage(true);

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target.result;
        await analyzeDirectImage([base64Image]);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Show login if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }
  

  // if (!user) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
  //       <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
  //         <div className="bg-gradient-to-br from-rose-400 to-amber-400 p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
  //           <Camera className="w-8 h-8 text-white" />
  //         </div>
  //         <h1 className="text-2xl font-bold mb-2">Fashion Stylist AI</h1>
  //         <p className="text-gray-600 mb-6">Sign in to access your personal style assistant</p>
  //         <button 
  //           onClick={() => window.location.href = '/login'} 
  //           className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
  //         >
  //           Sign In / Sign Up
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  const tabs = [
    { id: 'analysis', label: 'Analysis', icon: Sparkles },
    { id: 'styling', label: 'Styling Tips', icon: Heart },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'inspiration', label: 'Inspiration', icon: Camera },
    { id: 'animations', label: 'Animations', icon: Film }
  ];

  const ImageWithFallback = ({ src, alt, href }) => {
      const [imgError, setImgError] = useState(false);
  
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="group relative block aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50"
        >
          {!imgError ? (
            <img 
              src={src}
              alt={alt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
              <Camera className="w-8 h-8 text-rose-300 mb-2" />
              <p className="text-xs text-gray-500">{alt}</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-xs font-medium line-clamp-2">{alt}</p>
            </div>
          </div>
        </a>
      );
    };

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <header className="bg-white/80 backdrop-blur-lg border-b border-rose-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-rose-400 to-amber-400 p-2 rounded-xl">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                    Fashion Stylist AI
                  </h1>
                  <p className="text-sm text-gray-600">Welcome, {user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-rose-50 px-3 py-2 rounded-lg">
                  <User className="w-4 h-4 text-rose-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {analyses.length} / 10 analyses
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-rose-800 font-medium">Error</p>
                <p className="text-rose-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-8">
            <VideoRecorder 
              onRecordingComplete={handleRecordingComplete}
              onTranscriptionUpdate={handleTranscriptionUpdate}
            />

            {transcription && (
              <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                <p className="text-xs font-bold text-blue-600 mb-1">YOUR QUESTION:</p>
                <p className="text-sm italic">"{transcription}"</p>
              </div>
            )}

            {frames.length > 0 && (
              <button 
                onClick={analyzeFashion} 
                disabled={analyzing}
                className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                  analyzing 
                    ? 'bg-gray-300 text-gray-500' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl'
                }`}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 inline mr-2" />
                    Analyze with AI
                  </>
                )}
              </button>
            )}

            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm font-semibold">{status}</p>
            </div>
          </div>

          {/* Previous Analyses */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Analyses</h2>

            {analyses.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No analyses yet. Upload an image or record a video!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-rose-300 transition-colors cursor-pointer"
                    onClick={() => setAnalysisData(analysis)}
                  >
                    <div className="flex items-center gap-4">
                      {analysis.images && analysis.images[0] && (
                        <img 
                          src={analysis.images[0]} 
                          alt="Analysis" 
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {analysis.detectedItems?.[0] || 'Fashion Analysis'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Rest of the analysis view remains the same, just add authToken to AnimationPanel
  const data = analysisData.final_verdict || analysisData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-rose-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setAnalysisData(null);
                  setSelectedSession(null);
                }}
                className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
              </button>
              <div className="bg-gradient-to-br from-rose-400 to-amber-400 p-2 rounded-xl">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                  Fashion Stylist AI
                </h1>
                <p className="text-sm text-gray-600">Analysis Results</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-rose-50 rounded-lg transition-colors">
                <Heart className="w-5 h-5 text-rose-400" />
              </button>
              <button className="p-2 hover:bg-rose-50 rounded-lg transition-colors">
                <Share2 className="w-5 h-5 text-rose-400" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl p-6 mb-8 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Outfit Analysis Complete</h2>
                    <p className="text-rose-50">Your style has been analyzed with AI precision</p>
                  </div>
                  {data.scores && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold">{(data.scores.confidence * 100).toFixed(0)}%</div>
                      <div className="text-sm text-rose-50">Confidence</div>
                    </div>
                  )}
                </div>
                {data.scores && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-sm text-rose-50">Style Coherence</div>
                      <div className="text-xl font-bold">{(data.scores.style_coherence * 10).toFixed(1)}/10</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-sm text-rose-50">Versatility</div>
                      <div className="text-xl font-bold">{data.scores.versatility}/10</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-sm text-rose-50">Overall Score</div>
                      <div className="text-xl font-bold">{((data.scores.confidence + data.scores.style_coherence) * 5).toFixed(1)}/10</div>
                    </div>
                  </div>
                )}
              </div>
      
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg'
                          : 'bg-white text-gray-600 hover:bg-rose-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
      
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                          {activeTab === 'analysis' && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-amber-500" />
                                Outfit Overview
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">What You're Wearing</h4>
                                  <p className="text-gray-700 leading-relaxed">
                                    A beautiful {analysisData.dress_attributes.primary_color} {analysisData.dress_attributes.dress_type} featuring {analysisData.dress_attributes.pattern.toLowerCase()} details. The {analysisData.dress_attributes.neckline} neckline and {analysisData.dress_attributes.fit} fit create an elegant silhouette perfect for {analysisData.dress_attributes.occasion} occasions.
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-rose-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 mb-1">Style Tags</div>
                                    <div className="flex flex-wrap gap-2">
                                      {analysisData.dress_attributes.style_tags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-rose-600">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="bg-amber-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 mb-1">Color Palette</div>
                                    <div className="flex gap-2">
                                      {analysisData.detected_colors.map((color, i) => (
                                        <div
                                          key={i}
                                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                          style={{ backgroundColor: color === 'cream' ? '#FFF8DC' : color === 'gold' ? '#FFD700' : color === 'dark red' ? '#8B0000' : color }}
                                          title={color}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
              
                          {activeTab === 'styling' && (
                            <>
                              <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <Heart className="w-6 h-6 text-rose-500" />
                                  Complete Your Look
                                </h3>
                                
                                <div className="space-y-6">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Recommended Footwear</h4>
                                    <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl p-4 mb-3">
                                      <div className="flex items-start gap-3">
                                        <Star className="w-5 h-5 text-amber-500 mt-1" />
                                        <div>
                                          <div className="font-medium text-gray-900">{analysisData.final_verdict.styling.shoes.primary.type}</div>
                                          <div className="text-sm text-gray-600">
                                            {analysisData.final_verdict.styling.shoes.primary.color} • {analysisData.final_verdict.styling.shoes.primary.style}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">Alternatives:</div>
                                    <div className="grid grid-cols-2 gap-3">
                                      {analysisData.final_verdict.styling.shoes.alternatives.map((shoe, i) => (
                                        <div key={i} className="bg-gray-50 rounded-lg p-3">
                                          <div className="font-medium text-gray-900 text-sm">{shoe.type}</div>
                                          <div className="text-xs text-gray-600">{shoe.color}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
              
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Jewelry & Accessories</h4>
                                    <div className="bg-amber-50 rounded-lg p-4 mb-3">
                                      <div className="text-sm text-gray-600 mb-2">Metal: {analysisData.final_verdict.styling.jewelry.metal}</div>
                                      <div className="space-y-2">
                                        {analysisData.final_verdict.styling.jewelry.pieces.map((piece, i) => (
                                          <div key={i} className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-amber-500 rounded-full" />
                                            <span className="text-sm text-gray-700">{piece}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
              
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Complementary Colors</h4>
                                    <div className="flex flex-wrap gap-3">
                                      {analysisData.final_verdict.styling.color_palette.map((color, i) => (
                                        <div key={i} className="px-4 py-2 bg-gradient-to-r from-rose-50 to-amber-50 rounded-lg text-sm font-medium text-gray-700">
                                          {color}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
              
                              <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Styling Tips</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600">✓</div>
                                      Do's
                                    </h4>
                                    <ul className="space-y-2">
                                      {analysisData.final_verdict.styling.dos_and_donts.dos.map((item, i) => (
                                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                          <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-rose-600 mb-3 flex items-center gap-2">
                                      <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">✕</div>
                                      Don'ts
                                    </h4>
                                    <ul className="space-y-2">
                                      {analysisData.final_verdict.styling.dos_and_donts.donts.map((item, i) => (
                                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                          <ChevronRight className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
              
                          {activeTab === 'shopping' && (
                            <div className="space-y-4">
                              {analysisData.final_verdict.shopping.main_list.slice(0, 3).map((item, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-4">
                                    <div>
                                      <div className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-1">
                                        {item.category}
                                      </div>
                                      <h3 className="text-lg font-bold text-gray-900">{item.query}</h3>
                                      <p className="text-sm text-gray-600 mt-1">{item.why}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-amber-600">{item.price}</div>
                                      <div className="text-xs text-gray-500">{item.platform}</div>
                                    </div>
                                  </div>
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                                  >
                                    Shop Now
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
              
                          {activeTab === 'trends' && (
                            <div className="space-y-6">
                              {analysisData.final_verdict.trends.map((trend, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                                  <div className="flex items-start justify-between mb-4">
                                    <div>
                                      <h3 className="text-xl font-bold text-gray-900 mb-2">{trend.name}</h3>
                                      <p className="text-gray-700">{trend.description}</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-rose-100 to-amber-100 rounded-xl px-4 py-2">
                                      <div className="text-2xl font-bold text-gray-900">{trend.popularity}</div>
                                      <div className="text-xs text-gray-600">Popularity</div>
                                    </div>
                                  </div>
                                  
                                  {trend.images && trend.images.length > 0 && (
                                    <div className="mb-4">
                                      <h4 className="font-semibold text-gray-900 mb-3">Visual Inspiration</h4>
                                      <div className="grid grid-cols-3 gap-3">
                                        {trend.images.slice(0, 3).map((img, j) => (
                                          <ImageWithFallback
                                            key={j}
                                            src={img.image_url}
                                            alt={img.title}
                                            href={img.source_url}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Key Pieces</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {trend.key_pieces.map((piece, j) => (
                                        <span key={j} className="px-3 py-2 bg-gradient-to-r from-rose-50 to-amber-50 rounded-lg text-sm text-gray-700">
                                          {piece}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
              
                          {activeTab === 'inspiration' && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Camera className="w-6 h-6 text-rose-500" />
                                Similar Outfits & Styling Ideas
                              </h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {analysisData.final_verdict.visual_inspiration.similar_outfits.map((outfit) => (
                                  <ImageWithFallback
                                    key={outfit.id}
                                    src={outfit.image_url}
                                    alt={outfit.title}
                                    href={outfit.source_url}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          {activeTab === 'animations' && (
                        <AnimationPanel 
                          analysisData={analysisData}
                          onAnimationGenerated={(result) => {
                            console.log('Animation generated:', result);
                          }}
                        />
                      )}
                        </div>
              
                        <div className="space-y-6">
                          <div className="bg-gradient-to-br from-rose-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg">
                            <h3 className="text-lg font-bold mb-4">✨ Pro Tips</h3>
                            <ul className="space-y-3">
                              {analysisData.final_verdict.styling.tips.map((tip, i) => (
                                <li key={i} className="text-sm text-rose-50 leading-relaxed">
                                  • {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
              
                          <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Outfit Details</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Season</span>
                                <span className="text-sm font-medium text-gray-900 capitalize">{analysisData.dress_attributes.season}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Occasion</span>
                                <span className="text-sm font-medium text-gray-900 capitalize">{analysisData.dress_attributes.occasion}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Fit</span>
                                <span className="text-sm font-medium text-gray-900 capitalize">{analysisData.dress_attributes.fit}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Neckline</span>
                                <span className="text-sm font-medium text-gray-900">{analysisData.dress_attributes.neckline}</span>
                              </div>
                            </div>
                          </div>
              
                          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                            <h3 className="text-lg font-bold mb-2">Love this style?</h3>
                            <p className="text-gray-300 text-sm mb-4">Save this analysis and get personalized recommendations</p>
                            <button className="w-full bg-white text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                              Save Analysis
                            </button>
                          </div>
                        </div>
                      </div>
            </div>
    </div>
  );
};

export default FashionStylistUI;