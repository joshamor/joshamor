const inputClass =
  'w-full border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black'

const labelClass =
  'mb-2 block text-xs uppercase tracking-wider'

export default function ProductContentSection({
  form,
  updateField,
  addFeature,
  updateFeature,
  removeFeature,
  addDetail,
  updateDetail,
  removeDetail,
  updateDelivery,
  addDeliveryParagraph,
  updateDeliveryParagraph,
  removeDeliveryParagraph,
}) {
  return (
    <section className="space-y-8 border-t border-neutral-200 pt-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
          Product information
        </p>

        <h2 className="mt-2 text-xl font-medium">
          Product Content
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          Add the details customers will see on the product page.
        </p>
      </div>

      {/* FEATURES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Product Features</h3>

          <button
            type="button"
            onClick={addFeature}
            className="text-xs uppercase tracking-wider underline"
          >
            Add feature +
          </button>
        </div>

        {form.features.map((feature, index) => (
          <div key={index} className="flex gap-3">
            <input
              value={feature}
              onChange={event => updateFeature(index, event.target.value)}
              placeholder="e.g. Relaxed tailored silhouette"
              className={`min-w-0 flex-1 ${inputClass}`}
            />

            <button
              type="button"
              onClick={() => removeFeature(index)}
              className="text-xs text-neutral-500 hover:text-black"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* MATERIAL AND ORIGIN */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className={labelClass}>Material</label>

          <input
            value={form.material}
            onChange={event => updateField('material', event.target.value)}
            placeholder="e.g. 100% Premium Cotton"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Made In</label>

          <input
            value={form.madeIn}
            onChange={event => updateField('madeIn', event.target.value)}
            placeholder="e.g. Nigeria"
            className={inputClass}
          />
        </div>
      </div>

      {/* CARE */}
      <div>
        <label className={labelClass}>Care Instructions</label>

        <textarea
          rows={4}
          value={form.care}
          onChange={event => updateField('care', event.target.value)}
          placeholder="Enter care instructions..."
          className={inputClass}
        />
      </div>

      {/* ADDITIONAL DETAILS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Additional Details</h3>

            <p className="mt-1 text-xs text-neutral-500">
              Add specifications such as fit, model, or construction.
            </p>
          </div>

          <button
            type="button"
            onClick={addDetail}
            className="text-xs uppercase tracking-wider underline"
          >
            Add detail +
          </button>
        </div>

        {form.details.map((detail, index) => (
          <div
            key={index}
            className="grid gap-3 md:grid-cols-[1fr_2fr_auto]"
          >
            <input
              value={detail.label}
              onChange={event =>
                updateDetail(index, 'label', event.target.value)
              }
              placeholder="Label"
              className={inputClass}
            />

            <input
              value={detail.value}
              onChange={event =>
                updateDetail(index, 'value', event.target.value)
              }
              placeholder="Value"
              className={inputClass}
            />

            <button
              type="button"
              onClick={() => removeDetail(index)}
              className="text-left text-xs text-neutral-500 hover:text-black"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* DELIVERY */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Delivery Information</h3>

          <p className="mt-1 text-xs text-neutral-500">
            Add delivery information displayed on the product page.
          </p>
        </div>

        <div>
          <label className={labelClass}>Heading</label>

          <input
            value={form.delivery.heading}
            onChange={event =>
              updateDelivery('heading', event.target.value)
            }
            placeholder="e.g. Delivery & Returns"
            className={inputClass}
          />
        </div>

        <div className="space-y-3">
          {form.delivery.paragraphs.map((paragraph, index) => (
            <div key={index} className="flex gap-3">
              <textarea
                rows={3}
                value={paragraph}
                onChange={event =>
                  updateDeliveryParagraph(index, event.target.value)
                }
                placeholder="Enter delivery information..."
                className={`min-w-0 flex-1 ${inputClass}`}
              />

              <button
                type="button"
                onClick={() => removeDeliveryParagraph(index)}
                className="text-xs text-neutral-500 hover:text-black"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addDeliveryParagraph}
          className="text-xs uppercase tracking-wider underline"
        >
          Add paragraph +
        </button>
      </div>
    </section>
  )
}
