'use client';

import React from 'react';
import PixelBlast from '@/components/PixelBlast';

/**
 * Example page showing PixelBlast as a full-screen background
 * with overlay content
 */
export default function PixelBlastExamplePage() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Background layer with PixelBlast */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <PixelBlast
          variant="circle"
          pixelSize={4}
          color="#8B5CF6"
          patternScale={2}
          patternDensity={1}
          liquid={false}
          enableRipples={true}
          rippleSpeed={0.3}
          rippleThickness={0.1}
          rippleIntensityScale={1}
          edgeFade={0.5}
          noiseAmount={0.15}
          transparent={true}
        />
      </div>

      {/* Content layer */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '40px',
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '20px',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          Welcome to PixelBlast
        </h1>

        <p
          style={{
            fontSize: '18px',
            maxWidth: '600px',
            marginBottom: '40px',
            opacity: 0.9,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            lineHeight: '1.6',
          }}
        >
          Click or touch the background to create interactive ripple effects. The pixelated pattern
          supports multiple shapes and customizable colors.
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            style={{
              padding: '12px 32px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.3)';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.2)';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            Learn More
          </button>
          <button
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            Get Started
          </button>
        </div>

        <div
          style={{
            marginTop: '60px',
            padding: '20px',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '400px',
          }}
        >
          <p style={{ margin: '0', fontSize: '14px', opacity: 0.8 }}>
            🎨 Try the interactive demo on the settings panel (right side) to explore different pixel
            shapes and colors!
          </p>
        </div>
      </div>
    </div>
  );
}
