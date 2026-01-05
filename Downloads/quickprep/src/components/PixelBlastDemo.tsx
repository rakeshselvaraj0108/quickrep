'use client';

import React, { useState } from 'react';
import PixelBlast from './PixelBlast';

/**
 * PixelBlastDemo - Interactive showcase of the PixelBlast component
 * 
 * This demonstrates how to use the PixelBlast component with various
 * customization options and interactive controls.
 */
export const PixelBlastDemo: React.FC = () => {
  const [variant, setVariant] = useState<'square' | 'circle' | 'triangle' | 'diamond'>('square');
  const [pixelSize, setPixelSize] = useState(3);
  const [color, setColor] = useState('#B19EEF');
  const [liquid, setLiquid] = useState(false);
  const [enableRipples, setEnableRipples] = useState(true);
  const [noiseAmount, setNoiseAmount] = useState(0);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* PixelBlast Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <PixelBlast
          variant={variant}
          pixelSize={pixelSize}
          color={color}
          patternScale={2}
          patternDensity={1}
          liquid={liquid}
          liquidStrength={0.1}
          liquidRadius={1}
          pixelSizeJitter={0}
          enableRipples={enableRipples}
          rippleSpeed={0.3}
          rippleThickness={0.1}
          rippleIntensityScale={1}
          edgeFade={0.5}
          noiseAmount={noiseAmount}
          transparent={true}
        />
      </div>

      {/* Control Panel */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderRadius: '12px',
          color: '#fff',
          fontFamily: 'monospace',
          maxWidth: '300px',
        }}
      >
        <h2 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>PixelBlast Settings</h2>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
            Pixel Shape:
          </label>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as any)}
            style={{
              width: '100%',
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #666',
              background: '#1a1a2e',
              color: '#fff',
            }}
          >
            <option value="square">Square</option>
            <option value="circle">Circle</option>
            <option value="triangle">Triangle</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
            Pixel Size: {pixelSize}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={pixelSize}
            onChange={(e) => setPixelSize(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
            Color:
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: '100%', height: '32px', borderRadius: '4px', border: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
            Noise Amount: {(noiseAmount * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={noiseAmount}
            onChange={(e) => setNoiseAmount(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={enableRipples}
              onChange={(e) => setEnableRipples(e.target.checked)}
            />
            Enable Ripples
          </label>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={liquid}
              onChange={(e) => setLiquid(e.target.checked)}
            />
            Liquid Effect
          </label>
        </div>

        <div
          style={{
            marginTop: '15px',
            paddingTop: '15px',
            borderTop: '1px solid #666',
            fontSize: '11px',
            color: '#999',
          }}
        >
          Click or touch the background to create ripples. Try different shapes and colors!
        </div>
      </div>
    </div>
  );
};

export default PixelBlastDemo;
