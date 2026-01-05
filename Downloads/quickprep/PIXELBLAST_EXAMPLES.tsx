/**
 * PixelBlast Component - Usage Examples
 * 
 * This file demonstrates various ways to use the PixelBlast component
 * with different configurations and patterns.
 */

import PixelBlast from '@/components/PixelBlast';

/**
 * Example 1: Simple Default Background
 * Use case: Subtle, professional background
 */
export function Example1_SimpleDefault() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <PixelBlast />
      <div style={{ position: 'relative', zIndex: 1, padding: '40px', color: 'white' }}>
        <h1>Default PixelBlast</h1>
      </div>
    </div>
  );
}

/**
 * Example 2: Colorful Circles
 * Use case: Vibrant, modern landing page
 */
export function Example2_ColorfulCircles() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <PixelBlast
        variant="circle"
        pixelSize={4}
        color="#FF6B9D"
        patternScale={2}
        enableRipples={true}
        rippleThickness={0.15}
      />
      <div style={{ position: 'relative', zIndex: 1, padding: '40px', color: 'white' }}>
        <h1>Colorful Circles</h1>
      </div>
    </div>
  );
}

/**
 * Example 3: Minimalist Large Squares
 * Use case: Clean, spacious design
 */
export function Example3_MinimalistSquares() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <PixelBlast
        variant="square"
        pixelSize={8}
        color="#4ECDC4"
        patternDensity={0.5}
        edgeFade={0.2}
        enableRipples={false}
      />
      <div style={{ position: 'relative', zIndex: 1, padding: '40px', color: 'white' }}>
        <h1>Minimalist Design</h1>
      </div>
    </div>
  );
}

/**
 * Example 4: High-Energy Diamonds
 * Use case: Chaotic, energetic aesthetic
 */
export function Example4_HighEnergyDiamonds() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <PixelBlast
        variant="diamond"
        pixelSize={3}
        color="#F91B8C"
        rippleSpeed={0.6}
        rippleThickness={0.25}
        rippleIntensityScale={1.5}
        noiseAmount={0.4}
      />
      <div style={{ position: 'relative', zIndex: 1, padding: '40px', color: 'white' }}>
        <h1>High Energy Design</h1>
      </div>
    </div>
  );
}

/**
 * Example 5: Liquid Effect Background
 * Use case: Interactive, flowing design
 */
export function Example5_LiquidEffect() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <PixelBlast
        variant="circle"
        pixelSize={4}
        color="#00D9FF"
        liquid={true}
        liquidStrength={0.2}
        liquidRadius={1.5}
        enableRipples={true}
      />
      <div style={{ position: 'relative', zIndex: 1, padding: '40px', color: 'white' }}>
        <h1>Liquid Effect</h1>
        <p>Move your cursor to create liquid distortions</p>
      </div>
    </div>
  );
}

/**
 * Example 6: Grainy Texture Effect
 * Use case: Retro, textured look
 */
export function Example6_GrainyTexture() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <PixelBlast
        variant="square"
        pixelSize={3}
        color="#B19EEF"
        noiseAmount={0.6}
        pixelSizeJitter={0.5}
        enableRipples={true}
      />
      <div style={{ position: 'relative', zIndex: 1, padding: '40px', color: 'white' }}>
        <h1>Grainy Texture</h1>
      </div>
    </div>
  );
}

/**
 * Example 7: Purple Dark Mode
 * Use case: Dark theme with accent color
 */
export function Example7_PurpleDarkMode() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <PixelBlast
        variant="triangle"
        pixelSize={5}
        color="#8B5CF6"
        patternScale={1.5}
        edgeFade={0.6}
        enableRipples={true}
        rippleThickness={0.1}
      />
      <div style={{ position: 'relative', zIndex: 1, padding: '40px', color: 'white' }}>
        <h1>Purple Theme</h1>
      </div>
    </div>
  );
}

/**
 * Example 8: Cyberpunk Neon
 * Use case: Futuristic, neon aesthetic
 */
export function Example8_CyberpunkNeon() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <PixelBlast
        variant="square"
        pixelSize={2}
        color="#00FF88"
        patternDensity={1.5}
        rippleSpeed={0.8}
        rippleThickness={0.2}
        noiseAmount={0.3}
        liquid={true}
        liquidStrength={0.15}
      />
      <div style={{ position: 'relative', zIndex: 1, padding: '40px', color: 'white' }}>
        <h1>Cyberpunk Neon</h1>
      </div>
    </div>
  );
}

/**
 * Example 9: Soft Pastel
 * Use case: Gentle, calming design
 */
export function Example9_SoftPastel() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#FFF5F0' }}>
      <PixelBlast
        variant="circle"
        pixelSize={6}
        color="#FFB3BA"
        patternScale={3}
        edgeFade={0.3}
        enableRipples={false}
        transparent={true}
      />
      <div style={{ position: 'relative', zIndex: 1, padding: '40px', color: '#333' }}>
        <h1>Soft Pastel</h1>
      </div>
    </div>
  );
}

/**
 * Example 10: Interactive Control Panel
 * Use case: Customizable background with real-time controls
 */
export function Example10_InteractiveControls() {
  const [variant, setVariant] = React.useState<'square' | 'circle' | 'triangle' | 'diamond'>('square');
  const [pixelSize, setPixelSize] = React.useState(3);
  const [color, setColor] = React.useState('#B19EEF');
  const [enableRipples, setEnableRipples] = React.useState(true);
  const [liquid, setLiquid] = React.useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <PixelBlast
        variant={variant}
        pixelSize={pixelSize}
        color={color}
        enableRipples={enableRipples}
        liquid={liquid}
      />

      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '20px',
          borderRadius: '8px',
          color: 'white',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ marginBottom: '10px' }}>
          <label>Variant: </label>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as any)}
            style={{ marginLeft: '10px' }}
          >
            <option value="square">Square</option>
            <option value="circle">Circle</option>
            <option value="triangle">Triangle</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Pixel Size: {pixelSize}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={pixelSize}
            onChange={(e) => setPixelSize(Number(e.target.value))}
            style={{ marginLeft: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Color: </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ marginLeft: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={enableRipples}
            onChange={(e) => setEnableRipples(e.target.checked)}
          />
          <label style={{ marginLeft: '5px' }}>Enable Ripples</label>
        </div>
        <div>
          <input
            type="checkbox"
            checked={liquid}
            onChange={(e) => setLiquid(e.target.checked)}
          />
          <label style={{ marginLeft: '5px' }}>Liquid Effect</label>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 11: Hero Section with CTA
 * Use case: Landing page hero with call-to-action
 */
export function Example11_HeroSection() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <PixelBlast
        variant="circle"
        pixelSize={4}
        color="#667EEA"
        enableRipples={true}
        rippleThickness={0.12}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '56px', marginBottom: '20px' }}>Welcome to PixelBlast</h1>
        <p style={{ fontSize: '20px', marginBottom: '40px', maxWidth: '600px' }}>
          Interactive pixelated backgrounds for modern web experiences
        </p>
        <button
          style={{
            padding: '14px 40px',
            background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
            border: 'none',
            color: 'white',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

/**
 * Example 12: Card with Pixelated Border
 * Use case: Component with PixelBlast accent
 */
export function Example12_CardWithPixelBorder() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#f5f5f5' }}>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '400px',
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Pixelated accent bar at top */}
          <div style={{ position: 'relative', height: '60px' }}>
            <PixelBlast
              variant="square"
              pixelSize={4}
              color="#667EEA"
              transparent={false}
            />
          </div>

          {/* Card content */}
          <div style={{ padding: '40px' }}>
            <h2>Featured Card</h2>
            <p>This card features a PixelBlast accent at the top</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Summary of all examples:
 * 
 * 1. Default - Basic usage
 * 2. Colorful Circles - Vibrant design
 * 3. Minimalist - Clean aesthetic
 * 4. High Energy - Dynamic feel
 * 5. Liquid Effect - Interactive
 * 6. Grainy Texture - Retro style
 * 7. Purple Dark - Theme matching
 * 8. Cyberpunk - Futuristic look
 * 9. Soft Pastel - Gentle design
 * 10. Interactive Controls - User customization
 * 11. Hero Section - Landing page
 * 12. Card Border - Component accent
 */

import React from 'react';
