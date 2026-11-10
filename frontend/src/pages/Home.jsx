
import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import products from '../data/products'
import ProductCard from '../components/products/ProductCard'
import SEO from '../components/SEO'

const editorialImages = [
  'https://res.cloudinary.com/eynk4fvb/image/upload/v1794347117/grey_stripe_1.JPG.jpg',
  'https://res.cloudinary.com/eynk4fvb/image/upload/v1794347120/lime_green_3.jpg',
  'https://res.cloudinary.com/eynk4fvb/image/upload/v1794347108/black_1.jpg',
  'https://res.cloudinary.com/eynk4fvb/image/upload/v1794347112/green_4.jpg',
  "https://res.cloudinary.com/eynk4fvb/image/upload/v1794347104/9074EB23-FFEB-4298-AA7F-75EA2A9A2460.JPG.jpg",
  "https://res.cloudinary.com/eynk4fvb/image/upload/v1794347120/lime_green_3.jpg",
  "https://res.cloudinary.com/eynk4fvb/image/upload/v1794347122/white_1_2.jpg",
  "https://res.cloudinary.com/eynk4fvb/image/upload/v1794347126/blue_1_2.jpg",
  "https://res.cloudinary.com/eynk4fvb/image/upload/v1794347128/red_1.jpg",
  "https://res.cloudinary.com/eynk4fvb/image/upload/v1794347129/IMG_7770.JPG.jpg"


]


const singleEditorialImage =
  'https://res.cloudinary.com/eynk4fvb/image/upload/v1794349290/gold-2caption.png'

const doubleEditorialImages = [
  'https://res.cloudinary.com/eynk4fvb/image/upload/v1794347113/IMG_0904.JPG.jpg',
  'https://res.cloudinary.com/eynk4fvb/image/upload/v1794347112/IMG_0906.JPG.jpg',
]


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
      <div
        className={railTrackClass}
        ref={railRef}
      >
        {images.map((image, index) => (
          <div
            key={`${label}-${index}`}
            className="block aspect-[0.72/1] min-w-0 flex-[0_0_calc(25%-3px)] snap-start overflow-hidden bg-[#eee] max-md:flex-[0_0_38%] max-[420px]:flex-[0_0_43%]"
          >
            <img
              src={image}
              alt={`${label} image ${index + 1}`}
              loading="lazy"
              draggable="false"
              className="block h-full w-full select-none object-cover transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none"
            />
          </div>
        ))}
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


  return (
    <>
      <SEO
        title="Contemporary Fashion & Bespoke Tailoring"
        description="Discover contemporary wardrobe essentials, considered collections and bespoke tailoring from JOSH AMOR."
      />

      <main className="m-0 w-full overflow-hidden bg-white text-[#171717] [&_a]:text-inherit [&_a]:no-underline">
        {/* 1. Portrait campaign video */}
        <section className="mb-3 flex justify-center p-0">
          <div
            className="block aspect-[1.34/1] w-[76%] max-w-[1440px] overflow-hidden bg-[#e8e8e8] max-md:aspect-[0.82/1] max-md:w-full max-md:max-w-none"
            aria-label="Discover the latest collection"
          >
            <AutoplayVideo
              src="https://res.cloudinary.com/eynk4fvb/video/upload/v1794347074/IMG_4665.mp4"
              className="block h-full w-full object-cover object-[center_35%]"
            />
          </div>
        </section>

        {/* 2. Two editorial feature images */}
        {/* <section className="grid grid-cols-2 mb-3 gap-0">
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
        </section>*/}

        {/* 3. Editorial image carousel */}
        <ImageRail
          images={editorialImages}
          label="Featured campaign imagery"
        />

        {/* 4. Campaign video and still image */}
        <section className="grid grid-cols-2 gap-0 mb-3 min-[1500px]:mx-auto min-[1500px]:max-w-[1920px]">
          <div
            className="block aspect-[0.88/1] min-w-0 overflow-hidden bg-[#eee] max-md:aspect-[0.72/1]"
            aria-label="Explore the campaign library"
          >
            <AutoplayVideo
              src="https://res.cloudinary.com/eynk4fvb/video/upload/v1794347117/Look_5_Dance_Video.mov"
              className="block  w-full object-cover object-center"
            />
          </div>

          <Link
            to="/lookbook"
            className="block aspect-[0.88/1] min-w-0 overflow-hidden bg-[#eee] max-md:aspect-[0.72/1]"
            aria-label="Explore the lookbook"
          >
            <img
              src="https://res.cloudinary.com/eynk4fvb/image/upload/v1794347129/IMG_8174_3.JPG.jpg"
              alt=""
              loading="lazy"
              className="block h-full w-full object-cover"
            />
          </Link>
        </section>

        {/* 5. Single editorial image */}
        <section className="mb-3 w-full min-[1500px]:mx-auto min-[1500px]:max-w-[1920px]">
          <div className="aspect-[1.2/1] w-full overflow-hidden bg-[#eee] max-md:aspect-[0.85/1]">
            <img
              src={singleEditorialImage}
              alt="JOSH AMOR editorial campaign"
              loading="lazy"
              className="block  w-full object-cover"
            />
          </div>
        </section>

        {/* 6. Two-column editorial images */}
        <section className="mb-3 grid w-full grid-cols-2 gap-1 min-[1500px]:mx-auto min-[1500px]:max-w-[1920px] max-[480px]:gap-[3px]">
          {doubleEditorialImages.map((image, index) => (
            <div
              key={image}
              className="aspect-[0.82/1] min-w-0 overflow-hidden bg-[#eee] max-md:aspect-[0.68/1]"
            >
              <img
                src={image}
                alt={`JOSH AMOR editorial campaign ${index + 1}`}
                loading="lazy"
                className="block h-full w-full object-cover"
              />
            </div>
          ))}
        </section>
      </main>
    </>
  )
}
