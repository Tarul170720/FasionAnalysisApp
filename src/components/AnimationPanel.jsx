


import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Palette, Film, Calendar, Sun, Zap, 
  Loader2, Play, Pause, ChevronLeft, ChevronRight, 
  Shuffle, AlertCircle 
} from 'lucide-react';

const AnimationPanel = ({ analysisData, authToken, onAnimationGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('complete');
  const [animationPackage, setAnimationPackage] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [detailedError, setDetailedError] = useState(null);
  
  // Use production API URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api-kxxp64pr5a-uc.a.run.app/api';

  // Generate Complete Package
  const generateCompletePackage = async () => {
    setLoading(true);
    setError(null);
    setDetailedError(null);
    
    try {
      console.log('🚀 Generating animation package...');
      console.log('API URL:', `${API_BASE_URL}/generate-complete-package`);
      console.log('Auth Token:', authToken ? '✅ Present' : '❌ Missing');
      console.log('Analysis Data Keys:', Object.keys(analysisData || {}));
      
      // Validate inputs
      if (!authToken) {
        throw new Error('Authentication token is missing. Please log in again.');
      }
      
      if (!analysisData) {
        throw new Error('Analysis data is missing. Please analyze an outfit first.');
      }

      // Prepare the request
      const requestBody = { analysis_data: analysisData };
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
      
      const response = await fetch(`${API_BASE_URL}/generate-complete-package`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Try to get response text first
      const responseText = await response.text();
      console.log('Response text (first 500 chars):', responseText.substring(0, 500));
      
      // Parse JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
      }
      
      if (!response.ok) {
        const errorMessage = result.error || result.message || result.details || `HTTP ${response.status}`;
        console.error('❌ Server error response:', result);
        
        setDetailedError({
          status: response.status,
          message: errorMessage,
          details: result.details,
          stack: result.stack
        });
        
        throw new Error(errorMessage);
      }
      
      console.log('✅ Package generated successfully');
      console.log('Result keys:', Object.keys(result));
      
      if (result.package) {
        setAnimationPackage(result.package);
        onAnimationGenerated?.(result);
      } else {
        console.warn('⚠️ No package in result:', result);
        throw new Error('Server returned success but no package data was found');
      }
      
    } catch (err) {
      console.error('❌ Package generation failed:', err);
      
      if (err.name === 'AbortError') {
        setError('Request timed out after 2 minutes. Please try again.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Network error: Cannot connect to server. Please check your internet connection.');
        setDetailedError({
          message: 'Network connection failed',
          details: 'This could be due to: CORS policy, server being down, or firewall blocking the request',
          suggestion: 'Check browser console for CORS errors'
        });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Animation Player Effect
  useEffect(() => {
    if (!isPlaying || !animationPackage?.styling_sequence) return;

    const timer = setTimeout(() => {
      setCurrentFrame((prev) => 
        (prev + 1) % animationPackage.styling_sequence.length
      );
    }, animationPackage.styling_sequence[currentFrame]?.delay || 1000);

    return () => clearTimeout(timer);
  }, [currentFrame, isPlaying, animationPackage]);

  // Calculate total images
  const totalImages = animationPackage ? 
    (animationPackage.variations?.length || 0) + 
    (animationPackage.styling_sequence?.length || 0) +
    (animationPackage.occasion_adaptations?.length || 0) +
    (animationPackage.seasonal_versions?.length || 0) +
    (animationPackage.color_remixes?.length || 0) : 0;

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
            Generate stunning variations and animations of your outfit
          </p>
        </div>
        
        {animationPackage && (
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            <div className="text-xs text-gray-500">Total Images</div>
            <div className="text-2xl font-bold text-purple-600">
              {totalImages}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 text-sm font-medium">{error}</p>
              
              {detailedError && (
                <div className="mt-3 space-y-2">
                  {detailedError.status && (
                    <p className="text-xs text-red-700">
                      <strong>Status:</strong> {detailedError.status}
                    </p>
                  )}
                  {detailedError.details && (
                    <p className="text-xs text-red-700">
                      <strong>Details:</strong> {JSON.stringify(detailedError.details)}
                    </p>
                  )}
                  {detailedError.suggestion && (
                    <p className="text-xs text-red-600 italic">
                      💡 {detailedError.suggestion}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => {
              setError(null);
              setDetailedError(null);
            }}
            className="text-xs text-red-600 hover:text-red-800 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Debug Info (only show if there's an error) */}
      {error && (
        <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <summary className="text-xs font-medium text-gray-700 cursor-pointer">
            🔧 Debug Information (click to expand)
          </summary>
          <div className="mt-3 space-y-2 text-xs font-mono">
            <p><strong>API URL:</strong> {API_BASE_URL}/generate-complete-package</p>
            <p><strong>Auth Token:</strong> {authToken ? '✅ Present (length: ' + authToken.length + ')' : '❌ Missing'}</p>
            <p><strong>Analysis Data:</strong> {analysisData ? '✅ Present' : '❌ Missing'}</p>
            {analysisData && (
              <p><strong>Analysis Keys:</strong> {Object.keys(analysisData).join(', ')}</p>
            )}
          </div>
        </details>
      )}

      {/* Generate Button */}
      {!animationPackage && (
        <button
          onClick={generateCompletePackage}
          disabled={loading || !authToken || !analysisData}
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
              <span className="text-lg font-semibold">Generate Complete Package (28 Images)</span>
            </>
          )}
        </button>
      )}

      {/* Loading Progress */}
      {loading && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">This will take about 10-15 seconds...</p>
            <p className="text-xs text-gray-500 mt-1">Please don't close this window</p>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Style Variations', count: 6 },
              { name: 'Styling Sequence', count: 6 },
              { name: 'Occasion Adaptations', count: 6 },
              { name: 'Seasonal Versions', count: 4 },
              { name: 'Color Remixes', count: 6 }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                </div>
                <span className="text-xs text-gray-500">{item.count} images</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results - (rest of the component remains the same) */}
      {animationPackage && !loading && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm overflow-x-auto">
            {[
              { id: 'complete', label: 'Overview', icon: Sparkles },
              { id: 'variations', label: 'Styles', icon: Palette, count: animationPackage.variations?.length },
              { id: 'animation', label: 'Animation', icon: Film, count: animationPackage.styling_sequence?.length },
              { id: 'occasions', label: 'Occasions', icon: Calendar, count: animationPackage.occasion_adaptations?.length },
              { id: 'seasons', label: 'Seasons', icon: Sun, count: animationPackage.seasonal_versions?.length },
              { id: 'colors', label: 'Colors', icon: Zap, count: animationPackage.color_remixes?.length }
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
                {tab.count && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content would continue here - kept the same as original */}
          {/* ... (all the tab rendering code remains unchanged) ... */}
          {activeTab === 'complete' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-4">📋 Outfit Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Primary Item</p>
                    <p className="text-base font-semibold text-gray-900 capitalize">
                      {animationPackage.outfit_summary.item}
                    </p>
                  </div>
                  
                  {animationPackage.outfit_summary.secondary_items?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Secondary Items</p>
                      <p className="text-sm text-gray-700">
                        {animationPackage.outfit_summary.secondary_items.join(', ')}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Type</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      animationPackage.outfit_summary.is_ethnic
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {animationPackage.outfit_summary.is_ethnic ? '🪷 Ethnic' : '👕 Casual'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Pattern</p>
                    <p className="text-base font-medium text-gray-700 capitalize">
                      {animationPackage.outfit_summary.pattern || 'Solid'}
                    </p>
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <p className="text-sm text-gray-500">Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {animationPackage.outfit_summary.colors?.map((color, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm capitalize font-medium">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <p className="text-sm text-gray-500">Style Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {animationPackage.outfit_summary.style?.map((style, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {animationPackage.outfit_summary.key_features?.length > 0 && (
                    <div className="space-y-2 col-span-2">
                      <p className="text-sm text-gray-500">Key Features</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {animationPackage.outfit_summary.key_features.map((feature, idx) => (
                          <li key={idx} className="capitalize">{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {animationPackage.outfit_summary.full_description && (
                    <div className="space-y-2 col-span-2">
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-sm text-gray-700 italic">
                        {animationPackage.outfit_summary.full_description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                  <Zap className="w-8 h-8 mb-2 opacity-80" />
                  <div className="text-2xl font-bold">{animationPackage.color_remixes?.length || 0}</div>
                  <div className="text-sm opacity-90">Color Remixes</div>
                </div>
              </div>
            </div>
          )}

          {/* Style Variations Tab */}
          {activeTab === 'variations' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Style Variations ({animationPackage.variations?.length || 0})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {animationPackage.variations?.map((variation, idx) => (
                  <div key={idx} className="group relative bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                    <div className="aspect-[3/4] relative">
                      <img 
                        src={variation.image_url} 
                        alt={variation.style}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x600?text=Loading...';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <p className="font-semibold">{variation.style}</p>
                          <p className="text-sm opacity-90 mt-1">{variation.description}</p>
                          {variation.colors && (
                            <div className="flex gap-1 mt-2">
                              {variation.colors.map((color, i) => (
                                <span key={i} className="text-xs bg-white/20 px-2 py-0.5 rounded capitalize">
                                  {color}
                                </span>
                              ))}
                            </div>
                          )}
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
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Film className="w-5 h-5 text-pink-600" />
                  Styling Animation
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentFrame((prev) => Math.max(0, prev - 1))}
                    disabled={currentFrame === 0}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    onClick={() => setCurrentFrame((prev) => Math.min(animationPackage.styling_sequence.length - 1, prev + 1))}
                    disabled={currentFrame === animationPackage.styling_sequence.length - 1}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Main Animation Display */}
              <div className="aspect-[3/4] max-w-md mx-auto bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={animationPackage.styling_sequence?.[currentFrame]?.image_url} 
                  alt="Animation frame"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x600?text=Loading...';
                  }}
                />
              </div>

              {/* Frame Info */}
              <div className="text-center bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium mb-2">
                  Frame {currentFrame + 1} of {animationPackage.styling_sequence?.length}
                </p>
                <p className="text-gray-700 font-medium">
                  {animationPackage.styling_sequence?.[currentFrame]?.description}
                </p>
                {animationPackage.styling_sequence?.[currentFrame]?.styling_tip && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    💡 {animationPackage.styling_sequence[currentFrame].styling_tip}
                  </p>
                )}
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-6 gap-2">
                {animationPackage.styling_sequence?.map((frame, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentFrame(idx);
                      setIsPlaying(false);
                    }}
                    className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                      currentFrame === idx ? 'border-purple-600 scale-105 shadow-lg' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={frame.image_url} 
                      alt={`Frame ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Occasions Tab */}
          {activeTab === 'occasions' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Occasion Adaptations ({animationPackage.occasion_adaptations?.length || 0})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {animationPackage.occasion_adaptations?.map((occasion, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                    <div className="aspect-[3/4] relative">
                      <img 
                        src={occasion.image_url} 
                        alt={occasion.occasion}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x600?text=Loading...';
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <div className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-md">
                          Formality: {occasion.formality_level}/10
                        </div>
                      </div>
                      {occasion.base_outfit && (
                        <div className="absolute top-3 left-3">
                          <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
                            {occasion.base_outfit}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h5 className="font-semibold text-gray-900 capitalize text-lg">{occasion.occasion}</h5>
                      <p className="text-sm text-gray-600 mt-1">{occasion.description}</p>
                      {occasion.colors && (
                        <div className="flex gap-1 mt-2">
                          {occasion.colors.map((color, i) => (
                            <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded capitalize">
                              {color}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seasons Tab */}
          {activeTab === 'seasons' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-orange-600" />
                Seasonal Versions ({animationPackage.seasonal_versions?.length || 0})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {animationPackage.seasonal_versions?.map((season, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                    <div className="aspect-[3/4] relative">
                      <img 
                        src={season.image_url} 
                        alt={season.season}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x600?text=Loading...';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h5 className="font-semibold text-gray-900 text-lg">{season.season}</h5>
                      <p className="text-xs text-gray-600 mt-1">{season.description}</p>
                      {season.base_item && (
                        <p className="text-xs text-purple-600 mt-2 font-medium capitalize">
                          Base: {season.base_item}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                Color Palette Remixes ({animationPackage.color_remixes?.length || 0})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {animationPackage.color_remixes?.map((remix, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                    <div className="aspect-[3/4] relative">
                      <img 
                        src={remix.image_url} 
                        alt={remix.palette}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x600?text=Loading...';
                        }}
                      />
                      {idx === 0 && (
                        <div className="absolute top-3 left-3">
                          <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
                            ⭐ Original
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h5 className="font-semibold text-gray-900 text-lg">{remix.palette}</h5>
                      <p className="text-sm text-gray-600 mt-1 capitalize">{remix.colors}</p>
                      {remix.base_item && (
                        <p className="text-xs text-purple-600 mt-2 font-medium capitalize">
                          {remix.base_item}
                        </p>
                      )}
                      {remix.pattern && (
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          Pattern: {remix.pattern}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regenerate Button */}
          <div className="flex gap-3">
            <button
              onClick={generateCompletePackage}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-purple-600 border-2 border-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50 transition-all disabled:opacity-50"
            >
              <Shuffle className="w-5 h-5" />
              <span className="font-semibold">Regenerate All</span>
            </button>
            
            <button
              onClick={() => {
                const dataStr = JSON.stringify(animationPackage, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'outfit-animation-package.json';
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
            >
              💾 Download JSON
            </button>
          </div>
          {/* Regenerate Button */}
          <div className="flex gap-3">
            <button
              onClick={generateCompletePackage}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-purple-600 border-2 border-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50 transition-all disabled:opacity-50"
            >
              <Shuffle className="w-5 h-5" />
              <span className="font-semibold">Regenerate All</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimationPanel;