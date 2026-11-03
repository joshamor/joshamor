import AdminProductImageManager from '../AdminProductImageManager'

export default function ProductImagesSection({
  productId,
  images,
  colors,
  onChange,
}) {
  return (
    <section className="border-t border-neutral-200 pt-9">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">
          03
        </p>

        <h2 className="mt-1 text-lg font-medium text-neutral-950">
          Product images
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Manage the main product gallery and images for individual colours.
        </p>
      </div>

      {productId ? (
        <AdminProductImageManager
          productId={productId}
          images={images}
          colors={colors}
          onChange={onChange}
        />
      ) : (
        <div className="border border-dashed border-neutral-300 px-5 py-10 text-center">
          <p className="text-sm text-neutral-700">
            Save this product as a draft first.
          </p>

          <p className="mt-2 text-xs text-neutral-400">
            Once the draft has been created, you'll be able to upload product
            images.
          </p>
        </div>
      )}
    </section>
  )
}
