import {  Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Contact from './pages/Contact'
import About from './pages/About'
import EditorialPage from './pages/EditorialPage'
import { footerPages } from './pages/footerPages'
import Careers from './pages/Careers'
import Sustainability from './pages/Sustainability'
import Enquiry from './pages/Enquiry'
import Shipping from './pages/Shipping'
import CampaignLibrary from './pages/CampaignLibrary'
import Lookbook from './pages/Lookbook'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Updates from './pages/Updates'
import MakeAppointment from './pages/MakeAppointment'

import Collections from './pages/Collections'
import Bespoke from './pages/Bespoke'
import Tailoring from './pages/Tailoring'
import Groomswear from './pages/Groomswear'


import './components/layout/site-chrome.css'
import './page-transitions.css'
import { CartProvider } from './context/CartContext'
import CartDrawer from './components/cart/CartDrawer'

function NotFound() {
  return (
    <main className="editorial-page">
      <section className="editorial-intro">
        <p className="page-eyebrow">404 — Page not found</p>
        <h1>This page doesn't exist.</h1>
        <p className="editorial-lead">
          The page may have moved, or the link may be incorrect.
        </p>
        <a className="editorial-cta" href="/">
          Return home <span aria-hidden="true">↗</span>
        </a>
      </section>
    </main>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className="route-transition"
        initial={
          reduceMotion
            ? false
            : { opacity: 0, y: 8 }
        }
        animate={{ opacity: 1, y: 0 }}
        exit={
          reduceMotion
            ? { opacity: 1 }
            : { opacity: 0, y: -4 }
        }
        transition={{
          duration: reduceMotion ? 0 : 0.32,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/our-story" element={<About />} />
          <Route path="/career" element={<Careers />} />
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="/enquiry" element={<Enquiry />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/campaigns" element={<CampaignLibrary />} />
          <Route path="/lookbook" element={<Lookbook />} />
          <Route
            path="/appointment"
            element={<MakeAppointment />}
          />
          <Route path="/updates" element={<Updates />} />

          <Route path="/collections" element={<Collections />} />
          <Route path="/bespoke" element={<Bespoke />} />
          <Route path="/bespoke/tailoring" element={<Tailoring />} />
          <Route path="/bespoke/groomswear" element={<Groomswear />} />


          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:categorySlug" element={<Shop />} />
          <Route path="/products/:slug" element={<ProductDetail />} />

          {Object.keys(footerPages)
            .filter(
              (path) =>
                ![
                  '/about-us',
                  '/career',
                  '/sustainability',
                  '/shipping',
                ].includes(path)
            )
            .map((path) => (
              <Route
                key={path}
                path={path}
                element={<EditorialPage pagePath={path} />}
              />
            ))}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function StoreRoutes() {
  return (
    <>
      <Header />
      <AnimatedRoutes />
      <Footer />
       <CartDrawer />
    </>
  )
}

export default function App() {
  return (
    <CartProvider>
      <ScrollToTop />
      <StoreRoutes />
    </CartProvider>
  )
}
