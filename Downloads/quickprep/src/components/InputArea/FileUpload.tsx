'use client';

import React, { useState } from 'react';

const FileUpload = ({ onTextChange }: { onTextChange: (text: string) => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error state
    setError(null);

    // Check file type - only allow text files
    if (!file.type.includes('text') && !file.name.toLowerCase().endsWith('.txt')) {
      setError('Please upload a .txt file only. PDF files are not supported yet.');
      return;
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File is too large. Please upload a file smaller than 5MB.');
      return;
    }

    setIsLoading(true);

    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          if (text) {
            // Limit file content to prevent memory issues
            const maxLength = 50000; // 50KB limit
            const processedText = text.length > maxLength ? text.substring(0, maxLength) + '\n\n[Content truncated due to size limit]' : text;
            onTextChange(processedText);
            setError(null);
          } else {
            setError('Failed to read file content.');
          }
        } catch (err) {
          setError('Error processing file content.');
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Error reading file. Please try again.');
        setIsLoading(false);
      };

      reader.readAsText(file);
    } catch (err) {
      setError('Unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="file-upload">
      <label className="file-label">
        {isLoading ? '📖 Reading file...' : '📄 Upload .txt file'}
        <input
          type="file"
          accept=".txt"
          onChange={handleFile}
          className="file-input"
          disabled={isLoading}
        />
      </label>
      {error && (
        <div style={{
          color: '#ef4444',
          fontSize: '0.9rem',
          marginTop: '0.5rem',
          padding: '0.5rem',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
