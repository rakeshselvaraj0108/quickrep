# PixelBlast Component Documentation

## Overview

`PixelBlast` is an advanced React component that renders an interactive WebGL-based pixelated background using Three.js and postprocessing effects. It supports multiple pixel shapes, interactive ripple effects, liquid distortion, and customizable visual properties.

## Features

- ✨ **Multiple Pixel Shapes**: Square, Circle, Triangle, Diamond
- 🎯 **Interactive Ripples**: Click/touch creates expanding ripple effects
- 💧 **Liquid Effects**: Pointer trail-based distortion effects
- 🎨 **Customizable Colors**: Full hex color support
- 📊 **Postprocessing**: Grain/noise overlay support
- 📱 **Responsive**: Automatically adapts to container size
- ⚡ **Performance Optimized**: Visibility detection, DPI-aware rendering
- 🎭 **Shape Variants**: 4 different pixel rendering modes

## Props

### Core Visual Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'square' \| 'circle' \| 'triangle' \| 'diamond'` | `'square'` | Pixel shape type |
| `pixelSize` | `number` | `3` | Size of individual pixels in pixels |
| `color` | `string` (hex) | `'#B19EEF'` | Pixel color (hex format) |
| `patternScale` | `number` | `2` | Scale factor for pattern density |
| `patternDensity` | `number` | `1` | Density multiplier for pixel distribution |
| `edgeFade` | `number` | `0.5` | Edge fade strength (0-1) |

### Ripple Effect Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableRipples` | `boolean` | `true` | Enable/disable ripple effects on click |
| `rippleSpeed` | `number` | `0.3` | Speed of ripple wave propagation |
| `rippleThickness` | `number` | `0.1` | Thickness/amplitude of ripples |
| `rippleIntensityScale` | `number` | `1` | Multiplier for ripple intensity |

### Liquid Effect Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `liquid` | `boolean` | `false` | Enable liquid/distortion effect |
| `liquidStrength` | `number` | `0.1` | Strength of liquid distortion |
| `liquidRadius` | `number` | `1` | Radius of liquid effect influence |

### Jitter & Noise Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pixelSizeJitter` | `number` | `0` | Random variation in pixel size |
| `noiseAmount` | `number` | `0` | Grain/noise overlay intensity (0-1) |

### Rendering Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `transparent` | `boolean` | `true` | Transparent background (alpha channel) |

## Usage Examples

### Basic Usage

```tsx
import PixelBlast from '@/components/PixelBlast';

export function MyBackground() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <PixelBlast />
      {/* Your content here */}
    </div>
  );
}
```

### Custom Configuration

```tsx
<PixelBlast
  variant="circle"
  pixelSize={5}
  color="#FF00FF"
  enableRipples={true}
  rippleSpeed={0.5}
  rippleThickness={0.2}
  edgeFade={0.3}
  noiseAmount={0.3}
/>
```

### With Liquid Effects

```tsx
<PixelBlast
  variant="diamond"
  color="#00FFFF"
  liquid={true}
  liquidStrength={0.15}
  liquidRadius={1.5}
  enableRipples={true}
/>
```

### Interactive Demo Setup

```tsx
import PixelBlastDemo from '@/components/PixelBlastDemo';

export default function Page() {
  return <PixelBlastDemo />;
}
```

## Shader System

The component uses a custom GLSL fragment shader with support for:

- **Shape Rendering**: Functions for square, circle, triangle, and diamond shapes
- **Ripple Physics**: Distance-based wave propagation with decay
- **Jitter**: Random noise-based pixel size variation
- **Edge Fading**: Smooth fade at container edges
- **Multiple Ripple Tracking**: Up to 4 simultaneous ripples

### Uniforms

```glsl
uniform vec3 uColor;                      // RGB color
uniform vec2 uResolution;                 // Canvas resolution
uniform float uTime;                      // Animation time
uniform float uPixelSize;                 // Pixel size in pixels
uniform float uScale;                     // Pattern scale
uniform float uDensity;                   // Pattern density
uniform float uPixelJitter;               // Pixel size jitter
uniform bool uEnableRipples;              // Ripple toggle
uniform float uRippleSpeed;               // Ripple propagation speed
uniform float uRippleThickness;           // Ripple amplitude
uniform float uRippleIntensity;           // Ripple intensity scale
uniform float uEdgeFade;                  // Edge fade strength
uniform int uShapeType;                   // 0=square, 1=circle, 2=triangle, 3=diamond
uniform bool uLiquid;                     // Liquid effect toggle
uniform float uLiquidStrength;            // Liquid distortion strength
uniform vec4 uClickPositions[4];          // Ripple origin positions (x, y, age, unused)
```

## Interactions

### Click/Touch Ripples

- Click anywhere on the component to create a ripple effect
- Ripples propagate outward and fade over time
- Up to 4 simultaneous ripples supported
- Uses `pointerdown` events for cross-device support

### Pointer Trails (Liquid Mode)

- When `liquid=true`, pointer movement creates trails
- Trails affect pixel distortion based on `liquidStrength` and `liquidRadius`
- Trail history limited to 20 points for performance
- Calculated velocity-based distortion

## Performance Optimizations

### Visibility Detection

- Uses `IntersectionObserver` to pause rendering when off-screen
- Reduces CPU/GPU usage for hidden components
- Automatically resumes when visible

### DPI Awareness

- Uses `window.devicePixelRatio` for sharp rendering on high-DPI displays
- Adjusts pixel size and resolution calculations automatically

### Responsive Canvas

- Automatically resizes on window resize
- Updates uniforms for resolution changes
- Maintains aspect ratio without distortion

## Browser Support

- Modern browsers with WebGL 2.0 support
- Requires `requestAnimationFrame` support
- Tested on Chrome, Firefox, Safari, Edge (recent versions)

## Memory Management

The component properly cleans up resources:

- Cancels animation frames on unmount
- Disposes Three.js geometries and materials
- Disposes renderer and EffectComposer
- Removes event listeners
- Clears IntersectionObserver

## Style Customization

The component adds a `.pixel-blast-container` class for CSS customization:

```css
.pixel-blast-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: transparent;
  z-index: 0;
}

.pixel-blast-container canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

## Performance Tips

1. **Reduce pixelSize** for better performance (smaller pixels = more calculations)
2. **Disable ripples** if not needed: `enableRipples={false}`
3. **Lower noiseAmount** to reduce postprocessing overhead
4. **Use larger patternScale** to reduce pixel density
5. **Limit edgeFade** to avoid expensive edge calculations

## Advanced Usage

### Custom Color Palettes

```tsx
const colors = ['#FF00FF', '#00FFFF', '#FFFF00'];
const [color, setColor] = useState(colors[0]);

<PixelBlast color={color} />;
```

### Dynamic Prop Changes

All props are reactive - changing them will update the visualization in real-time:

```tsx
const [pixelSize, setPixelSize] = useState(3);
const [variant, setVariant] = useState<'square' | 'circle'>('square');

return <PixelBlast pixelSize={pixelSize} variant={variant} />;
```

### Combining with Content

```tsx
<div style={{ position: 'relative', width: '100%', height: '100vh' }}>
  {/* Background layer */}
  <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
    <PixelBlast variant="circle" />
  </div>

  {/* Content layer */}
  <div style={{ position: 'relative', zIndex: 1, padding: '40px' }}>
    <h1>Your Content Here</h1>
  </div>
</div>
```

## Troubleshooting

### Canvas appears black
- Check that `transparent={false}` if you need a solid background
- Verify Three.js and dependencies are properly installed

### Ripples not appearing
- Ensure `enableRipples={true}`
- Check that `rippleIntensityScale > 0`
- Verify `rippleThickness` is > 0

### Performance issues
- Reduce `pixelSize` (larger values = slower)
- Disable `noiseAmount` or set to 0
- Disable `liquid` effect
- Set `patternScale` higher to reduce pixel count

### On mobile devices
- Use larger `pixelSize` for better performance
- Disable `liquid` effect
- Reduce `rippleIntensityScale`

## Technical Stack

- **Three.js**: 3D rendering engine
- **React Hooks**: State and lifecycle management
- **GLSL**: Custom fragment and vertex shaders
- **EffectComposer**: Postprocessing pipeline
- **IntersectionObserver**: Visibility detection

## License

This component is part of the QuickPrep application.
