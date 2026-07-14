export function hexToRgba(hex: string, opacityPercent: number = 100): string {
  if (!hex || hex === 'transparent') return 'transparent';
  let c = hex.trim();
  
  // If it's already rgb or rgba, parse and update opacity
  if (c.startsWith('rgb')) {
    const match = c.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (match) {
      const r = match[1];
      const g = match[2];
      const b = match[3];
      const alpha = opacityPercent / 100;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return c;
  }
  
  if (!c.startsWith('#')) {
    if (opacityPercent === 100) return c;
    
    // Check if browser environment is available to compute colors (failsafe)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const tempElement = document.createElement('div');
        tempElement.style.color = c;
        document.body.appendChild(tempElement);
        const computedColor = window.getComputedStyle(tempElement).color;
        document.body.removeChild(tempElement);
        const match = computedColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (match) {
          return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacityPercent / 100})`;
        }
      } catch (e) {
        // Fallback
      }
    }
    return c;
  }
  
  c = c.substring(1);
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  if (c.length === 6) {
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const alpha = opacityPercent / 100;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}
