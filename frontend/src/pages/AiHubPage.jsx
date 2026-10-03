import React, { useState, useRef } from 'react';
import { api } from '../api.js';
import { useApp } from '../context/AppContext.jsx';

export default function AiHubPage() {
  const { setAiExtractedData, setIsReportLostOpen, showToast } = useApp();

  // Vision state
  const [visionImage, setVisionImage] = useState(null);
  const [visionFile, setVisionFile] = useState(null);
  const [visionResult, setVisionResult] = useState(null);
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const fileInputRef = useRef(null);

  // NL Parser state
  const [nlText, setNlText] = useState('');
  const [nlResult, setNlResult] = useState(null);
  const [isNlLoading, setIsNlLoading] = useState(false);

  // Presets
  const handlePreset = (type) => {
    if (type === 'iphone') {
      setVisionImage('https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600');
      setVisionFile(new File(['mock'], 'iphone.jpg', { type: 'image/jpeg' }));
    } else if (type === 'wallet') {
      setVisionImage('https://images.unsplash.com/photo-1627123424574-724758594e93?w=600');
      setVisionFile(new File(['mock'], 'wallet.jpg', { type: 'image/jpeg' }));
    } else if (type === 'bottle') {
      setVisionImage('https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600');
      setVisionFile(new File(['mock'], 'bottle.jpg', { type: 'image/jpeg' }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVisionFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setVisionImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run Vision
  const handleRunVision = async () => {
    setIsVisionLoading(true);
    try {
      const res = await api.extractAttributes(visionFile || new File([''], 'sample.jpg'));
      setVisionResult(res);
      setAiExtractedData(res);
      showToast('Multimodal attributes extracted with 94% confidence!', 'success');
    } catch {
      showToast('Vision extraction failed, check connection', 'error');
    } finally {
      setIsVisionLoading(false);
    }
  };

  // Run NL Parser
  const handleRunNl = async () => {
    if (!nlText.trim()) {
      showToast('Please enter report text to parse', 'error');
      return;
    }
    setIsNlLoading(true);
    try {
      const res = await api.parseNaturalLanguage(nlText);
      setNlResult(res);
      showToast('Conversational text converted to structured entity JSON!', 'success');
    } catch {
      showToast('Failed to parse text', 'error');
    } finally {
      setIsNlLoading(false);
    }
  };

  return (
    <section className="view-section active">
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div className="hero-pill">🤖 Pluggable LLM & Vision Service (Gemini / OpenAI / Ollama)</div>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>AI Intelligence Hub</h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
          Experience how our backend extracts attributes from item photos, parses freeform conversational reports into structured JSON, and explains match confidence.
        </p>
      </div>

      <div className="ai-hub-container">
        {/* Tool 1: Vision Attribute Extractor */}
        <div className="ai-panel">
          <div className="ai-panel-header">
            <div className="ai-panel-icon" style={{ color: 'var(--accent-purple)' }}>📸</div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Vision Attribute Extractor</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Upload an item photo to detect brand, model, colors, stickers & damage.
              </p>
            </div>
          </div>

          <div className="upload-dropzone" onClick={() => fileInputRef.current?.click()}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
            <p style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.2rem' }}>
              Drop photo here or click to browse
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Supports PNG, JPG, WebP up to 10MB
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            {visionImage && (
              <img src={visionImage} className="dropzone-preview" alt="Preview" />
            )}
          </div>

          {/* Quick Presets */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Or test with sample items:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-sm btn-secondary" onClick={() => handlePreset('iphone')}>
                📱 iPhone 15 Pro
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => handlePreset('wallet')}>
                👛 Vintage Wallet
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => handlePreset('bottle')}>
                🍶 Water Bottle
              </button>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleRunVision} disabled={isVisionLoading}>
            <span>⚡</span> {isVisionLoading ? 'Extracting with Gemini...' : 'Run Gemini Vision Analysis'}
          </button>

          {/* Vision Results */}
          {visionResult && (
            <div className="ai-result-box" style={{ display: 'block', marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>Analysis Complete (94% Confidence)</span>
                <button
                  className="btn btn-sm btn-emerald"
                  onClick={() => setIsReportLostOpen(true)}
                >
                  Apply to New Report
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div><strong style={{ color: 'var(--accent-purple)' }}>Suggested Title:</strong> {visionResult.suggestedTitle}</div>
                <div><strong style={{ color: 'var(--accent-cyan)' }}>Category:</strong> {visionResult.category}</div>
                <div><strong style={{ color: 'var(--accent-cyan)' }}>Brand & Model:</strong> {visionResult.brand} {visionResult.model}</div>
                <div><strong style={{ color: 'var(--accent-cyan)' }}>Colors:</strong> {visionResult.primaryColor} (Primary), {visionResult.secondaryColor || 'None'}</div>
                <div><strong style={{ color: 'var(--accent-amber)' }}>Distinctive Marks:</strong> {visionResult.distinctiveMarks}</div>
                <div><strong style={{ color: 'var(--accent-coral)' }}>Scratches/Damage:</strong> {visionResult.scratchesOrDamage}</div>
                <div><strong style={{ color: 'var(--accent-emerald)' }}>Protection/Case:</strong> {visionResult.stickersOrAccessories}</div>
              </div>
            </div>
          )}
        </div>

        {/* Tool 2: Conversational Report Parser */}
        <div className="ai-panel">
          <div className="ai-panel-header">
            <div className="ai-panel-icon" style={{ color: 'var(--accent-cyan)' }}>💬</div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Natural Language Report Parser</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Paste raw messages, lost notices, or spoken transcripts to extract structured entities.
              </p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Type or paste what happened:</label>
            <textarea
              className="form-control"
              style={{ minHeight: '120px' }}
              placeholder="e.g. Found a black Apple iPhone 15 Pro with a cyberpunk sticker on the 2nd floor library study desk around 5pm. Handed to Sarah Chen at the front desk."
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
            />
          </div>

          {/* Sample Prompts */}
          <div style={{ marginBottom: '1.2rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Sample scenarios:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() =>
                  setNlText('I misplaced my navy blue Herschel Little America backpack on the second floor library quiet zone around 3:30pm yesterday. Contains an Apple MacBook Air with a GitHub sticker.')
                }
              >
                Lost Backpack at Gym
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() =>
                  setNlText('Found a set of silver Toyota car keys with a red carabiner clip near the Student Union dining hall cashier around 12:15pm today.')
                }
              >
                Found Car Keys at Union
              </button>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleRunNl} disabled={isNlLoading}>
            <span>✨</span> {isNlLoading ? 'Parsing Entities...' : 'Parse with LLM Client'}
          </button>

          {/* NL Results */}
          {nlResult && (
            <div className="ai-result-box" style={{ display: 'block', marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>Structured Extraction</span>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setIsReportLostOpen(true)}
                >
                  Auto-Fill Form
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div><strong style={{ color: 'var(--accent-emerald)' }}>Detected Intent:</strong> {nlResult.reportType} REPORT ({Math.round(nlResult.confidenceScore * 100)}% confidence)</div>
                <div><strong style={{ color: 'var(--accent-cyan)' }}>Title:</strong> {nlResult.title}</div>
                <div><strong style={{ color: 'var(--accent-cyan)' }}>Category:</strong> {nlResult.category}</div>
                <div><strong style={{ color: 'var(--accent-cyan)' }}>Location:</strong> {nlResult.locationName}, {nlResult.city}</div>
                <div><strong style={{ color: 'var(--accent-purple)' }}>Timestamp:</strong> {nlResult.reportedDate} at {nlResult.reportedTime}</div>
                <div><strong style={{ color: 'var(--accent-amber)' }}>Extracted Attributes:</strong> {JSON.stringify(nlResult.attributes)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
