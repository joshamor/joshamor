export default function SEOSettingsSection({ form, updateSeo }) {
  return (
    <section className="space-y-5 border-t border-neutral-200 pt-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
          Search visibility
        </p>

        <h2 className="mt-2 text-xl font-medium">
          SEO Settings
        </h2>
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-wider">
          SEO Title
        </label>

        <input
          value={form.seo.title}
          onChange={e => updateSeo('title', e.target.value)}
          placeholder="Product name | JOSH AMOR"
          maxLength={70}
          className="w-full border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
        />

        <p className="mt-1 text-xs text-neutral-500">
          {form.seo.title.length}/70 characters
        </p>
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-wider">
          Meta Description
        </label>

        <textarea
          rows={3}
          value={form.seo.description}
          onChange={e => updateSeo('description', e.target.value)}
          placeholder="Write a short description for search engines..."
          maxLength={160}
          className="w-full border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
        />

        <p className="mt-1 text-xs text-neutral-500">
          {form.seo.description.length}/160 characters
        </p>
      </div>
    </section>
  )
}
