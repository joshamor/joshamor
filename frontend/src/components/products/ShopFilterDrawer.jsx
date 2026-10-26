
import { useEffect, useState } from 'react'
import './shop-filter-drawer.css'

const SORT_OPTIONS = [
  'Standard',
  'Latest',
  'Oldest',
  'Price: Low to High',
  'Price: High to Low',
  'A-Z',
  'Z-A',
]

const COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#000000' },
  { name: 'Brown', hex: '#796e6d' },
  { name: 'Beige', hex: '#ddcfbd' },
  { name: 'Grey', hex: '#696969' },
  { name: 'Blue', hex: '#d7f7fb' },
]

const SIZES = [
  'One Size',
  '23', '24', '25', '26', '27', '28', '29', '30', '31',
  'XS', 'S', 'M', 'L', 'XL',
]

export default function ShopFilterDrawer({
  open,
  onClose,
  filters,
  onApply,
  resultCount,
}) {
  const [screen, setScreen] = useState('main')
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    if (open) {
      setDraft({
        sort: filters.sort,
        colors: [...filters.colors],
        sizes: [...filters.sizes],
      })
      setScreen('main')
    }
  }, [open, filters])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const toggleValue = (key, value) => {
    setDraft((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }))
  }

  const apply = () => {
    onApply(draft)
    onClose()
  }

  const reset = () => {
    setDraft({
      sort: 'Standard',
      colors: [],
      sizes: [],
    })
  }

  return (
    <div
      className="shop-filter-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <aside
        className="shop-filter-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Filter and sort products"
      >
        <header className="shop-filter-header">
          {screen !== 'main' && (
            <button
              type="button"
              className="shop-filter-back"
              onClick={() => setScreen('main')}
              aria-label="Back to filters"
            >
              ‹
            </button>
          )}

          <span>
            {screen === 'main'
              ? 'Filter & Sort'
              : screen === 'sort'
                ? 'Sort'
                : screen === 'colors'
                  ? 'Color'
                  : 'Size'}
          </span>

          <button
            type="button"
            className="shop-filter-close"
            onClick={onClose}
            aria-label="Close filters"
          >
            ×
          </button>
        </header>

        <div className="shop-filter-content">
          {screen === 'main' && (
            <>
              <button
                className="shop-filter-row"
                onClick={() => setScreen('sort')}
              >
                <span>Sort</span>
                <span className="shop-filter-current">
                  {draft.sort}
                </span>
                <span>›</span>
              </button>

              <button
                className="shop-filter-row"
                onClick={() => setScreen('colors')}
              >
                <span>Color</span>
                <span />
                <span>›</span>
              </button>

              <button
                className="shop-filter-row"
                onClick={() => setScreen('sizes')}
              >
                <span>Size</span>
                <span />
                <span>›</span>
              </button>

              {(draft.colors.length > 0 || draft.sizes.length > 0) && (
                <button
                  className="shop-filter-reset"
                  onClick={reset}
                >
                  Clear all filters
                </button>
              )}
            </>
          )}

          {screen === 'sort' && SORT_OPTIONS.map((option) => (
            <button
              key={option}
              className="shop-filter-option"
              onClick={() => setDraft((current) => ({
                ...current,
                sort: option,
              }))}
            >
              <span>{option}</span>
              {draft.sort === option && <span>✓</span>}
            </button>
          ))}

          {screen === 'colors' && COLORS.map((color) => (
            <button
              key={color.name}
              className="shop-filter-color"
              onClick={() => toggleValue('colors', color.name)}
              aria-pressed={draft.colors.includes(color.name)}
            >
              <span
                className={`shop-filter-swatch ${
                  color.name === 'White' ? 'is-white' : ''
                }`}
                style={{ backgroundColor: color.hex }}
              />
              <span>{color.name}</span>
              {draft.colors.includes(color.name) && (
                <span className="shop-filter-check">✓</span>
              )}
            </button>
          ))}

          {screen === 'sizes' && SIZES.map((size) => (
            <button
              key={size}
              className="shop-filter-option"
              onClick={() => toggleValue('sizes', size)}
              aria-pressed={draft.sizes.includes(size)}
            >
              <span>{size}</span>
              {draft.sizes.includes(size) && <span>✓</span>}
            </button>
          ))}
        </div>

        <footer className="shop-filter-footer">
          <button
            type="button"
            className="shop-filter-results"
            onClick={apply}
          >
            Show {resultCount} results
          </button>
        </footer>
      </aside>
    </div>
  )
}
