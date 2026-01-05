'use client';

import React, { useEffect, useState, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { GenerationMode } from '../../types/ai';

interface ResultPanelProps {
  mode: GenerationMode;
  content: string;
  isLoading: boolean;
}

const MODE_CONFIG: Record<GenerationMode, { icon: string; title: string; color: string; gradient: string }> = {
  summary: { icon: '📋', title: 'Summary', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)' },
  questions: { icon: '❓', title: 'Practice Questions', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  plan: { icon: '📅', title: 'Study Plan', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  flashcards: { icon: '📚', title: 'Flashcards', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
  quiz: { icon: '✅', title: 'Quiz', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  mindmap: { icon: '🧠', title: 'Mind Map', color: '#a855f7', gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)' },
};

const EMPTY_MESSAGES: Record<GenerationMode, string> = {
  summary: 'Your AI-powered summary will appear here once you generate it.',
  questions: 'Your practice questions will appear here once you generate them.',
  plan: 'Your personalized 7-day study plan will appear here once you generate it.',
  flashcards: 'Your interactive flashcards will appear here once you generate them.',
  quiz: 'Your interactive quiz will appear here once you generate it.',
  mindmap: 'Your visual mind map will appear here once you generate it.',
};

const ResultPanel: React.FC<ResultPanelProps> = ({
  mode,
  content,
  isLoading,
}) => {
  const [hasContent, setHasContent] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setHasContent(Boolean(content.trim().length));
  }, [content]);

  const handleCopy = async () => {
    if (!content.trim().length) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // silently fail
    }
  };

  // Text-based PDF export - captures full content accurately
  const exportTextPDF = async () => {
    if (!hasContent) return;
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      const lineHeight = 5;
      const fontSize = 10;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const title = `${MODE_CONFIG[mode].title} - ${new Date().toLocaleDateString()}`;
      pdf.text(title, margin, margin);

      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'normal');

      let yPosition = margin + 15;
      const lines = pdf.splitTextToSize(content, contentWidth);

      lines.forEach((line: string) => {
        if (yPosition + lineHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      pdf.save(`quickprep-${mode}-${new Date().getTime()}.pdf`);
    } catch (e) {
      console.error('PDF export failed:', e);
    }
  };

  const exportPDF = async () => {
    // Use text-based export for reliable full content capture
    await exportTextPDF();
  };

  // Parse and format content for rich display
  const formattedContent = useMemo(() => {
    if (!content || !hasContent) return null;
    
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        elements.push(<div key={idx} style={{ height: '12px' }} />);
        return;
      }

      // Headers with emojis (📋, 🔑, ⚠️, 💡, 🎯, 📅, 📚, ✅)
      if (/^[📋🔑⚠️💡🎯📅📚✅❓===]/.test(trimmed) || trimmed.startsWith('===')) {
        elements.push(
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.02 }}
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: MODE_CONFIG[mode].color,
              marginTop: '20px',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: `2px solid ${MODE_CONFIG[mode].color}30`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {trimmed.replace(/^===\s*/, '').replace(/\s*===\s*$/, '')}
          </motion.div>
        );
        return;
      }

      // Day headers (Day 1:, Day 2:, etc.)
      if (/^Day\s*\d+:/i.test(trimmed)) {
        elements.push(
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              marginTop: '16px',
              marginBottom: '8px',
              background: `${MODE_CONFIG[mode].color}15`,
              borderRadius: '12px',
              border: `1px solid ${MODE_CONFIG[mode].color}30`
            }}
          >
            <span style={{
              padding: '6px 12px',
              background: MODE_CONFIG[mode].gradient,
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'white',
              textTransform: 'uppercase'
            }}>
              {trimmed.split(':')[0]}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              {trimmed.split(':').slice(1).join(':')}
            </span>
          </motion.div>
        );
        return;
      }

      // Question numbers (1., 2., etc.) - for questions mode
      if (/^\d+\.\s/.test(trimmed) && mode === 'questions') {
        const [num, ...rest] = trimmed.split('.');
        elements.push(
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.02 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '16px 18px',
              marginBottom: '12px',
              background: 'rgba(245, 158, 11, 0.08)',
              borderRadius: '14px',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}
          >
            <span style={{
              minWidth: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              color: 'white'
            }}>
              {num}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, flex: 1 }}>
              {rest.join('.').trim()}
            </span>
          </motion.div>
        );
        return;
      }

      // Options (A), B), C), D) or *(correct)*
      if (/^\s*[A-D]\)/.test(trimmed)) {
        const isCorrect = trimmed.includes('*(correct)*') || trimmed.includes('*correct*');
        elements.push(
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.02 }}
            style={{
              marginLeft: '46px',
              padding: '8px 14px',
              marginBottom: '4px',
              background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              border: isCorrect ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              color: isCorrect ? '#10b981' : 'rgba(255,255,255,0.7)',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isCorrect && <span>✓</span>}
            {trimmed.replace('*(correct)*', '').replace('*correct*', '').trim()}
          </motion.div>
        );
        return;
      }

      // Bullet points
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
        const bulletContent = trimmed.replace(/^[-•*]\s*/, '');
        elements.push(
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.02 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '10px 0',
              marginLeft: '8px'
            }}
          >
            <span style={{
              width: '6px',
              height: '6px',
              marginTop: '8px',
              borderRadius: '50%',
              background: MODE_CONFIG[mode].color,
              flexShrink: 0
            }} />
            <span style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
              {bulletContent}
            </span>
          </motion.div>
        );
        return;
      }

      // Checkbox items [ ]
      if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
        const isChecked = trimmed.includes('[x]');
        const text = trimmed.replace(/^-\s*\[.\]\s*/, '');
        elements.push(
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.02 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              marginBottom: '6px',
              marginLeft: '16px',
              background: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              border: `1px solid ${isChecked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.1)'}`
            }}
          >
            <span style={{
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              background: isChecked ? '#10b981' : 'transparent',
              border: isChecked ? 'none' : '2px solid rgba(255,255,255,0.3)',
              fontSize: '12px',
              color: 'white'
            }}>
              {isChecked && '✓'}
            </span>
            <span style={{
              color: isChecked ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.85)',
              textDecoration: isChecked ? 'line-through' : 'none'
            }}>
              {text}
            </span>
          </motion.div>
        );
        return;
      }

      // Regular text
      elements.push(
        <motion.p
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: idx * 0.02 }}
          style={{
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.7,
            margin: '8px 0',
            fontSize: '15px'
          }}
        >
          {trimmed}
        </motion.p>
      );
    });

    return elements;
  }, [content, hasContent, mode]);

  const config = MODE_CONFIG[mode];

  return (
    <section style={{
      background: 'rgba(15, 15, 35, 0.5)',
      borderRadius: '20px',
      border: '1px solid rgba(139, 92, 246, 0.15)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            background: config.gradient,
            fontSize: '22px'
          }}>
            {config.icon}
          </span>
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'white',
              margin: 0
            }}>
              {config.title}
            </h2>
            <p style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.5)',
              margin: 0
            }}>
              AI-generated study material
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            disabled={!hasContent}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              background: 'rgba(139, 92, 246, 0.1)',
              color: hasContent ? '#a78bfa' : 'rgba(255,255,255,0.3)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: hasContent ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copied ? '✓' : '📋'} {copied ? 'Copied!' : 'Copy'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportPDF}
            disabled={!hasContent}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: hasContent ? config.gradient : 'rgba(255,255,255,0.1)',
              color: hasContent ? 'white' : 'rgba(255,255,255,0.3)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: hasContent ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📄 Export PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!hasContent) return;
              try {
                const element = document.createElement('a');
                const file = new Blob([content], { type: 'text/plain' });
                element.href = URL.createObjectURL(file);
                element.download = `quickprep-${mode}-${new Date().getTime()}.txt`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              } catch (e) {
                console.error('Text export failed:', e);
              }
            }}
            disabled={!hasContent}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: hasContent ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'rgba(255,255,255,0.1)',
              color: hasContent ? 'white' : 'rgba(255,255,255,0.3)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: hasContent ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📝 Export TXT
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', minHeight: '300px' }}>
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px'
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '48px',
                  height: '48px',
                  border: '3px solid rgba(139, 92, 246, 0.2)',
                  borderTopColor: '#8b5cf6',
                  borderRadius: '50%',
                  marginBottom: '16px'
                }}
              />
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                Generating your {config.title.toLowerCase()}...
              </p>
            </motion.div>
          )}

          {!isLoading && !hasContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: 'center',
                padding: '60px 20px'
              }}
            >
              <span style={{
                fontSize: '56px',
                display: 'block',
                marginBottom: '16px',
                filter: 'grayscale(0.5)',
                opacity: 0.5
              }}>
                {config.icon}
              </span>
              <p style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '15px',
                maxWidth: '300px',
                margin: '0 auto'
              }}>
                {EMPTY_MESSAGES[mode]}
              </p>
            </motion.div>
          )}

          {!isLoading && hasContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="result-content-formatted"
              style={{
                maxHeight: '600px',
                overflowY: 'auto',
                paddingRight: '8px'
              }}
            >
              {formattedContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ResultPanel;
