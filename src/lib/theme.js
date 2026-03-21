export function applyTheme(colors) {
  const root = document.documentElement
  root.style.setProperty('--color-primary',      colors.primary)
  root.style.setProperty('--color-accent',       colors.accent)
  root.style.setProperty('--color-accent2',      colors.accent2)
  root.style.setProperty('--color-bg',           colors.bg)
  root.style.setProperty('--color-border',       colors.border)
  root.style.setProperty('--color-sidebar-bg',   colors.primary)
  root.style.setProperty('--color-nav-active',   colors.accent + '22')
  root.style.setProperty('--color-nav-border',   colors.accent + '55')
  root.style.setProperty('--color-nav-bar',      colors.accent)
  root.style.setProperty('--color-dot',          colors.accent)
  root.style.setProperty('--color-glow',         colors.accent + '88')
}
