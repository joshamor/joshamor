export default function ProductStatusSection({
  productId,
  saving,
  hasChanges,
  handleSave,
}) {
  return (
    <section className="border-t border-neutral-200 pt-9">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">
            Product status
          </p>

          <p className="mt-1 text-sm text-neutral-600">
            {productId
              ? 'This product is saved as a draft.'
              : 'Save this product to create its draft in the database.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || (!hasChanges && Boolean(productId))}
          className="inline-flex items-center justify-center gap-2 border border-neutral-950 px-5 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-950 transition hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Save as draft'}
        </button>
      </div>
    </section>
  )
}
