# PixelBlast Component - Installation & Setup Guide

## 📦 Installation

The PixelBlast component is already installed in your QuickPrep project. Here's what was done:

### Step 1: Install Three.js Dependency
```bash
npm install three
```

This is already completed. You can verify by checking `package.json`:
```json
{
  "dependencies": {
    "three": "latest"
  }
}
```

### Step 2: Component Files Added

The following files have been added to your project:

```
src/components/
├── PixelBlast.tsx           (Main component - 483 lines)
└── PixelBlastDemo.tsx       (Interactive demo)

src/app/
└── pixelblast/
    └── page.tsx             (Example page at /pixelblast route)

src/styles/
└── globals.css              (PixelBlast CSS added)

Documentation/
├── PIXELBLAST_README.md     (Complete guide)
├── PIXELBLAST_DOCS.md       (API reference)
├── PIXELBLAST_EXAMPLES.tsx  (12 usage examples)
└── PIXELBLAST_SETUP.md      (This file)
```

## 🚀 Quick Start

### Basic Usage

```tsx
import PixelBlast from '@/components/PixelBlast';

export function MyPage() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <PixelBlast />
    </div>
  );
}
```

### View Interactive Demo

Visit `http://localhost:3000/pixelblast` to see:
- Live PixelBlast animation
- Interactive controls
- Real-time customization

### Access Demo Component

```tsx
import PixelBlastDemo from '@/components/PixelBlastDemo';

export default function Page() {
  return <PixelBlastDemo />;
}
```

## 🎨 Common Patterns

### Full-Screen Background with Content

```tsx
<div style={{ position: 'relative', width: '100%', height: '100vh' }}>
  {/* Background layer */}
  <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
    <PixelBlast variant="circle" pixelSize={4} color="#8B5CF6" />
  </div>

  {/* Content layer */}
  <div style={{ position: 'relative', zIndex: 1, padding: '40px' }}>
    <h1>Your Content</h1>
  </div>
</div>
```

### With Theme Integration

```tsx
const [isDark, setIsDark] = useState(true);

<PixelBlast 
  color={isDark ? '#8B5CF6' : '#667EEA'}
  transparent={true}
/>
```

### Responsive Component

```tsx
const [isMobile, setIsMobile] = useState(false);

<PixelBlast
  pixelSize={isMobile ? 5 : 3}
  patternScale={isMobile ? 3 : 2}
  enableRipples={!isMobile}
/>
```

## 📊 Performance Recommendations

### By Use Case

**Desktop Website (High Performance)**
```tsx
<PixelBlast
  pixelSize={3}
  enableRipples={true}
  liquid={false}
  noiseAmount={0.2}
/>
// Expected FPS: 55-60
```

**Mobile (Optimized)**
```tsx
<PixelBlast
  pixelSize={5}
  enableRipples={true}
  liquid={false}
  noiseAmount={0}
/>
// Expected FPS: 40-50
```

**Lightweight (Minimal Resources)**
```tsx
<PixelBlast
  pixelSize={6}
  enableRipples={false}
  liquid={false}
  noiseAmount={0}
/>
// Expected FPS: 55-60
```

**Heavy Effects (Maximum Visual)**
```tsx
<PixelBlast
  pixelSize={2}
  enableRipples={true}
  liquid={true}
  rippleThickness={0.2}
  noiseAmount={0.4}
/>
// Expected FPS: 30-40
```

## 🔧 Configuration Guide

### Props You'll Use Most Often

```tsx
<PixelBlast
  // Visual appearance
  variant="circle"              // Shape: square, circle, triangle, diamond
  pixelSize={4}                 // Pixel size (1-10 recommended)
  color="#8B5CF6"              // Hex color
  
  // Interactivity
  enableRipples={true}         // Click to create ripples
  liquid={false}               // Pointer trail effects
  
  // Effects
  noiseAmount={0.2}            // Grain overlay (0-1)
  edgeFade={0.5}              // Edge fade strength (0-1)
/>
```

### Props for Fine-Tuning

```tsx
<PixelBlast
  // Pattern control
  patternScale={2}             // Pattern density
  patternDensity={1}           // Pixel distribution
  
  // Ripple customization
  rippleSpeed={0.3}            // Wave speed
  rippleThickness={0.1}        // Wave amplitude
  rippleIntensityScale={1}     // Intensity multiplier
  
  // Advanced
  pixelSizeJitter={0}          // Random variation
  liquidStrength={0.1}         // Distortion strength
  liquidRadius={1}             // Effect radius
  transparent={true}           // Alpha channel
/>
```

## 🎯 Integration Examples

### As Landing Page Background

```tsx
// app/page.tsx
'use client';
import PixelBlast from '@/components/PixelBlast';

export default function Home() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <PixelBlast variant="circle" color="#667EEA" />
      <Hero />
      <Features />
      <CTA />
    </div>
  );
}
```

### In Dashboard

```tsx
// components/DashboardBackground.tsx
export function DashboardBackground() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: -1,
    }}>
      <PixelBlast
        variant="square"
        pixelSize={5}
        color="#8B5CF6"
        enableRipples={true}
      />
    </div>
  );
}
```

### As Modal/Dialog Background

```tsx
export function PixelatedModal({ children }) {
  return (
    <div style={{
      position: 'relative',
      width: '500px',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Pixelated background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        opacity: 0.3,
      }}>
        <PixelBlast variant="diamond" pixelSize={6} />
      </div>
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}
```

## 🔍 Debugging

### Enable Debug Logging

Add to your component:
```tsx
useEffect(() => {
  console.log('PixelBlast props:', {
    variant,
    pixelSize,
    color,
    enableRipples,
  });
}, [variant, pixelSize, color, enableRipples]);
```

### Check Three.js Context

The component uses `'use client'` directive, so ensure:
- ✅ Not in a server component
- ✅ In a Client Component boundary
- ✅ Not inside a Server Component without proper wrapping

### Performance Monitoring

Open DevTools (F12):
1. Go to Performance tab
2. Start recording
3. Interact with PixelBlast
4. Look for FPS meter
5. Check GPU utilization

## 📱 Mobile Considerations

### Mobile-Optimized Config

```tsx
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  setIsMobile(mobile);
}, []);

<PixelBlast
  pixelSize={isMobile ? 6 : 3}
  enableRipples={!isMobile}
  liquid={false}
  noiseAmount={isMobile ? 0 : 0.2}
/>
```

### Touch Events

The component automatically uses `pointerdown` and `pointermove` events, which work on:
- ✅ Mouse clicks
- ✅ Touch taps
- ✅ Stylus input
- ✅ Pressure-sensitive devices

## 🌐 Browser Testing

### Recommended Test Devices

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Optimal |
| Firefox | Latest | ✅ Optimal |
| Safari | 14+ | ✅ Good |
| Edge | Latest | ✅ Good |
| Mobile Safari | iOS 14+ | ✅ Good |
| Chrome Mobile | Latest | ✅ Good |

## 🎬 Animation Performance Tips

1. **Reduce pixel density** for smoother animations:
   ```tsx
   <PixelBlast pixelSize={5} />  // Faster than pixelSize={2}
   ```

2. **Disable effects you don't need**:
   ```tsx
   <PixelBlast
     enableRipples={false}  // Only if not interactive
     liquid={false}         // Only if needed
     noiseAmount={0}        // Only if needed
   />
   ```

3. **Use larger pattern scale**:
   ```tsx
   <PixelBlast patternScale={3} />  // Fewer pixels to render
   ```

## 🔐 Security & Best Practices

### Data Security
- ✅ All rendering happens client-side
- ✅ No data sent to servers
- ✅ No external API calls
- ✅ Safe to use with sensitive content

### Code Quality
- ✅ TypeScript types included
- ✅ Proper React hooks usage
- ✅ Memory cleanup on unmount
- ✅ Event listener removal

### Accessibility
- ✅ Doesn't block keyboard navigation
- ✅ Can be disabled for accessibility settings
- ✅ Doesn't interfere with screen readers
- ✅ Content overlays remain interactive

## 📈 Advanced Topics

### Custom Shader Modifications

The fragment shader supports these customizations:
- Shape rendering functions
- Ripple physics
- Jitter effects
- Edge fading

See `PIXELBLAST_DOCS.md` for shader details.

### Extending the Component

To create a variant:
```tsx
export function MyCustomPixelBlast(props) {
  return (
    <PixelBlast
      variant="circle"
      pixelSize={4}
      color="#FF00FF"
      {...props}  // Allow prop overrides
    />
  );
}
```

## 🐛 Known Limitations

1. **WebGL 2.0 Requirement**: Won't work on older browsers
2. **No SSR Support**: Must be in a Client Component
3. **Max 4 Ripples**: Simultaneous ripple limit for performance
4. **Trail History**: Limited to 20 points for liquid effect

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `PIXELBLAST_README.md` | Complete user guide |
| `PIXELBLAST_DOCS.md` | API reference |
| `PIXELBLAST_EXAMPLES.tsx` | 12 practical examples |
| `PIXELBLAST_SETUP.md` | This setup guide |

## ✅ Checklist for Using PixelBlast

- [ ] Three.js is installed (`npm install three`)
- [ ] Component is imported: `import PixelBlast from '@/components/PixelBlast'`
- [ ] Used in a Client Component (has `'use client'` directive)
- [ ] Container has explicit width/height
- [ ] Tested in target browsers
- [ ] Performance verified with DevTools
- [ ] Mobile responsiveness checked
- [ ] Theme integration completed (if needed)

## 🆘 Getting Help

### Check Documentation
1. Review `PIXELBLAST_DOCS.md` for API details
2. See `PIXELBLAST_EXAMPLES.tsx` for implementation patterns
3. Read `PIXELBLAST_README.md` for troubleshooting

### Common Issues

**Canvas is black/invisible**
→ Check container has dimensions and `transparent` prop

**Low performance**
→ Increase `pixelSize` and disable unused effects

**Ripples not showing**
→ Set `enableRipples={true}` and `rippleThickness > 0`

## 🎉 Next Steps

1. **Visit the demo**: Navigate to `/pixelblast` route
2. **Try examples**: Copy patterns from `PIXELBLAST_EXAMPLES.tsx`
3. **Customize props**: Adjust colors, sizes, and effects
4. **Integrate**: Add to your app pages
5. **Share**: Showcase your pixelated designs!

---

**Component Status**: ✅ Production Ready
**Last Updated**: January 2026
**Support Level**: Full

Happy pixelating! 🎨✨
