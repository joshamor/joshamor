const inputClass =
  'w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900'

const labelClass =
  'mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-600'

export default function PricingCategorySection({
  form,
  categories,
  updateField,
}) {
  return (
    <section className="border-t border-neutral-200 pt-9">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">
          02
        </p>

        <h2 className="mt-1 text-lg font-medium text-neutral-950">
          Pricing and category
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className={labelClass}>Price</label>

          <input
            type="number"
            min="0"
            step="1"
            className={inputClass}
            value={form.price}
            onChange={event => updateField('price', event.target.value)}
            placeholder="e.g. 745000"
          />

          <p className="mt-2 text-xs text-neutral-400">
            Enter the amount in Nigerian Naira.
          </p>
        </div>

        <div>
          <label className={labelClass}>Currency</label>

          <select
            className={inputClass}
            value={form.currency}
            onChange={event => updateField('currency', event.target.value)}
          >
            <option value="NGN">NGN — Nigerian Naira</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Category</label>

          <select
            className={inputClass}
            value={form.category}
            onChange={event => updateField('category', event.target.value)}
          >
            <option value="">Select a category</option>

            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center pt-5">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={event =>
                updateField('featured', event.target.checked)
              }
              className="h-4 w-4 accent-neutral-950"
            />

            Feature this product
          </label>
        </div>
      </div>
    </section>
  )
}
