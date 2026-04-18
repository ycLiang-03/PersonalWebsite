export function useEventHandlers(callbacks) {
  const { onScroll, onResize, onMouseMove } = callbacks

  function handleScroll() {
    if (onScroll) {
      onScroll(window.scrollY)
    }
  }

  function handleResize() {
    if (onResize) {
      onResize()
    }
  }

  function handleMouseMove(event) {
    if (onMouseMove) {
      onMouseMove(event)
    }
  }

  function addEventListeners() {
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
  }

  function removeEventListeners() {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('mousemove', handleMouseMove)
  }

  return {
    addEventListeners,
    removeEventListeners
  }
}
