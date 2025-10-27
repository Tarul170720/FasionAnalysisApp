import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Mic, Wand2, ShoppingBag, Sparkles, TrendingUp, Heart, Share2, ChevronRight, Star, ExternalLink, Upload, Loader2, AlertCircle, Film, Palette, Shuffle, Calendar, Sun, Zap, LogOut, User,ChevronLeft,Pause,Play } from 'lucide-react';
import { auth } from '../firebase-config'; // You'll need to create this
import { signOut, onAuthStateChanged } from 'firebase/auth';
import AnimationPanel from './AnimationPanel.jsx';
import VideoRecorder from './VideoRecorder.jsx';






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
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api-kxxp64pr5a-uc.a.run.app/api';

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
                    {sessions.length} / 10 analyses
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

            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No analyses yet. Upload an image or record a video!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-rose-300 transition-colors cursor-pointer"
                    onClick={() => setAnalysisData(analysis.analysis)}
                  >
                    <div className="flex items-center gap-4">
                      {analysis.frames && analysis.frames[0].url && (
                        <img 
                          src={analysis.frames[0].url} 
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
                              {analysisData.final_verdict.shopping.main_list.map((item, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-4">
                                    <div>
                                      <div className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-1">
                                        {item.product_category}
                                      </div>
                                      <h3 className="text-lg font-bold text-gray-900">{item.search_query}</h3>
                                      <p className="text-sm text-gray-600 mt-1">{item.why_recommended}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-amber-600">{item.price_range}</div>
                                      <div className="text-xs text-gray-500">{item.platform}</div>
                                    </div>
                                  </div>
                                  <a
                                    href={item.direct_link}
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
                                      <h3 className="text-xl font-bold text-gray-900 mb-2">{trend.trend_name}</h3>
                                      <p className="text-gray-700">{trend.description}</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-rose-100 to-amber-100 rounded-xl px-4 py-2">
                                      <div className="text-2xl font-bold text-gray-900">{trend.popularity_score}</div>
                                      <div className="text-xs text-gray-600">Popularity</div>
                                    </div>
                                  </div>
                                  
                                  {trend.visual_examples && trend.visual_examples.length > 0 && (
                                    <div className="mb-4">
                                      <h4 className="font-semibold text-gray-900 mb-3">Visual Inspiration</h4>
                                      <div className="grid grid-cols-3 gap-3">
                                        {trend.visual_examples.slice(0, 3).map((img, j) => (
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
                          authToken={authToken}
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