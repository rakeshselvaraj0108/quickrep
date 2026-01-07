# 🎨 QuickPrep Dark Mode UI - Quick Reference Guide

## 🚀 Quick Start

The application is running on **http://localhost:3000**

### **Pages to Visit:**
- 🏠 **Home:** `http://localhost:3000`
- 📝 **Login:** `http://localhost:3000/login`
- ✍️ **Register:** `http://localhost:3000/register`
- 📊 **Dashboard:** `http://localhost:3000/dashboard`

---

## 🎨 Design System at a Glance

### **Colors**

**Gradients (Primary Actions)**
```css
/* Purple to Pink Gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
```

**Solid Colors**
| Element | Color | Usage |
|---------|-------|-------|
| Background | `#0a0e27` | Page background |
| Surface | `rgba(20, 24, 41, 0.8)` | Cards, containers |
| Text Primary | `#f8fafc` | Main text |
| Text Secondary | `#cbd5e1` | Secondary text |
| Accent | `#667eea` | Buttons, links |
| Success | `#10b981` | Success states |
| Error | `#ef4444` | Error states |
| Warning | `#f59e0b` | Warning states |

### **Spacing Scale**
```
0.25rem (4px)    - Extra small
0.5rem (8px)     - Small
0.75rem (12px)   - Small-medium
1rem (16px)      - Medium
1.5rem (24px)    - Large
2rem (32px)      - Extra large
3rem (48px)      - Huge
```

### **Typography**

**Font Stack:**
```css
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif
```

**Font Sizes:**
- Display (h1): `2.5rem - 4rem`
- Heading (h2): `1.3rem - 2rem`
- Subheading (h3): `1.1rem - 1.5rem`
- Body: `0.95rem - 1.1rem`
- Small: `0.85rem - 0.9rem`
- Tiny: `0.75rem - 0.8rem`

**Font Weights:**
- Regular: `400`
- Medium: `500`
- Semi-Bold: `600`
- Bold: `700`
- Extra-Bold: `800`

---

## 🧩 Component Examples

### **Button Variants**

```tsx
/* Primary (Purple gradient) */
<button className="btn-primary">Get Started</button>

/* Secondary (Light background) */
<button className="btn-secondary">Learn More</button>

/* Outline (Border only) */
<button className="btn-outline">Cancel</button>

/* Danger (Red) */
<button className="btn-danger">Delete</button>
```

### **Form Inputs**

```tsx
<div className="form-group">
  <label className="form-label">Email</label>
  <input type="email" className="form-input" />
  {error && <span className="form-error">Error message</span>}
</div>

<textarea className="form-input" placeholder="Enter text..."></textarea>
```

### **Cards**

```tsx
<div className="dashboard-card">
  <div className="card-header">
    <h2 className="card-title">📝 Title</h2>
    <span className="char-count">250 chars</span>
  </div>
  <p>Card content goes here...</p>
</div>
```

### **Statistics**

```tsx
<div className="stat-box">
  <div className="stat-icon">⏱️</div>
  <div className="stat-content">
    <div className="stat-label">Study Time</div>
    <div className="stat-value">120m</div>
  </div>
</div>
```

### **Feature Cards**

```tsx
<div className="feature-card">
  <div className="feature-icon-box">🎴</div>
  <h3 className="feature-title">Smart Flashcards</h3>
  <p className="feature-description">AI-powered learning...</p>
</div>
```

---

## 🎬 Animations

### **Built-in CSS Animations**

```css
/* Fade in with slide up */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Quick spin for loaders */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Pulse effect */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Gradient color shift */
@keyframes gradientShift {
  0%, 100% { background: linear-gradient(135deg, #667eea 0%, #f093fb 100%); }
  50% { background: linear-gradient(135deg, #f093fb 0%, #667eea 100%); }
}
```

### **Using with Framer Motion**

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>

/* Staggered animations */
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible">
  {items.map(item => (
    <motion.div key={item} variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

## 📐 Layout Patterns

### **Hero Section**

```tsx
<section className="hero-section">
  <div className="hero-content">
    <h1 className="hero-title">
      <span className="gradient-text">Title</span>
    </h1>
    <p className="hero-description">Description...</p>
    <div className="hero-buttons">
      <button className="btn-primary">Action</button>
    </div>
  </div>
</section>
```

### **Two-Column Layout (Dashboard)**

```tsx
<div className="dashboard-grid">
  <div className="dashboard-section">
    {/* Left column */}
  </div>
  <div className="dashboard-sidebar">
    {/* Right column */}
  </div>
</div>
```

### **Feature Grid**

```tsx
<div className="features-grid">
  {features.map((feature) => (
    <div className="feature-card" key={feature.id}>
      {/* Feature content */}
    </div>
  ))}
</div>
```

---

## 🎯 Responsive Breakpoints

```css
/* Mobile First */
.element { /* 0px - 480px */ }

/* Tablet */
@media (min-width: 481px) { /* 481px - 768px */ }

/* Desktop */
@media (min-width: 769px) { /* 769px - 1024px */ }

/* Large Desktop */
@media (min-width: 1025px) { /* 1025px+ */ }
```

### **Common Patterns**

```css
/* Single column on mobile, multi-column on desktop */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1.3fr 0.95fr;
  }
}
```

---

## 🌓 Dark/Light Mode

### **Setting Theme**

```tsx
// In AppHeader.tsx
const toggleTheme = () => {
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
};
```

### **CSS Variables by Theme**

```css
:root {
  --color-bg: #0a0e27;
  --text-primary: #f8fafc;
  /* ... more variables */
}

html[data-theme="light"] {
  --color-bg: #f8fafc;
  --text-primary: #1e293b;
  /* ... more variables */
}
```

---

## ⚡ Performance Tips

✅ **Use CSS Variables** for consistent theming
✅ **Minimize JS Animations** - Prefer CSS
✅ **GPU Acceleration** - Use `transform` & `opacity`
✅ **Lazy Load Images** - For large media
✅ **Defer Non-Critical CSS** - For faster page load
✅ **Optimize Transitions** - Use `cubic-bezier(0.4, 0, 0.2, 1)`

---

## ♿ Accessibility Checklist

- [x] High contrast text (WCAG AA)
- [x] Proper focus states
- [x] Keyboard navigation
- [x] Semantic HTML
- [x] ARIA labels
- [x] Error messages
- [x] Color not only indicator

---

## 📁 CSS Files Reference

| File | Purpose | Size |
|------|---------|------|
| `theme.css` | Design tokens | Small |
| `globals.css` | Base styles | Medium |
| `home.css` | Home page styles | Medium |
| `auth.css` | Auth pages styles | Large |
| `dashboard.css` | Dashboard styles | Large |

---

## 🔧 Common Customizations

### **Change Primary Color**
```css
/* In theme.css */
--accent-primary: #3b82f6; /* Change to blue */
```

### **Increase Border Radius**
```css
.card { border-radius: 20px; } /* Was 16px */
```

### **Slow Down Animations**
```css
--transition-base: 500ms; /* Was 250ms */
```

### **Change Font**
```css
body {
  font-family: 'Inter', 'Segoe UI', sans-serif;
}
```

### **Add Dark Mode Tint**
```css
body::before {
  background: radial-gradient(circle, rgba(0,0,0,0.1), transparent);
}
```

---

## 🐛 Troubleshooting

### **Theme Not Persisting**
- Check `localStorage` in browser dev tools
- Clear cache: `Ctrl+Shift+Delete`
- Verify theme toggle function is called

### **Animations Lag**
- Use `transform` instead of `left/top`
- Reduce `blur()` filter on many elements
- Use CSS animations instead of JS

### **Colors Look Wrong**
- Check CSS cascade order
- Verify CSS custom properties are set
- Clear browser cache

### **Layout Breaking**
- Check responsive breakpoints
- Verify max-widths on containers
- Test with different viewport sizes

---

## 📚 Resources

**CSS Techniques Used:**
- CSS Grid & Flexbox
- CSS Custom Properties (Variables)
- CSS Gradients & Shadows
- Backdrop Filters
- Media Queries
- CSS Animations & Transitions

**JavaScript Libraries:**
- Next.js 14+
- Framer Motion (animations)
- React 18+

**Design Tools:**
- Color: https://coolors.co
- Gradients: https://gradient.shapefactory.co
- Shadows: https://www.layershadow.com
- Fonts: https://fonts.google.com

---

## ✨ What Makes This UI Great

1. **Consistency** - Unified design language throughout
2. **Responsiveness** - Works on all screen sizes
3. **Accessibility** - WCAG AA compliant
4. **Performance** - Optimized animations
5. **Maintainability** - Well-organized CSS
6. **Scalability** - Easy to extend
7. **Aesthetics** - Modern, professional look

---

## 🎉 You're All Set!

The QuickPrep UI is now **production-ready** with a beautiful, modern dark mode design. 

**Start building amazing learning experiences! 🚀**

---

*Last Updated: January 6, 2026*
*Status: ✅ Complete & Production Ready*
