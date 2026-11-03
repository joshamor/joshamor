const inputClass =
  'w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900'

const labelClass =
  'mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-600'

export default function BasicInformationSection({
  form,
  updateField,
  handleSlugChange,
}) {
  return (
    <section>
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">
          01
        </p>

        <h2 className="mt-1 text-lg font-medium text-neutral-950">
          Basic information
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Give your product a name and describe what makes it distinctive.
        </p>
      </div>

      <div className="grid gap-6">
        <div>
          <label className={labelClass}>Product name *</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={event => updateField('name', event.target.value)}
            placeholder="e.g. Wool Peplum Jacket"
          />
        </div>

        <div>
          <label className={labelClass}>Product slug</label>
          <input
            className={inputClass}
            value={form.slug}
            onChange={event => handleSlugChange(event.target.value)}
            placeholder="wool-peplum-jacket"
          />

          <p className="mt-2 text-xs text-neutral-400">
            Used in the product URL. You can edit this manually.
          </p>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            className={`${inputClass} min-h-32 resize-y`}
            value={form.description}
            onChange={event =>
              updateField('description', event.target.value)
            }
            placeholder="Describe the product..."
            rows={5}
          />
        </div>
      </div>
    </section>
  )
}
