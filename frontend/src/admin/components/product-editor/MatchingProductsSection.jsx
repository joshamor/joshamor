export default function MatchingProductsSection({
  form,
  matchingSearch,
  setMatchingSearch,
  matchingResults,
  selectedMatchingProducts,
  matchingLoading,
  matchingError,
  addMatchingProduct,
  removeMatchingProduct,
}) {
  const availableProducts = matchingResults.filter(
    product => !form.matchingProducts?.includes(product._id)
  )

  return (
    <section className="space-y-6 border-t border-neutral-200 pt-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
          Product recommendations
        </p>

        <h2 className="mt-2 text-xl font-medium">
          Matching Products
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          Select other products to recommend alongside this product.
        </p>
      </div>

      {/* Selected products */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-600">
          Selected products ({selectedMatchingProducts.length})
        </h3>

        {selectedMatchingProducts.length === 0 ? (
          <div className="border border-dashed border-neutral-300 px-5 py-7 text-center text-sm text-neutral-400">
            No matching products selected.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedMatchingProducts.map(product => (
              <div
                key={product._id}
                className="flex items-center gap-4 border border-neutral-200 p-3"
              >
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="h-16 w-14 object-cover"
                  />
                ) : (
                  <div className="h-16 w-14 bg-neutral-100" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {product.name}
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    {product.slug}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeMatchingProduct(product._id)}
                  className="text-xs uppercase tracking-wider text-neutral-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="space-y-3">
        <label className="mb-2 block text-xs uppercase tracking-wider">
          Search published products
        </label>

        <input
          type="search"
          value={matchingSearch}
          onChange={event => setMatchingSearch(event.target.value)}
          placeholder="Search by product name..."
          className="w-full border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
        />

        {matchingLoading && (
          <p className="text-xs text-neutral-400">
            Searching products...
          </p>
        )}

        {matchingError && (
          <p className="text-xs text-red-600">
            {matchingError}
          </p>
        )}

        {!matchingLoading && !matchingError && (
          <div className="divide-y divide-neutral-100 border border-neutral-200">
            {availableProducts.map(product => (
              <div
                key={product._id}
                className="flex items-center gap-4 p-3"
              >
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="h-14 w-12 object-cover"
                  />
                ) : (
                  <div className="h-14 w-12 bg-neutral-100" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-neutral-900">
                    {product.name}
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    {product.slug}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => addMatchingProduct(product)}
                  className="border border-neutral-300 px-3 py-2 text-[10px] uppercase tracking-wider transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
                >
                  Add
                </button>
              </div>
            ))}

            {availableProducts.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-neutral-400">
                No available matching products found.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
