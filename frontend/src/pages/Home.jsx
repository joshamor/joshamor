
import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import products from '../data/products'
import ProductCard from '../components/products/ProductCard'
import SEO from '../components/SEO'

const editorialImages = [
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
]

const editorialClosingImages = [
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
]

const campaignStill =
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85'

const railArrowClass =
  'absolute top-1/2 z-10 flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-full border-0 bg-white/90 text-[#111] transition-colors duration-200 hover:bg-white motion-reduce:transition-none max-md:h-[26px] max-md:w-[26px]'

const railTrackClass =
  'flex snap-x snap-mandatory gap-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden motion-reduce:scroll-auto max-md:gap-[3px]'

function ImageRail({ images, label }) {
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
      className="relative w-full mb-3 min-[1500px]:mx-auto min-[1500px]:max-w-[1920px]"
      aria-label={label}
    >
      <div className={railTrackClass} ref={railRef}>
        {images.map((image, index) => {
          const product = products[index % Math.max(products.length, 1)]

          return (
            <Link
              key={`${label}-${index}`}
              to={product ? `/products/${product.slug}` : '/shop'}
              className="block aspect-[0.72/1] min-w-0 flex-[0_0_calc(25%-3px)] snap-start overflow-hidden bg-[#eee] max-md:flex-[0_0_38%] max-[420px]:flex-[0_0_43%]"
              aria-label={`Explore ${product?.name || 'the collection'}`}
            >
              <img
                src={image}
                alt=""
                loading="lazy"
                className="block h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] hover:scale-[1.025] motion-reduce:transition-none"
              />
            </Link>
          )
        })}
      </div>

      <button
        className={`${railArrowClass} left-[10px] max-md:left-[6px]`}
        type="button"
        aria-label="Previous images"
        onClick={() => move(-1)}
      >
        <ChevronLeft size={17} strokeWidth={1.4} />
      </button>

      <button
        className={`${railArrowClass} right-[10px] max-md:right-[6px]`}
        type="button"
        aria-label="Next images"
        onClick={() => move(1)}
      >
        <ChevronRight size={17} strokeWidth={1.4} />
      </button>
    </section>
  )
}


function ProductRail({ items, title }) {
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

  if (!items.length) return null

  return (
    <section className="m-0 w-full min-[1500px]:mx-auto min-[1500px]:max-w-[1920px]">
      {/* Section heading */}
      <div className="flex items-center justify-between px-[10px] py-3 max-md:px-2">
        <h2 className="m-0 font-['Boogy_Brut_WEBL',Georgia,serif] text-base font-normal uppercase">
          {title}
        </h2>

        <Link
          to="/shop/jackets-and-coats"
          className="border-b border-current pb-[3px] text-[10px] uppercase text-inherit no-underline"
        >
          View all
        </Link>
      </div>

      {/* Product carousel */}
      <div className="relative">
        <div
          ref={railRef}
          className="flex snap-x snap-mandatory gap-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden max-md:gap-[3px]"
        >
          {items.map((product) => (
            <div
              key={product.id}
              className="min-w-0 flex-[0_0_calc(25%_-_3px)] snap-start max-md:flex-[0_0_38%] max-[420px]:flex-[0_0_43%]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Previous products */}
        <button
          className="absolute left-[10px] top-1/2 z-10 flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-full border-0 bg-white/90 text-[#111] transition-colors hover:bg-white motion-reduce:transition-none max-md:left-[6px] max-md:h-[26px] max-md:w-[26px]"
          type="button"
          aria-label="Previous products"
          onClick={() => move(-1)}
        >
          <ChevronLeft size={17} strokeWidth={1.4} />
        </button>

        {/* Next products */}
        <button
          className="absolute right-[10px] top-1/2 z-10 flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-full border-0 bg-white/90 text-[#111] transition-colors hover:bg-white motion-reduce:transition-none max-md:right-[6px] max-md:h-[26px] max-md:w-[26px]"
          type="button"
          aria-label="Next products"
          onClick={() => move(1)}
        >
          <ChevronRight size={17} strokeWidth={1.4} />
        </button>
      </div>
    </section>
  )
}


function AutoplayVideo({ src, poster, className }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    // Explicitly configure the video for mobile autoplay
    video.muted = true
    video.defaultMuted = true
    video.playsInline = true

    const attemptPlay = async () => {
      try {
        await video.play()
      } catch (error) {
        console.warn('Video autoplay was blocked:', error)
      }
    }

    // Attempt playback once the video is ready
    if (video.readyState >= 2) {
      attemptPlay()
    } else {
      video.addEventListener('canplay', attemptPlay, { once: true })
    }

    return () => {
      video.removeEventListener('canplay', attemptPlay)
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      defaultMuted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}

export default function Home() {
  const featuredProducts = products.slice(0, 2)

  const jacketProducts = products.filter((product) =>
    product.category?.toLowerCase().includes('jacket')
  )

  return (
    <>
      <SEO
        title="Contemporary Fashion & Bespoke Tailoring"
        description="Discover contemporary wardrobe essentials, considered collections and bespoke tailoring from JOSH AMOR."
      />

      <main className="m-0 w-full overflow-hidden bg-white text-[#171717] [&_a]:text-inherit [&_a]:no-underline">
        {/* 1. Portrait campaign video */}
        <section className="mb-3 flex justify-center p-0">
          <Link
            to={
              featuredProducts[0]
                ? `/products/${featuredProducts[0].slug}`
                : '/shop'
            }
            className="block aspect-[1.34/1] w-[76%] max-w-[1440px] overflow-hidden bg-[#e8e8e8] max-md:aspect-[0.82/1] max-md:w-full max-md:max-w-none"
            aria-label="Discover the latest collection"
          >
            <AutoplayVideo
              src="/videos/home-hero.mp4"
              className="block h-full w-full object-cover object-[center_35%]"
            />
          </Link>
        </section>

        {/* 2. Two editorial feature images */}
        <section className="grid grid-cols-2 mb-3 gap-0">
          {featuredProducts.map((product, index) => {
            const image = product.colors?.[0]?.images?.[0]

            return (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="group relative block aspect-[0.96/1] overflow-hidden bg-[#eee] max-md:aspect-[0.72/1]"
              >
                {image && (
                  <img
                    src={image}
                    alt={product.name}
                    loading="lazy"
                    className="block h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.025] motion-reduce:transition-none"
                  />
                )}

                {index === 1 && (
                  <span className="absolute inset-0 flex items-center justify-center font-['Boogy_Brut_WEBL',Georgia,serif] text-[clamp(32px,5vw,78px)] tracking-[0.035em] text-white [text-shadow:0_1px_12px_rgb(0_0_0_/_10%)] max-md:text-[clamp(25px,7vw,48px)]">
                    JOSH AMOR
                  </span>
                )}
              </Link>
            )
          })}
        </section>

        {/* 3. Editorial image carousel */}
        <ImageRail
          images={editorialImages}
          label="Featured campaign imagery"
        />

        {/* 4. Campaign video and still image */}
        <section className="grid grid-cols-2 gap-0 mb-3 min-[1500px]:mx-auto min-[1500px]:max-w-[1920px]">          <Link
            to="/campaigns"
            className="block aspect-[0.88/1] min-w-0 overflow-hidden bg-[#eee] max-md:aspect-[0.72/1]"
            aria-label="Explore the campaign library"
          >
            <AutoplayVideo
              src="/videos/campaign-placeholder.mp4"
              className="block h-full w-full object-cover object-center"
            />
          </Link>

          <Link
            to="/lookbook"
            className="block aspect-[0.88/1] min-w-0 overflow-hidden bg-[#eee] max-md:aspect-[0.72/1]"
            aria-label="Explore the lookbook"
          >
            <img
              src={campaignStill}
              alt=""
              loading="lazy"
              className="block h-full w-full object-cover"
            />
          </Link>
        </section>

        {/* 5. Product carousel */}
        <ProductRail items={jacketProducts} title="Jackets & Coats" />

        {/* 6. Final editorial image carousel */}
        <ImageRail
          images={editorialClosingImages}
          label="More campaign imagery"
        />
      </main>
    </>
  )
}
