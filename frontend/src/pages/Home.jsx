
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getProducts } from '../services/api'
import ProductCard from '../components/products/ProductCard'
import SEO from '../components/SEO'

// --------------------------------------------------
// EDITORIAL CONTENT
// --------------------------------------------------

const heroImages = [
  {
    src: 'https://ecdn.speedsize.com/ae1dbfff-6186-4bf9-a84a-f4da84ea401b/https://a.storyblok.com/f/267343/5504x7339/44822f379b/arl_0970.jpg?speedsize=mxw_1080',
    alt: 'JOSH AMOR campaign look',
    title: '',
  },
  {
    src: 'https://ecdn.speedsize.com/ae1dbfff-6186-4bf9-a84a-f4da84ea401b/https://a.storyblok.com/f/267343/1620x2025/4accefff1a/33.jpg?speedsize=mxw_384',
    alt: 'JOSH AMOR editorial campaign',
    title: '',
  },
]

const firstCarouselImages = [
  {
    src: 'https://ecdn.speedsize.com/ae1dbfff-6186-4bf9-a84a-f4da84ea401b/https://arakii.centracdn.net/client/dynamic/images/454_077b992726-ecom-fw-de2-pre-spring-26-20746-best.jpg?speedsize=mxw_1080',
    alt: 'Black tailored look',
    to: '/lookbook',
  },
  {
    src: 'https://ecdn.speedsize.com/ae1dbfff-6186-4bf9-a84a-f4da84ea401b/https://arakii.centracdn.net/client/dynamic/images/473_c60185089e-ecom-fw-de2-pre-spring-26-20837-best.jpg?speedsize=mxw_1080',
    alt: 'Green editorial look',
    to: '/lookbook',
  },
  {
    src: 'https://ecdn.speedsize.com/ae1dbfff-6186-4bf9-a84a-f4da84ea401b/https://arakii.centracdn.net/client/dynamic/images/480_6748220480-ecom-fw26-1-17367-best.jpg?speedsize=mxw_1080',
    alt: 'JOSH AMOR collection',
    to: '/shop',
  },
  {
    src: 'https://ecdn.speedsize.com/ae1dbfff-6186-4bf9-a84a-f4da84ea401b/https://arakii.centracdn.net/client/dynamic/images/453_58b384ea56-ecom-fw26-1-17419-best.jpg?speedsize=mxw_1080',
    alt: 'White collection look',
    to: '/shop',
  },
]

const closingCarouselImages = [
  {
    src: 'https://ecdn.speedsize.com/ae1dbfff-6186-4bf9-a84a-f4da84ea401b/https://arakii.centracdn.net/client/dynamic/images/477_2497d3a9c2-ecom-fw26-1-17472-best.jpg?speedsize=mxw_1080',
    alt: 'Blue collection look',
    to: '/shop',
  },
  {
    src: 'https://ecdn.speedsize.com/ae1dbfff-6186-4bf9-a84a-f4da84ea401b/https://arakii.centracdn.net/client/dynamic/images/458_6603cc6f7e-fw26-lookbook-15448-best.jpg?speedsize=mxw_1080',
    alt: 'Red collection look',
    to: '/shop',
  },
  {
    src: 'https://ecdn.speedsize.com/ae1dbfff-6186-4bf9-a84a-f4da84ea401b/https://arakii.centracdn.net/client/dynamic/images/458_33e2bd9569-ecom-fw26-1-17893-best.jpg?speedsize=mxw_1080',
    alt: 'JOSH AMOR campaign',
    to: '/lookbook',
  },
]

const editorialStill =
  'https://ecdn.speedsize.com/ae1dbfff-6186-4bf9-a84a-f4da84ea401b/https://a.storyblok.com/f/267343/3596x4795/fe64f20ef4/sculpture.jpg?speedsize=mxw_1080'

const videoOne =
  'https://res.cloudinary.com/eynk4fvb/video/upload/v1794347074/IMG_4665.mp4'

const videoTwo =
  'https://res.cloudinary.com/eynk4fvb/video/upload/v1794347117/Look_5_Dance_Video.mov'

// --------------------------------------------------
// SHARED CAROUSEL ARROWS
// --------------------------------------------------

function CarouselArrows({ onPrevious, onNext, label }) {
  return (
    <>
      <button
        type="button"
        onClick={onPrevious}
        aria-label={`Previous ${label}`}
        className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-white/90 text-black shadow-sm transition-colors hover:bg-white motion-reduce:transition-none max-md:h-7 max-md:w-7"
      >
        <ChevronLeft size={17} strokeWidth={1.4} />
      </button>

      <button
        type="button"
        onClick={onNext}
        aria-label={`Next ${label}`}
        className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-white/90 text-black shadow-sm transition-colors hover:bg-white motion-reduce:transition-none max-md:h-7 max-md:w-7"
      >
        <ChevronRight size={17} strokeWidth={1.4} />
      </button>
    </>
  )
}

// --------------------------------------------------
// LINKED IMAGE CAROUSEL
// --------------------------------------------------

function ImageCarousel({ images, label }) {
  const railRef = useRef(null)

  function move(direction) {
    const rail = railRef.current
    if (!rail) return

    rail.scrollBy({
      left: direction * rail.clientWidth * 0.75,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }

  return (
    <section
      className="relative mb-3 w-full overflow-hidden 2xl:mb-5"
      aria-label={label}
    >
      <div
        ref={railRef}
        className="flex gap-[3px] overflow-x-auto overscroll-x-contain snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((item, index) => (
          <Link
            key={`${label}-${index}`}
            to={item.to}
            className="
              relative block aspect-[0.72/1] min-w-0
              flex-[0_0_82%] snap-start overflow-hidden bg-[#eee]
              sm:flex-[0_0_55%]
              md:flex-[0_0_31%]
              lg:flex-[0_0_26%]
              xl:flex-[0_0_25%]
              2xl:flex-[0_0_24.5%]
            "
          >
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              draggable="false"
              className="h-full w-full select-none object-cover"
            />
          </Link>
        ))}
      </div>

      <CarouselArrows
        label={label}
        onPrevious={() => move(-1)}
        onNext={() => move(1)}
      />
    </section>
  )
}

// --------------------------------------------------
// AUTOPLAY CAMPAIGN VIDEO
// --------------------------------------------------

function CampaignVideo({
  src,
  poster,
  sectionClassName = '',
  mediaClassName = '',
}) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true

    const playVideo = async () => {
      try {
        await video.play()
      } catch {
        // Poster remains visible if autoplay is blocked.
      }
    }

    if (video.readyState >= 2) {
      playVideo()
    } else {
      video.addEventListener('canplay', playVideo, { once: true })
    }

    return () => {
      video.removeEventListener('canplay', playVideo)
      video.pause()
    }
  }, [src])

  return (
    <section
      className={`mb-3 w-full overflow-hidden bg-[#eee] ${sectionClassName}`}
    >
      <div
        className={`relative aspect-[0.85/1] w-full ${mediaClassName}`}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          defaultMuted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={src} />
        </video>
      </div>
    </section>
  )
}


// --------------------------------------------------
// PRODUCT CAROUSEL
// Fetches products from your existing backend.
// --------------------------------------------------

function ProductCarousel() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const railRef = useRef(null)

  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        setLoading(true)
        setError(false)

        const result = await getProducts()

        if (active) {
          setProducts(result.data || [])
        }
      } catch (err) {
        console.error('Unable to load homepage products:', err)

        if (active) {
          setError(true)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      active = false
    }
  }, [])

  function move(direction) {
    const rail = railRef.current

    if (!rail) return

    rail.scrollBy({
      left: direction * rail.clientWidth * 0.75,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }

  return (
    <section className="relative mb-8 w-full overflow-hidden">
      {/* Product section heading */}


      {/* Loading */}
      {loading && (
        <div className="px-3 py-12 text-center text-xs uppercase tracking-wider">
          Loading collection...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-3 py-12 text-center text-xs">
          Unable to load products. Please try again later.
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="px-3 py-12 text-center text-xs">
          No products available at the moment.
        </div>
      )}

      {/* Products */}
      {!loading && !error && products.length > 0 && (
        <div className="relative">
          <div
            ref={railRef}
            className="flex gap-[3px] overflow-x-auto overscroll-x-contain snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => (
              <div
                key={product._id || product.id}
                className="
                  min-w-0 flex-[0_0_48%] snap-start
                  sm:flex-[0_0_32%]
                  md:flex-[0_0_32%]
                  lg:flex-[0_0_26%]
                  xl:flex-[0_0_25%]
                  2xl:flex-[0_0_24.5%]
                "
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <CarouselArrows
            label="products"
            onPrevious={() => move(-1)}
            onNext={() => move(1)}
          />
        </div>
      )}
    </section>
  )
}

// --------------------------------------------------
// HOMEPAGE
// --------------------------------------------------

export default function Home() {
  return (
    <>
      <SEO
        title="Contemporary Fashion & Bespoke Tailoring"
        description="Discover contemporary wardrobe essentials, considered collections and bespoke tailoring from JOSH AMOR."
      />

      <main className="
        m-0 w-full overflow-hidden bg-white text-[#171717]
        [&_a]:text-inherit [&_a]:no-underline
        2xl:mx-auto
      ">
        {/* ------------------------------------------
            1. HERO IMAGES
            Mobile: stacked
            Tablet/Desktop: two columns
        ------------------------------------------ */}

        <section className="mb-3 grid w-full grid-cols-1 gap-[3px] md:grid-cols-2">
          {heroImages.map((image, index) => (
            <div
              key={image.src}
              className="
                relative aspect-[0.72/1] w-full overflow-hidden bg-[#eee]
                md:aspect-[0.82/1]
                lg:aspect-[0.82/1]
                2xl:aspect-[0.8/1]
              "
            >
              <img
                src={image.src}
                alt={image.alt}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="h-full w-full object-cover"
              />

              {image.title && (
                <h1 className="absolute inset-0 flex items-center justify-center font-['Boogy_Brut_WEBL',Georgia,serif] text-[clamp(32px,5vw,76px)] tracking-wide text-white">
                  {image.title}
                </h1>
              )}
            </div>
          ))}
        </section>

        {/* ------------------------------------------
            2. FIRST EDITORIAL CAROUSEL
        ------------------------------------------ */}

        <ImageCarousel
          images={firstCarouselImages}
          label="Featured editorial collection"
        />

        {/* ------------------------------------------
            3. FIRST CAMPAIGN VIDEO
            Mobile: full width
            Tablet/Desktop: centered and narrower
        ------------------------------------------ */}

        <CampaignVideo
          src={videoOne}
          sectionClassName="
            md:mx-auto md:w-[75%]
            md:max-w-[1200px]
            xl:w-[72%]
            2xl:w-[75%]
            2xl:max-w-[1500px]
          "
          mediaClassName="md:aspect-[4/3]"
        />

        {/* ------------------------------------------
            4. SECOND VIDEO + EDITORIAL IMAGE
            Mobile: stacked
            Tablet/Desktop: two columns
        ------------------------------------------ */}

        <section className="
          mb-3 grid w-full grid-cols-1 gap-[3px]
          md:grid-cols-2
          2xl:mx-auto 2xl:max-w-[2400px]
        ">

          {/* Second video */}
          <CampaignVideo
            src={videoTwo}
            sectionClassName="mb-0"
            mediaClassName="md:aspect-[0.82/1]"
          />

          {/* Editorial still */}
          <div className="w-full overflow-hidden bg-[#eee]">
            <div className="aspect-[0.85/1] w-full md:aspect-[0.82/1]">
              <img
                src={editorialStill}
                alt="JOSH AMOR editorial campaign"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

        </section>

        {/* ------------------------------------------
            5. BACKEND PRODUCTS CAROUSEL
        ------------------------------------------ */}

        <ProductCarousel />

        {/* ------------------------------------------
            6. FINAL EDITORIAL CAROUSEL
        ------------------------------------------ */}

        <ImageCarousel
          images={closingCarouselImages}
          label="More from JOSH AMOR"
        />

      </main>
    </>
  )
}
