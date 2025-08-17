# Dark Mode Design Guide

This document outlines the dark mode design system for Cliply, ensuring consistent theming across all pages and components.

## 🎨 **Theme System Overview**

Cliply uses a comprehensive dark/light mode system with:
- **Light Mode**: Clean, bright interface with subtle shadows
- **Dark Mode**: Sophisticated dark interface with proper contrast
- **System Mode**: Automatically follows user's system preference
- **Persistent**: Theme choice is saved in localStorage

### **Brand Color Philosophy**
Our color palette is designed for:
- **Professional Appearance**: Clean, modern aesthetic
- **High Contrast**: Excellent readability in all conditions
- **Brand Consistency**: Unified visual identity across themes
- **Accessibility**: WCAG AA compliant contrast ratios
- **User Comfort**: Reduced eye strain in both light and dark environments

## 🌈 **Color Palette**

### **Primary Colors**
```css
/* Light Mode */
--primary: 217 91% 60%               /* #2563EB - brand blue, vibrant */
--primary-foreground: 0 0% 100%      /* #FFFFFF - white text on blue */

/* Dark Mode */
--primary: 217 91% 60%               /* #3B82F6 - bright blue pops against dark */
--primary-foreground: 0 0% 100%      /* #FFFFFF - white text on blue */
```

### **Background Colors**
```css
/* Light Mode */
--background: 220 14% 96%            /* #F9FAFB - off-white, soft background */
--card: 0 0% 100%                    /* #FFFFFF - pure white */
--popover: 0 0% 100%                 /* #FFFFFF - pure white */

/* Dark Mode */
--background: 222 84% 5%             /* #0F172A - deep slate/navy */
--card: 217 33% 17%                  /* #1E293B - slate gray, elevated card */
--popover: 217 33% 17%               /* #1E293B - slate gray */
```

### **Text Colors**
```css
/* Light Mode */
--foreground: 220 13% 18%             /* #111827 - almost black, high contrast */
--muted-foreground: 220 9% 46%        /* #4B5563 - muted gray */

/* Dark Mode */
--foreground: 220 14% 96%             /* #F9FAFB - almost white */
--muted-foreground: 215 25% 27%       /* #CBD5E1 - muted light gray-blue */
```

### **Border & Input Colors**
```css
/* Light Mode */
--border: 220 13% 91%                 /* #E5E7EB - light gray line */
--input: 220 13% 91%                  /* #E5E7EB - light gray line */

/* Dark Mode */
--border: 215 25% 27%                 /* #334155 - subtle slate border */
--input: 215 25% 27%                  /* #334155 - subtle slate border */
```

### **Semantic Colors**
```css
/* Success Colors */
--success: 160 84% 39%                /* #10B981 - emerald green (light) */
--success: 160 84% 60%                /* #34D399 - mint green (dark) */

/* Warning Colors */
--warning: 38 92% 50%                 /* #F59E0B - amber (both themes) */

/* Error Colors */
--destructive: 0 84% 60%              /* #EF4444 - red (light) */
--destructive: 0 84% 60%              /* #F87171 - softer red (dark) */
```

## 🎯 **Component-Specific Guidelines**

### **Landing Page**
- **Hero Section**: Gradient backgrounds that adapt to theme
- **Cards**: Subtle shadows in light mode, glowing borders in dark mode
- **Buttons**: High contrast with theme-appropriate hover states
- **Navigation**: Semi-transparent with backdrop blur

### **Authentication Pages**
- **Forms**: Clean backgrounds with proper contrast
- **Input Fields**: Clear borders and focus states
- **Buttons**: Consistent with landing page styling
- **Error Messages**: Red tones that work in both themes

### **Dashboard Pages**
- **Sidebar**: Dark theme uses darker grays, light theme uses light grays
- **Content Areas**: Proper contrast for readability
- **Tables**: Alternating row colors that work in both themes
- **Charts**: Color schemes that are accessible in both modes

### **Cards & Containers**
```css
/* Light Mode */
.card {
  background: white;
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Dark Mode */
.card {
  background: var(--card);
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
```

## 🔧 **Implementation Standards**

### **CSS Variables Usage**
Always use CSS variables for colors:
```css
/* ✅ Correct */
color: hsl(var(--foreground));
background: hsl(var(--background));

/* ❌ Incorrect */
color: #000000;
background: white;
```

### **Dark Mode Classes**
Use Tailwind's dark: modifier consistently:
```css
/* ✅ Correct */
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"

/* ❌ Incorrect */
className="bg-white text-black"
```

### **Transitions**
Add smooth transitions for theme changes:
```css
/* ✅ Correct */
className="transition-colors duration-200"

/* ❌ Incorrect */
className="bg-white dark:bg-gray-900"
```

## 📱 **Responsive Considerations**

### **Mobile Dark Mode**
- Ensure touch targets remain visible
- Maintain proper contrast ratios
- Test on various mobile devices

### **High Contrast Mode**
- Support for users with visual impairments
- Maintain WCAG AA compliance
- Test with screen readers

## 🧪 **Testing Checklist**

### **Theme Switching**
- [ ] Theme toggle button works on all pages
- [ ] Theme persists across page refreshes
- [ ] System theme detection works correctly
- [ ] No flash of unstyled content (FOUC)

### **Visual Consistency**
- [ ] All components have proper dark mode styles
- [ ] Text remains readable in both themes
- [ ] Interactive elements have proper hover states
- [ ] Icons and images are visible in both themes

### **Accessibility**
- [ ] Color contrast meets WCAG guidelines
- [ ] Focus indicators are visible in both themes
- [ ] Screen reader compatibility maintained
- [ ] Keyboard navigation works properly

## 🚀 **Adding Dark Mode to New Components**

### **Step 1: Import Theme Hook**
```tsx
import { useTheme } from "next-themes";

export function MyComponent() {
  const { theme } = useTheme();
  // Component logic
}
```

### **Step 2: Use CSS Variables**
```tsx
return (
  <div className="bg-background text-foreground border-border">
    <h1 className="text-foreground">Title</h1>
    <p className="text-muted-foreground">Description</p>
  </div>
);
```

### **Step 3: Add Dark Mode Variants**
```tsx
return (
  <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
      Click me
    </button>
  </div>
);
```

### **Step 4: Use Brand Color Utilities**
```tsx
// Use our custom brand color utilities
return (
  <div className="bg-background text-foreground">
    <button className="bg-brand-blue hover:bg-brand-blue-hover text-white">
      Primary Action
    </button>
    <div className="text-success">Success Message</div>
    <div className="text-warning">Warning Message</div>
    <div className="text-error">Error Message</div>
  </div>
);
```

### **Step 4: Test Both Themes**
- Switch between light and dark modes
- Verify all states (hover, focus, active)
- Check contrast and readability

## 📚 **Resources & References**

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [WCAG Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/quickref/#contrast-minimum)
- [Material Design Dark Theme](https://material.io/design/color/dark-theme.html)

## 🔍 **Common Issues & Solutions**

### **Theme Not Persisting**
- Check localStorage implementation
- Verify ThemeProvider wrapper
- Ensure proper attribute setting

### **Flash of Unstyled Content**
- Use `suppressHydrationWarning` on html element
- Implement proper loading states
- Check for client-side only code

### **Inconsistent Colors**
- Verify CSS variable usage
- Check for hardcoded colors
- Ensure proper dark: modifiers

### **Performance Issues**
- Minimize theme-dependent CSS
- Use CSS variables efficiently
- Avoid unnecessary re-renders

## 📋 **Maintenance Checklist**

### **Monthly**
- [ ] Review new components for dark mode compliance
- [ ] Test theme switching on all pages
- [ ] Verify accessibility standards
- [ ] Update design tokens if needed

### **Quarterly**
- [ ] Audit color contrast ratios
- [ ] Review user feedback on themes
- [ ] Update documentation
- [ ] Performance optimization review

---

**Remember**: Dark mode is not just about inverting colors. It's about creating a comfortable, accessible experience that maintains the brand's visual identity while respecting user preferences and accessibility needs.
