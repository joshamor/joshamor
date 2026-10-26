
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, X, ArrowUpRight } from 'lucide-react'
import products from '../../data/products'
import './search.css'

const suggestions = [
  'New arrivals',
  'Blazers',
  'Dresses',
  'Trousers',
  'Knitwear',
]

const formatPrice = (price) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price)

export default function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) return []

    return products
      .filter((product) =>
        [
          product.name,
          product.category,
          product.slug,
        ].some((value) => value.toLowerCase().includes(normalizedQuery))
      )
      .slice(0, 6)
  }, [query])

  const showResults = query.trim().length > 0

  function selectSuggestion(suggestion) {
    setQuery(suggestion)
    inputRef.current?.focus()
  }

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search products">
      <button
        className="search-backdrop"
        aria-label="Close search"
        onClick={onClose}
        tabIndex={-1}
      />

      <section className="search-panel">
        <div className="search-panel-header">
          <Link
            to="/"
            className="search-wordmark"
            onClick={onClose}
          >
            JOSH AMOR
          </Link>

          <button
            className="search-close"
            onClick={onClose}
            aria-label="Close search"
          >
            <X size={23} strokeWidth={1.3} />
          </button>
        </div>

        <form
          className="search-input-row"
          onSubmit={(event) => event.preventDefault()}
          role="search"
        >
          <Search size={22} strokeWidth={1.3} />

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What are you looking for?"
            aria-label="Search products"
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
            >
              Clear
            </button>
          )}
        </form>

        <div className="search-panel-content">
          {!showResults ? (
            <section className="search-suggestions">
              <p className="search-section-label">Popular searches</p>

              <div className="search-suggestion-list">
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion}
                    <ArrowUpRight size={14} strokeWidth={1.3} />
                  </button>
                ))}
              </div>
            </section>
          ) : results.length > 0 ? (
            <section className="search-results">
              <p className="search-section-label">
                {results.length} matching {results.length === 1 ? 'item' : 'items'}
              </p>

              <div className="search-product-grid">
                {results.map((product) => (
                  <Link
                    to={`/products/${product.slug}`}
                    key={product.id}
                    className="search-product"
                    onClick={onClose}
                  >
                    <div className="search-product-image">
                      <img src={product.image} alt={product.name} />
                    </div>

                    <p>{product.name}</p>
                    <span>{formatPrice(product.price)}</span>
                  </Link>
                ))}
              </div>

              <p className="search-placeholder-note">
                Showing sample products. The catalogue will be updated
                with the brand's actual inventory.
              </p>
            </section>
          ) : (
            <div className="search-no-results">
              <p className="search-section-label">No results found</p>
              <h2>Nothing here just yet.</h2>
              <p>
                Try another product name or browse our suggested categories.
              </p>

              <div className="search-suggestion-list">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion}
                    <ArrowUpRight size={14} strokeWidth={1.3} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
