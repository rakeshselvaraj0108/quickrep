'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportButtonProps {
  content: string;
  mode: string;
  filename?: string;
}

export default function ExportButton({ content, mode, filename }: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportAsText = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    downloadFile(blob, `${filename || mode}.txt`);
  };

  const exportAsMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    downloadFile(blob, `${filename || mode}.md`);
  };

  const exportAsHTML = () => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename || mode}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3 { color: #8b5cf6; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 8px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>${filename || mode}</h1>
  <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  <hr>
  <p style="color: #999; font-size: 12px;">Generated with QuickPrep • ${new Date().toLocaleString()}</p>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    downloadFile(blob, `${filename || mode}.html`);
  };

  const exportAsJSON = () => {
    const data = {
      mode,
      content,
      timestamp: new Date().toISOString(),
      generatedBy: 'QuickPrep',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `${filename || mode}.json`);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setExporting(true);
      setTimeout(() => setExporting(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    setExporting(true);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => {
      setExporting(false);
      setShowMenu(false);
    }, 1000);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:shadow-purple-500/50 transition-all"
      >
        {exporting ? (
          <>
            <span className="animate-spin">⚙️</span>
            Exporting...
          </>
        ) : (
          <>
            <span>📥</span>
            Export
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-56 bg-slate-900 border border-purple-500/30 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2">
              <p className="text-xs text-slate-300 px-3 py-2 font-semibold">EXPORT AS</p>
              
              {[
                { icon: '📄', label: 'Plain Text (.txt)', action: exportAsText },
                { icon: '📝', label: 'Markdown (.md)', action: exportAsMarkdown },
                { icon: '🌐', label: 'HTML (.html)', action: exportAsHTML },
                { icon: '📊', label: 'JSON (.json)', action: exportAsJSON },
                { icon: '📋', label: 'Copy to Clipboard', action: copyToClipboard },
              ].map((item, idx) => (
                <motion.button
                  key={idx}
                  onClick={item.action}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-slate-200 hover:bg-purple-600/30 hover:text-white transition-all"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
