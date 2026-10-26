
import { Link } from 'react-router-dom'
import './campaignLibrary.css'

const campaignVideos = {
  hero: 'https://videos.pexels.com/video-files/3130284/3130284-hd_1920_1080_30fps.mp4',
  interior: 'https://videos.pexels.com/video-files/3130284/3130284-hd_1920_1080_30fps.mp4',
  aerial: 'https://videos.pexels.com/video-files/854478/854478-hd_1920_1080_25fps.mp4',
  architecture: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_25fps.mp4',
  movement: 'https://videos.pexels.com/video-files/3998293/3998293-hd_1920_1080_25fps.mp4',
  landscape: 'https://videos.pexels.com/video-files/3129595/3129595-hd_1920_1080_30fps.mp4',
}

const lookbookImage =
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2400&q=85'

function CampaignVideo({ src, className = '', label }) {
  return (
    <div className={`dialogue-video ${className}`}>
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
      />
    </div>
  )
}

function EditorialCopy({ eyebrow, children }) {
  return (
    <div className="dialogue-copy">
      {eyebrow && <span className="dialogue-eyebrow">{eyebrow}</span>}
      <p>{children}</p>
    </div>
  )
}

export default function CampaignLibrary() {
  return (
    <main className="dialogue-page">
      {/* HERO FILM */}
      <CampaignVideo
        src={campaignVideos.hero}
        className="dialogue-hero"
        label="Campaign Dialogue opening film"
      />

      <EditorialCopy eyebrow="Dialogue — 01">
        Clothing is a language of its own. Through form, movement, and
        material, each collection begins a conversation between the
        individual and the world around them.
      </EditorialCopy>

      {/* FIRST EDITORIAL FILM */}
      <CampaignVideo
        src={campaignVideos.interior}
        className="dialogue-video-narrow"
        label="Fashion film in an interior setting"
      />

      <EditorialCopy eyebrow="A study in movement">
        The smallest gestures can change the way a garment is experienced.
        We explore the relationship between the body, the clothes we wear,
        and the spaces we move through.
      </EditorialCopy>

      {/* AERIAL FILM */}
      <CampaignVideo
        src={campaignVideos.aerial}
        className="dialogue-video-medium"
        label="Aerial perspective film"
      />

      <EditorialCopy eyebrow="Perspective">
        A different point of view reveals a different story. Shape, scale,
        texture, and light come together to create a visual language that
        is both considered and unexpected.
      </EditorialCopy>

      {/* ARCHITECTURAL FILM */}
      <CampaignVideo
        src={campaignVideos.architecture}
        className="dialogue-video-full"
        label="Architecture and fashion campaign film"
      />

      <EditorialCopy eyebrow="Form and space">
        We find inspiration in architecture, natural materials, and the
        contrast between structure and softness. These references inform
        the silhouettes and details of our collections.
      </EditorialCopy>

      {/* MOVEMENT FILM */}
      <CampaignVideo
        src={campaignVideos.movement}
        className="dialogue-video-full"
        label="Fashion and movement film"
      />

      <EditorialCopy eyebrow="In motion">
        Designed to be worn, lived in, and interpreted individually.
        We see clothing as something that comes to life through the
        person wearing it.
      </EditorialCopy>

      {/* LANDSCAPE FILM WITH WORDMARK */}
      <section className="dialogue-landscape">
        <CampaignVideo
          src={campaignVideos.landscape}
          className="dialogue-landscape-video"
          label="Landscape campaign film"
        />
        <span className="dialogue-wordmark">JOSH AMOR</span>
      </section>

      <EditorialCopy eyebrow="A continuing conversation">
        Every collection opens another chapter. We continue to explore
        new ideas, perspectives, and expressions through our work.
      </EditorialCopy>

      {/* FINAL STILL IMAGE LINKS TO LOOKBOOK */}
      <Link
        to="/lookbook"
        className="dialogue-lookbook"
        aria-label="Explore the lookbook"
      >
        <img
          src={lookbookImage}
          alt="Fashion editorial from the lookbook"
          loading="lazy"
        />
        <span className="dialogue-lookbook-overlay" />
        <span className="dialogue-lookbook-title">JOSH AMOR</span>
        <span className="dialogue-lookbook-cta">Explore the lookbook ↗</span>
      </Link>
    </main>
  )
}
