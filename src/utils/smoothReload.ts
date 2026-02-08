/**
 * Smoothly reload the page with a fade-out animation
 * @param delay - Delay in milliseconds before reload (default: 600ms)
 */
export const smoothReload = (delay: number = 600) => {
  // Add fade-out animation to body
  document.body.classList.add('animate-smoothReload');
  
  // Reload after animation completes
  setTimeout(() => {
    window.location.reload();
  }, delay);
};

/**
 * Quick smooth reload with shorter animation
 */
export const quickReload = () => smoothReload(400);
