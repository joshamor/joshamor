
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

import MyLogo from "../../assets/logo.svg?react"



const megaMenuSections = {
  shop: {
    label: 'Shop',
    links: [
      { label: 'New Arrivals', to: '/shop/new-arrivals' },
      { label: 'Casual Wear', to: '/shop/casual-wear' },
      { label: 'Accessories', to: '/shop/accessories' },
    ],
  },
  bespoke: {
    label: 'Bespoke',
    links: [
      { label: 'Tailoring', to: '/bespoke/tailoring' },
      { label: 'Groomswear', to: '/bespoke/groomswear' },
      { label: 'Make an Appointment', to: '/appointments' },
    ],
  },
  house: {
    label: 'The House',
    links: [
      { label: 'Our Story', to: '/our-story' },
      { label: 'Updates', to: '/updates' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
}


export default function Header() {
  const [activeMenu, setActiveMenu] = useState(null)
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
      setActiveMenu(null)
    }, 140)
  }

  const closeMobileMenu = () => {
    setMobileOpen(false)
    setMobileShopOpen(null)
  }


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveMenu(null)
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

        >
         <MyLogo className="w-50" />
        </Link>



        <nav className="header-nav" aria-label="Main navigation">
          {['shop', 'bespoke'].map((key) => {
            const section = megaMenuSections[key]
            const isOpen = activeMenu === key

            return (
              <button
                key={key}
                type="button"
                className={`shop-trigger ${isOpen ? 'is-open' : ''}`}
                aria-expanded={isOpen}
                aria-controls="header-mega-menu"
                onMouseEnter={() => {
                  cancelClose()
                  setActiveMenu(key)
                }}
                onFocus={() => {
                  cancelClose()
                  setActiveMenu(key)
                }}
                onClick={() => {
                  setActiveMenu((current) =>
                    current === key ? null : key
                  )
                }}
              >
                {section.label}
                <ChevronDown size={14} strokeWidth={1.5} />
              </button>
            )
          })}

          <Link
            to="/collections"
            onMouseEnter={() => {
              cancelClose()
              setActiveMenu(null)
            }}
            onFocus={() => setActiveMenu(null)}
          >
            Collections
          </Link>

          <button
            type="button"
            className={`shop-trigger ${
              activeMenu === 'house' ? 'is-open' : ''
            }`}
            aria-expanded={activeMenu === 'house'}
            aria-controls="header-mega-menu"
            onMouseEnter={() => {
              cancelClose()
              setActiveMenu('house')
            }}
            onFocus={() => {
              cancelClose()
              setActiveMenu('house')
            }}
            onClick={() => {
              setActiveMenu((current) =>
                current === 'house' ? null : 'house'
              )
            }}
          >
            The House
            <ChevronDown size={14} strokeWidth={1.5} />
          </button>
        </nav>



        <div className="header-actions">
          <button
            type="button"
            aria-label="Search products"
            className="header-icon"
            onClick={() => {
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
          id="header-mega-menu"
          className={`mega-menu ${activeMenu ? 'is-open' : ''}`}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          aria-hidden={!activeMenu}
          inert={!activeMenu}
        >
          {activeMenu && (
            <div className="mega-menu-content">
              <div className="mega-categories">
                <p className="mega-menu-heading">
                  {megaMenuSections[activeMenu].label}
                </p>

                {megaMenuSections[activeMenu].links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setActiveMenu(null)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mega-featured">
                <Link
                  to="/collections/new-arrivals"
                  className="mega-image-card"
                  onClick={() => setActiveMenu(null)}
                >
                  <img src={media.collections[0]} alt="New arrivals" />
                  <span>New Arrivals</span>
                </Link>

                <Link
                  to="/collections/casual-wear"
                  className="mega-image-card"
                  onClick={() => setActiveMenu(null)}
                >
                  <img src={media.collections[1]} alt="Casual wear" />
                  <span>Casual Wear</span>
                </Link>
              </div>
            </div>
          )}
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
          {['shop', 'bespoke'].map((key) => {
            const section = megaMenuSections[key]
            const isOpen = mobileShopOpen === key

            return (
              <div className="mobile-shop-group" key={key}>
                <button
                  type="button"
                  className="mobile-nav-link mobile-shop-trigger"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setMobileShopOpen(isOpen ? null : key)
                  }
                >
                  {section.label}
                  <ChevronRight
                    size={16}
                    className={isOpen ? 'rotate-chevron' : ''}
                  />
                </button>

                <div
                  className={`mobile-category-list ${
                    isOpen ? 'is-open' : ''
                  }`}
                >
                  {section.links.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={closeMobileMenu}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}

          <Link
            to="/collections"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Collections
          </Link>

          <div className="mobile-shop-group">
            <button
              type="button"
              className="mobile-nav-link mobile-shop-trigger"
              aria-expanded={mobileShopOpen === 'house'}
              onClick={() =>
                setMobileShopOpen(
                  mobileShopOpen === 'house' ? null : 'house'
                )
              }
            >
              The House
              <ChevronRight
                size={16}
                className={
                  mobileShopOpen === 'house' ? 'rotate-chevron' : ''
                }
              />
            </button>

            <div
              className={`mobile-category-list ${
                mobileShopOpen === 'house' ? 'is-open' : ''
              }`}
            >
              {megaMenuSections.house.links.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>


        <div className="mobile-drawer-footer">
          <button type="button">
            <Languages size={16} />
            English
          </button>
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
