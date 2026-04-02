'use client';

import React, { useState, useRef } from 'react';

export default function BusinessCardScanner() {
  const [eventName, setEventName] = useState('');
  const [contacts, setContacts] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError('');
      }
    } catch (err) {
      setError('Camera access denied. Please use image upload instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      processImage(imageData);
      stopCamera();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        processImage(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData) => {
    setProcessing(true);
    setError('');
    setCurrentImage(imageData);

    try {
      // Dynamically import Tesseract at runtime using esm.sh
      const module = await import('https://esm.sh/tesseract.js@4.1.1');
      const { createWorker } = module;
      
      const worker = await createWorker();
      const result = await worker.recognize(imageData);
      const extractedText = result.data.text;
      await worker.terminate();

      if (!extractedText.trim()) {
        setError('No text found. Try a clearer image of the business card.');
        setProcessing(false);
        return;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Extract contact information from this business card text and return ONLY valid JSON (no markdown, no extra text):
${extractedText}

Return a JSON object with these fields (use null for missing data):
{
  "firstName": "",
  "lastName": "",
  "title": "",
  "company": "",
  "email": "",
  "phone": "",
  "address": "",
  "website": ""
}`
          }]
        })
      });

      const data = await response.json();
      const textContent = data.content?.[0]?.text || '{}';
      
      let cleanJson = textContent.trim();
      if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
      if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
      if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      cleanJson = cleanJson.trim();
      
      const contactInfo = JSON.parse(cleanJson);
      setContacts([...contacts, { id: Date.now(), event: eventName || 'No Event', ...contactInfo }]);
      setCurrentImage(null);
    } catch (err) {
      setError(`Processing error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const exportToExcel = () => {
    if (contacts.length === 0) {
      setError('No contacts to export');
      return;
    }

    const headers = ['Event', 'First Name', 'Last Name', 'Title', 'Company', 'Email', 'Phone', 'Address', 'Website'];
    const rows = contacts.map(c => [
      c.event || '',
      c.firstName || '',
      c.lastName || '',
      c.title || '',
      c.company || '',
      c.email || '',
      c.phone || '',
      c.address || '',
      c.website || ''
    ]);

    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const filename = eventName ? `${eventName.replace(/\s+/g, '_')}_cards_${new Date().toISOString().split('T')[0]}.csv` : `business_cards_${new Date().toISOString().split('T')[0]}.csv`;
    link.download = filename;
    link.click();
  };

  const deleteContact = (id) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const clearAll = () => {
    if (window.confirm('Clear all contacts?')) {
      setContacts([]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '28px', fontWeight: '500' }}>Business Card Scanner</h1>
          <p style={{ margin: '0 0 2rem', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Scan business cards with AI-powered OCR. Export to Excel or Google Sheets.
          </p>
          
          {/* Event Name Input */}
          <div style={{ 
            background: 'var(--color-background-secondary)', 
            borderRadius: 'var(--border-radius-lg)', 
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
              Event name <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g., Tech Conference 2024, Trade Show, Networking Event"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '0.5px solid var(--color-border-secondary)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '14px',
                boxSizing: 'border-box',
                color: 'var(--color-text-primary)',
                background: 'var(--color-background-primary)'
              }}
            />
          </div>

          {/* Camera Section */}
          <div style={{ 
            background: 'var(--color-background-secondary)', 
            borderRadius: 'var(--border-radius-lg)', 
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            {!cameraActive ? (
              <button 
                onClick={startCamera}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--color-background-info)',
                  color: 'var(--color-text-info)',
                  border: '0.5px solid var(--color-border-info)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginBottom: '12px'
                }}
              >
                📷 Start Camera
              </button>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  style={{
                    width: '100%',
                    borderRadius: 'var(--border-radius-md)',
                    marginBottom: '12px',
                    background: '#000'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={captureImage}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'var(--color-background-success)',
                      color: 'var(--color-text-success)',
                      border: '0.5px solid var(--color-border-success)',
                      borderRadius: 'var(--border-radius-md)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'transparent',
                      color: 'var(--color-text-primary)',
                      border: '0.5px solid var(--color-border-secondary)',
                      borderRadius: 'var(--border-radius-md)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            <div style={{ marginTop: '12px' }}>
              <label style={{
                display: 'block',
                padding: '10px 16px',
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-secondary)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                textAlign: 'center',
                color: 'var(--color-text-primary)'
              }}>
                📁 Upload Image
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {currentImage && (
            <div style={{
              background: 'var(--color-background-secondary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <img 
                src={currentImage} 
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  borderRadius: 'var(--border-radius-md)',
                  marginBottom: '12px'
                }}
              />
            </div>
          )}

          {processing && (
            <div style={{
              background: 'var(--color-background-info)',
              color: 'var(--color-text-info)',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-md)',
              marginBottom: '1.5rem',
              fontSize: '13px'
            }}>
              ⏳ Processing image with OCR and AI...
            </div>
          )}

          {error && (
            <div style={{
              background: 'var(--color-background-danger)',
              color: 'var(--color-text-danger)',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-md)',
              marginBottom: '1.5rem',
              fontSize: '13px'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {contacts.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                Contacts ({contacts.length})
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={exportToExcel}
                  style={{
                    padding: '8px 12px',
                    background: 'var(--color-background-success)',
                    color: 'var(--color-text-success)',
                    border: '0.5px solid var(--color-border-success)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  📊 Export CSV
                </button>
                <button
                  onClick={clearAll}
                  style={{
                    padding: '8px 12px',
                    background: 'var(--color-background-danger)',
                    color: 'var(--color-text-danger)',
                    border: '0.5px solid var(--color-border-danger)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  style={{
                    background: 'var(--color-background-primary)',
                    border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1rem 1.25rem',
                    position: 'relative'
                  }}
                >
                  <button
                    onClick={() => deleteContact(contact.id)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    ✕
                  </button>

                  {contact.event && contact.event !== 'No Event' && (
                    <div style={{
                      marginBottom: '8px',
                      fontSize: '11px',
                      padding: '4px 8px',
                      background: 'var(--color-background-info)',
                      color: 'var(--color-text-info)',
                      borderRadius: 'var(--border-radius-md)',
                      display: 'inline-block'
                    }}>
                      📌 {contact.event}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--color-background-info)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: 'var(--color-text-info)',
                      flexShrink: 0
                    }}>
                      {(contact.firstName?.[0] || '') + (contact.lastName?.[0] || '') || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        margin: '0 0 2px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: 'var(--color-text-primary)'
                      }}>
                        {contact.firstName} {contact.lastName}
                      </p>
                      {contact.title && (
                        <p style={{
                          margin: 0,
                          fontSize: '12px',
                          color: 'var(--color-text-secondary)'
                        }}>
                          {contact.title}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6'
                  }}>
                    {contact.company && <div><strong style={{ color: 'var(--color-text-primary)' }}>Company:</strong> {contact.company}</div>}
                    {contact.email && <div><strong style={{ color: 'var(--color-text-primary)' }}>Email:</strong> {contact.email}</div>}
                    {contact.phone && <div><strong style={{ color: 'var(--color-text-primary)' }}>Phone:</strong> {contact.phone}</div>}
                    {contact.website && <div><strong style={{ color: 'var(--color-text-primary)' }}>Website:</strong> {contact.website}</div>}
                    {contact.address && <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: 'var(--color-text-primary)' }}>Address:</strong> {contact.address}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'var(--color-background-secondary)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>💡 Google Sheets:</strong> Download the CSV file and import it into Google Sheets via File → Import.
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
