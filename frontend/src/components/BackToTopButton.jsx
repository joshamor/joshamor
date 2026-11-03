import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center border border-neutral-300 bg-white text-neutral-950 shadow-sm transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
    >
      <ArrowUp size={18} strokeWidth={1.5} />
    </button>
  )
}
