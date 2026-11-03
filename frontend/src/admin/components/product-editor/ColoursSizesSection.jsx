const inputClass =
  'w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900'

const labelClass =
  'mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-600'

export default function ColoursSizesSection({
  form,
  addColor,
  updateColor,
  removeColor,
  addSize,
  removeSize,
  generateProductVariants,
  updateVariant,
}) {
  return (
    <section className="border-t border-neutral-200 pt-9">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">
          04
        </p>

        <h2 className="mt-1 text-lg font-medium text-neutral-950">
          Colours and sizes
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Configure the colours and sizes available for this product.
        </p>
      </div>

      {/* Colours */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-neutral-900">Colours</h3>
            <p className="mt-1 text-xs text-neutral-400">
              Add each colour customers can choose.
            </p>
          </div>

          <button
            type="button"
            onClick={addColor}
            className="border border-neutral-300 px-4 py-2 text-[10px] uppercase tracking-wider hover:border-neutral-900"
          >
            Add colour
          </button>
        </div>

        {form.colors.length === 0 ? (
          <div className="border border-dashed border-neutral-300 px-5 py-8 text-center text-sm text-neutral-400">
            No colours added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {form.colors.map((color, index) => (
              <div
                key={index}
                className="grid gap-4 border border-neutral-200 p-4 sm:grid-cols-[1fr_100px_auto] sm:items-end"
              >
                <div>
                  <label className={labelClass}>Colour name</label>
                  <input
                    className={inputClass}
                    value={color.name}
                    onChange={event =>
                      updateColor(index, 'name', event.target.value)
                    }
                    placeholder="e.g. Black"
                  />
                </div>

                <div>
                  <label className={labelClass}>Colour swatch</label>

                  <div className="flex h-12 items-center gap-2 border border-neutral-300 px-2">
                    <input
                      type="color"
                      value={
                        /^#[0-9A-Fa-f]{6}$/.test(color.hex || '')
                          ? color.hex
                          : '#000000'
                      }
                      onChange={event =>
                        updateColor(index, 'hex', event.target.value)
                      }
                      className="h-8 w-8 cursor-pointer border-0 bg-transparent p-0"
                    />

                    <span className="text-[10px] uppercase text-neutral-500">
                      {color.hex || '#000000'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="text-left text-[10px] uppercase tracking-wider text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sizes */}
      <div className="mb-10 border-t border-neutral-200 pt-8">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-neutral-900">
            Available sizes
          </h3>

          <p className="mt-1 text-xs text-neutral-400">
            Add the sizes customers can select.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {form.sizes.map(size => (
            <button
              key={size}
              type="button"
              onClick={() => removeSize(size)}
              title={`Remove ${size}`}
              className="flex items-center gap-2 border border-neutral-900 bg-neutral-950 px-4 py-2 text-xs text-white"
            >
              {size}
              <span className="text-neutral-400">×</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
            <button
              key={size}
              type="button"
              disabled={form.sizes.some(
                item => item.toLowerCase() === size.toLowerCase()
              )}
              onClick={() => addSize(size)}
              className="border border-neutral-200 px-4 py-2 text-[10px] text-neutral-600 transition hover:border-neutral-900 disabled:opacity-30"
            >
              + {size}
            </button>
          ))}
        </div>
      </div>

      {/* Variant generation */}
      <div className="border-t border-neutral-200 pt-8">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-neutral-900">
            Product variants
          </h3>

          <p className="mt-1 text-xs text-neutral-400">
            Generate a combination for every colour and size, then assign SKUs
            and stock.
          </p>
        </div>

        <button
          type="button"
          onClick={generateProductVariants}
          disabled={!form.colors.length || !form.sizes.length}
          className="border border-neutral-950 px-5 py-3 text-[10px] uppercase tracking-[0.12em] transition hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Generate variants
        </button>

        {form.variants.length > 0 && (
          <div className="mt-6 overflow-x-auto border border-neutral-200">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-neutral-50">
                <tr>
                  {['Colour', 'Size', 'SKU', 'Stock'].map(label => (
                    <th
                      key={label}
                      className="px-4 py-3 text-[9px] font-medium uppercase tracking-wider text-neutral-500"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {form.variants.map((variant, index) => (
                  <tr
                    key={`${variant.color}-${variant.size}`}
                    className="border-t border-neutral-100"
                  >
                    <td className="px-4 py-3 text-xs text-neutral-700">
                      {variant.color}
                    </td>

                    <td className="px-4 py-3 text-xs text-neutral-700">
                      {variant.size}
                    </td>

                    <td className="px-4 py-3">
                      <input
                        value={variant.sku}
                        onChange={event =>
                          updateVariant(
                            index,
                            'sku',
                            event.target.value.toUpperCase()
                          )
                        }
                        className="w-full min-w-32 border border-neutral-200 px-2 py-2 text-xs uppercase outline-none focus:border-neutral-900"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={variant.stock}
                        onChange={event =>
                          updateVariant(index, 'stock', event.target.value)
                        }
                        className="w-20 border border-neutral-200 px-2 py-2 text-xs outline-none focus:border-neutral-900"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {form.variants.length === 0 && (
          <p className="mt-4 text-xs text-neutral-400">
            No variants generated yet.
          </p>
        )}
      </div>
    </section>
  )
}
