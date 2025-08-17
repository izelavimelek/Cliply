# 🎨 Cliply Brand Colors

## **Quick Reference Guide**

### 🌞 **Light Mode Colors**

| Element | Hex Code | HSL | Usage |
|---------|----------|-----|-------|
| **Background** | `#F9FAFB` | `220 14% 96%` | Main page background |
| **Surface/Cards** | `#FFFFFF` | `0 0% 100%` | Cards, modals, inputs |
| **Text Primary** | `#111827` | `220 13% 18%` | Headings, main text |
| **Text Secondary** | `#4B5563` | `220 9% 46%` | Subtitles, descriptions |
| **Brand Blue** | `#2563EB` | `217 91% 60%` | Primary buttons, links |
| **Brand Blue Hover** | `#1D4ED8` | `217 91% 55%` | Button hover states |
| **Borders** | `#E5E7EB` | `220 13% 91%` | Dividers, input borders |
| **Success** | `#10B981` | `160 84% 39%` | Success messages, checkmarks |
| **Warning** | `#F59E0B` | `38 92% 50%` | Warning messages, alerts |
| **Error** | `#EF4444` | `0 84% 60%` | Error messages, validation |

### 🌙 **Dark Mode Colors**

| Element | Hex Code | HSL | Usage |
|---------|----------|-----|-------|
| **Background** | `#0F172A` | `222 84% 5%` | Main page background |
| **Surface/Cards** | `#1E293B` | `217 33% 17%` | Cards, modals, inputs |
| **Text Primary** | `#F9FAFB` | `220 14% 96%` | Headings, main text |
| **Text Secondary** | `#CBD5E1` | `215 25% 27%` | Subtitles, descriptions |
| **Brand Blue** | `#3B82F6` | `217 91% 60%` | Primary buttons, links |
| **Brand Blue Hover** | `#60A5FA` | `217 91% 60%` | Button hover states |
| **Borders** | `#334155` | `215 25% 27%` | Dividers, input borders |
| **Success** | `#34D399` | `160 84% 60%` | Success messages, checkmarks |
| **Warning** | `#F59E0B` | `38 92% 50%` | Warning messages, alerts |
| **Error** | `#F87171` | `0 84% 60%` | Error messages, validation |

## **CSS Variables Usage**

### **In Components**
```tsx
// Use CSS variables for consistent theming
<div className="bg-background text-foreground border-border">
  <h1 className="text-foreground">Title</h1>
  <p className="text-muted-foreground">Description</p>
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Action
  </button>
</div>
```

### **Custom Brand Utilities**
```tsx
// Use our custom brand color classes
<button className="bg-brand-blue hover:bg-brand-blue-hover text-white">
  Primary Action
</button>

<div className="text-success">✓ Success!</div>
<div className="text-warning">⚠ Warning</div>
<div className="text-error">✗ Error</div>
```

## **Color Psychology**

### **Brand Blue (#2563EB / #3B82F6)**
- **Trust**: Professional and reliable
- **Technology**: Modern and innovative
- **Action**: Encourages engagement
- **Accessibility**: High contrast in both themes

### **Background Colors**
- **Light**: Soft, clean, professional
- **Dark**: Sophisticated, easy on eyes
- **Contrast**: Excellent readability in both modes

### **Semantic Colors**
- **Success**: Growth, completion, positive outcomes
- **Warning**: Attention, caution, important notices
- **Error**: Issues, validation, user feedback

## **Accessibility Features**

### **Contrast Ratios**
- **Light Mode**: All text meets WCAG AA standards
- **Dark Mode**: Enhanced contrast for better readability
- **Interactive Elements**: High contrast for accessibility

### **Color Blindness Support**
- **Not Color-Only**: Information conveyed through multiple means
- **High Contrast**: Clear distinction between elements
- **Semantic Markers**: Icons and text support color coding

## **Implementation Guidelines**

### **Do's ✅**
- Use CSS variables for all colors
- Test in both light and dark modes
- Maintain consistent contrast ratios
- Use semantic colors appropriately

### **Don'ts ❌**
- Hardcode hex values
- Rely solely on color for information
- Use low contrast combinations
- Mix different color systems

## **Design System Integration**

### **Component Library**
All shadcn/ui components automatically use these colors through CSS variables.

### **Custom Components**
```tsx
// Example of a custom component using brand colors
export function BrandCard({ title, children }) {
  return (
    <div className="bg-card text-card-foreground border-border rounded-lg p-6 shadow-sm">
      <h3 className="text-foreground font-semibold mb-2">{title}</h3>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}
```

### **Responsive Design**
Colors work consistently across all screen sizes and devices.

---

**Remember**: These colors are carefully chosen to represent Cliply's brand identity while ensuring excellent user experience in both light and dark modes. Always use the CSS variables or utility classes to maintain consistency.
