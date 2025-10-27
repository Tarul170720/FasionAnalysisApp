// App.jsx - Main Application Component
import React, { useState } from 'react';
import { Camera, Wand2, Sparkles, RefreshCw } from 'lucide-react';

// Import components
import VideoRecorder from './Components/VideoRecorder/VideoRecorder.jsx';
import PersonDetailsCard from './Components/PersonDetails/PersonDetailsCard.jsx';
import DetectedAttributes from './Components/DetectedAttributes/DetectedAttributes.jsx'; // Import DetectedAttributes component from './components/DetectedAttributes/DetectedAttributes';

// Import services
import FashionAPI from './services/api';

const FashionAdvisorApp = () => {
  // State management
  const [frames, setFrames] = useState([]);
  const [transcription, setTranscription] = useState('');
  const [fashionAdvice, setFashionAdvice] = useState(null);
  const [variations, setVariations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('Ready to record');
  const [activeTab, setActiveTab] = useState('analysis');
  const [showAdvice, setShowAdvice] = useState(false);

  // Handlers
  const handleRecordingComplete = (recordedFrames) => {
    setFrames(recordedFrames);
    setStatus(`✅ ${recordedFrames.length} frames captured`);
  };

  const handleTranscriptionUpdate = (text) => {
    setTranscription(prev => (prev + ' ' + text).trim());
  };

  const analyzeFashion = async () => {
    if (frames.length === 0) {
      setStatus('❌ No frames to analyze');
      return;
    }

    setIsAnalyzing(true);
    setStatus('🤖 AI analyzing with Fashion-CLIP...');
    
    try {
      const result = await FashionAPI.analyzeFashion(
        frames.map(f => ({ id: f.id, data: f.data })),
        transcription || 'Give me styling advice for this outfit'
      );
      
      if (result.success) {
        setFashionAdvice(result.advice);
        setShowAdvice(true);
        setActiveTab('analysis');
        
        const imgStats = result.advice.imageStats || {};
        setStatus(`✅ Found ${imgStats.total || 0} outfit ideas from ${imgStats.sourcesUsed?.length || 0} sources!`);
      } else {
        setStatus('❌ Analysis failed: ' + (result.error || result.message));
      }
    } catch (error) {
      setStatus('❌ Network error: ' + error.message);
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateVariations = async () => {
    if (!fashionAdvice) return;
    
    setIsGenerating(true);
    setStatus('🎨 Generating 6 AI art styles...');
    
    try {
      const result = await FashionAPI.generateVariations(
        fashionAdvice.analysis || 'Fashion outfit',
        fashionAdvice.styleKeywords || ['casual', 'fashion'],
        fashionAdvice.personDetails || {},
        6
      );
      
      if (result.success) {
        setVariations(result.variations || []);
        setActiveTab('variations');
        setStatus(`✅ ${result.count} AI styles ready!`);
      } else {
        setStatus('❌ Generation failed');
      }
    } catch (error) {
      setStatus('❌ Network error: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAll = () => {
    setFrames([]);
    setTranscription('');
    setFashionAdvice(null);
    setVariations([]);
    setShowAdvice(false);
    setActiveTab('analysis');
    setStatus('Ready to record');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Fashion Advisor
                </h1>
                <p className="text-sm text-gray-600">Multi-Source Image Search + Voice AI</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {fashionAdvice?.imageStats && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  {fashionAdvice.imageStats.total} Images
                </span>
              )}
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                FREE
              </span>
              {showAdvice && (
                <button 
                  onClick={resetAll} 
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-gray-200"
                >
                  <RefreshCw className="w-3 h-3" /> New
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Video Recorder */}
            <div className="space-y-4">
              <VideoRecorder 
                onRecordingComplete={handleRecordingComplete}
                onTranscriptionUpdate={handleTranscriptionUpdate}
              />

              {transcription && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                  <p className="text-xs font-bold text-blue-600 mb-1">YOUR QUESTION:</p>
                  <p className="text-sm text-gray-800 italic">"{transcription}"</p>
                </div>
              )}

              {frames.length > 0 && !showAdvice && (
                <button 
                  onClick={analyzeFashion} 
                  disabled={isAnalyzing}
                  className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                    isAnalyzing 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:scale-105'
                  }`}
                >
                  <Wand2 className={`w-5 h-5 inline mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze My Outfit'}
                </button>
              )}
              
              <div className={`rounded-lg p-4 transition-all ${
                status.includes('✅') ? 'bg-green-100 text-green-800' : 
                status.includes('❌') ? 'bg-red-100 text-red-800' : 
                status.includes('🎤') ? 'bg-blue-100 text-blue-800' : 
                status.includes('🎨') ? 'bg-purple-100 text-purple-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm font-semibold break-words">{status}</p>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-4">
              {showAdvice && fashionAdvice ? (
                <div className="bg-gray-50 rounded-xl p-4 max-h-[650px] overflow-y-auto">
                  
                  {/* Main Tabs */}
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    <button 
                      onClick={() => setActiveTab('analysis')}
                      className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                        activeTab === 'analysis' 
                          ? 'bg-purple-500 text-white shadow-lg' 
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      📊 Analysis
                    </button>
                    <button 
                      onClick={() => setActiveTab('outfits')}
                      className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                        activeTab === 'outfits' 
                          ? 'bg-pink-500 text-white shadow-lg' 
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      ✨ Outfits ({fashionAdvice.imageStats?.total || 0})
                    </button>
                    <button 
                      onClick={() => setActiveTab('variations')}
                      className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                        activeTab === 'variations' 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      🎨 AI Art ({variations.length})
                    </button>
                  </div>

                  {/* Analysis Tab */}
                  {activeTab === 'analysis' && (
                    <div>
                      {/* Image Stats Overview */}
                      {fashionAdvice.imageStats && (
                        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4 mb-4">
                          <h4 className="font-bold text-sm mb-3">📊 Search Results</h4>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-white bg-opacity-70 rounded p-2 text-center">
                              <p className="font-bold text-lg text-indigo-600">{fashionAdvice.imageStats.total}</p>
                              <p className="text-gray-600">Total</p>
                            </div>
                            <div className="bg-white bg-opacity-70 rounded p-2 text-center">
                              <p className="font-bold text-lg text-purple-600">{fashionAdvice.imageStats.sourcesUsed?.length || 0}</p>
                              <p className="text-gray-600">Sources</p>
                            </div>
                            <div className="bg-white bg-opacity-70 rounded p-2 text-center">
                              <p className="font-bold text-lg text-pink-600">{Math.round((fashionAdvice.imageStats.avgRelevanceScore || 0) * 100)}%</p>
                              <p className="text-gray-600">Quality</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <PersonDetailsCard details={fashionAdvice.personDetails} />
                      <DetectedAttributes 
                        colors={fashionAdvice.detectedColors}
                        items={fashionAdvice.detectedItems}
                        styleScores={fashionAdvice.styleScores}
                      />
                      
                      <div className="bg-white rounded-lg p-4 mt-4">
                        <h3 className="font-bold mb-3">📊 Fashion Analysis</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed line-clamp-6">
                          {fashionAdvice.analysis}
                        </p>
                      </div>

                      <button
                        onClick={generateVariations}
                        disabled={isGenerating}
                        className={`w-full px-4 py-3 rounded-lg font-bold mt-4 transition-all ${
                          isGenerating 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-xl hover:scale-105'
                        }`}
                      >
                        <Wand2 className="w-4 h-4 inline mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate AI Variations'}
                      </button>
                    </div>
                  )}

                  {/* Outfits Tab */}
                  {activeTab === 'outfits' && fashionAdvice.images && (
                    <div>
                      <h3 className="font-bold mb-3">✨ Outfit Inspiration</h3>
                      {fashionAdvice.images.featured && fashionAdvice.images.featured.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {fashionAdvice.images.featured.map((outfit, idx) => (
                            <div key={idx} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-xl transition-all group">
                              <div className="relative">
                                <img 
                                  src={outfit.needs_proxy ? FashionAPI.getProxiedUrl(outfit.image_url) : outfit.image_url}
                                  alt={outfit.title || 'Outfit'}
                                  className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/300x400/9333ea/ffffff?text=Fashion';
                                  }}
                                />
                                {outfit.relevance_score && (
                                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    {Math.round(outfit.relevance_score * 100)}%
                                  </div>
                                )}
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                                  {outfit.source}
                                </div>
                              </div>
                              <div className="p-2">
                                <p className="text-xs font-bold line-clamp-2">{outfit.title}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No outfit inspirations available</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Variations Tab */}
                  {activeTab === 'variations' && (
                    <div>
                      {variations.length > 0 ? (
                        <div>
                          <h3 className="font-bold mb-3">🎨 AI-Generated Art Styles</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {variations.map((variation, idx) => (
                              <div key={idx} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-xl transition-all">
                                <div className="relative group">
                                  <img 
                                    src={variation.image_url} 
                                    alt={variation.style}
                                    className="w-full aspect-[3/4] object-cover transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                      e.target.src = `https://via.placeholder.com/300x400/ec4899/ffffff?text=${encodeURIComponent(variation.style)}`;
                                    }}
                                  />
                                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-bold">
                                    {variation.style}
                                  </div>
                                </div>
                                <div className="p-2">
                                  <p className="text-xs font-bold">{variation.style} Style</p>
                                  <p className="text-xs text-gray-600">{variation.service}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2 font-semibold">No AI art styles yet</p>
                          <p className="text-xs text-gray-500 mb-4">Generate 6 artistic variations</p>
                          <button
                            onClick={generateVariations}
                            disabled={isGenerating}
                            className={`px-6 py-3 rounded-lg font-bold transition-all ${
                              isGenerating 
                                ? 'bg-gray-300 text-gray-500' 
                                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-xl hover:scale-105'
                            }`}
                          >
                            <Wand2 className="w-4 h-4 inline mr-2" />
                            {isGenerating ? 'Generating...' : 'Generate AI Art'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  
                </div>
              ) : (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                    <h3 className="font-bold text-xl mb-3 text-purple-900">How It Works</h3>
                    <ul className="text-sm space-y-3 text-left max-w-xs mx-auto">
                      <li className="flex items-start gap-2">
                        <span className="text-xl">📹</span>
                        <span>Record your outfit video (5 seconds)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-xl">🎤</span>
                        <span>Speak your fashion question</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-xl">🎨</span>
                        <span>AI detects colors & items</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-xl">🔍</span>
                        <span>Search Google, Unsplash, Pexels</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-xl">✨</span>
                        <span>Get personalized style advice</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-xl">🎭</span>
                        <span>Generate AI art variations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-xl">💯</span>
                        <span className="font-bold text-green-600">100% FREE</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FashionAdvisorApp;