
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Languages,
  Globe2,

} from 'lucide-react'
import { media } from '../../data/media'
import './site-chrome.css'
import SearchOverlay from './SearchOverlay'
import { useCart } from '../../context/CartContext'

import {
  shopCategories,
  getShopCategoryPath,
} from '../../data/shopCategories'



const mainLinks = [
  // { label: 'New arrivals', to: '/collections/new-arrivals' },
  // { label: 'Signature pieces', to: '/collections/signature-pieces' },
  { label: 'Campaign library', to: '/campaigns' },
]

export default function Header() {
  const [shopOpen, setShopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileShopOpen, setMobileShopOpen] = useState(false)
  const closeTimer = useRef(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const { setCartOpen, itemCount } = useCart()

  const location = useLocation()
  const isContactPage = location.pathname === '/contact'

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => {
      setShopOpen(false)
    }, 140)
  }

  const closeMobileMenu = () => {
    setMobileOpen(false)
    setMobileShopOpen(false)
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShopOpen(false)
        closeMobileMenu()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      cancelClose()
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <header className={`site-header ${
        isContactPage ? 'site-header--overlay' : ''
      }`}>
      <div className="header-announcement">
        Tariffs included for U.S. orders
      </div>

      <div
        className="header-main"
        onMouseLeave={scheduleClose}
      >
        <Link
          to="/"
          className="header-logo"
          aria-label="Home"
          onClick={() => setShopOpen(false)}
        >
          JOSH AMOR
        </Link>

        <nav className="header-nav" aria-label="Main navigation">
          <button
            type="button"
            className={`shop-trigger ${shopOpen ? 'is-open' : ''}`}
            aria-expanded={shopOpen}
            aria-controls="shop-mega-menu"
            onMouseEnter={() => {
              cancelClose()
              setShopOpen(true)
            }}
            onFocus={() => setShopOpen(true)}
            onClick={() => setShopOpen((open) => !open)}
          >
            Shop
            <ChevronDown size={14} strokeWidth={1.5} />
          </button>

          {mainLinks.map((link) => (
            <Link key={link.label} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            aria-label="Search products"
            className="header-icon"
            onClick={() => {
              setShopOpen(false)
              setMobileOpen(false)
              setSearchOpen(true)
            }}
          >
            <Search size={21} strokeWidth={1.2} />
          </button>

          <button
            type="button"
            aria-label={`Shopping bag, ${itemCount} items`}
            className="header-icon header-cart-button"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={21} strokeWidth={1.2} />

            {itemCount > 0 && (
              <span className="header-cart-count" aria-hidden="true">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen((open) => !open)
              setMobileShopOpen(false)
            }}
          >
            {mobileOpen ? (
              <X size={23} strokeWidth={1.4} />
            ) : (
              <Menu size={23} strokeWidth={1.4} />
            )}
          </button>
        </div>

        <div
          id="shop-mega-menu"
          className={`mega-menu ${shopOpen ? 'is-open' : ''}`}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          aria-hidden={!shopOpen}
          inert={!shopOpen}
        >
          <div className="mega-categories">
            <p className="mega-menu-heading">Shop categories</p>


            {shopCategories.map((category) => (
              <Link
                key={category.label}
                to={getShopCategoryPath(category)}
                onClick={() => setShopOpen(false)}
              >
                {category.label}
              </Link>
            ))}


            <div className="mega-region">
              <button type="button">
                <Languages size={16} strokeWidth={1.7} />
                English
              </button>
              {/* <button type="button">
                <Globe2 size={17} strokeWidth={1.7} />
                Nigeria
              </button>*/}
            </div>
          </div>

          <div className="mega-featured">
            <Link
              to="/collections/new-arrivals"
              className="mega-image-card"
              onClick={() => setShopOpen(false)}
            >
              <img src={media.collections[0]} alt="" />
              <span>New arrivals</span>
            </Link>

            <Link
              to={getShopCategoryPath('Jackets & coats')}
              className="mega-image-card"
              onClick={() => setShopOpen(false)}
            >
              <img src={media.collections[1]} alt="" />
              <span>Jackets & coats</span>
            </Link>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <button
          type="button"
          className="mobile-menu-backdrop"
          aria-label="Close menu"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`mobile-drawer ${mobileOpen ? 'is-open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <div className="mobile-drawer-header">
          <span>Menu</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobileMenu}
          >
            <X size={22} strokeWidth={1.4} />
          </button>
        </div>

        <nav className="mobile-drawer-links">
          <div className="mobile-shop-group">
            <button
              type="button"
              className="mobile-nav-link mobile-shop-trigger"
              aria-expanded={mobileShopOpen}
              onClick={() => setMobileShopOpen((open) => !open)}
            >
              Shop
              <ChevronRight
                size={16}
                className={mobileShopOpen ? 'rotate-chevron' : ''}
              />
            </button>

            <div
              className={`mobile-category-list ${
                mobileShopOpen ? 'is-open' : ''
              }`}
            >

              {shopCategories.map((category) => (
                <Link
                  key={category.label}
                  to={getShopCategoryPath(category)}
                  onClick={closeMobileMenu}
                >
                  {category.label}
                </Link>
              ))}

            </div>
          </div>

          {mainLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}

          <Link
            to="/terms"
            className="mobile-secondary-link"
            onClick={closeMobileMenu}
          >
            Terms
          </Link>

          <Link
            to="/stores"
            className="mobile-secondary-link"
            onClick={closeMobileMenu}
          >
            Find your store
          </Link>
        </nav>

        <div className="mobile-drawer-footer">
          <button type="button">
            <Languages size={16} />
            English
          </button>
          {/* <button type="button">
            <Globe2 size={18} />
            Nigeria
          </button>*/}
          <a
            href="https://instagram.com"
            aria-label="Instagram"
            target="_blank"
            rel="noreferrer"
          >
           INSTAGRAM
          </a>
        </div>
      </aside>
      {searchOpen && (
        <SearchOverlay onClose={() => setSearchOpen(false)} />
      )}
    </header>
  )
}
