
import { useEffect, useMemo, useState } from 'react'
import { ImagePlus, LoaderCircle, Trash2, UploadCloud } from 'lucide-react'
import {
  uploadAdminProductImages,
  deleteAdminProductImages,
} from '../../services/api'

export default function AdminProductImageManager({
  productId,
  images = [],
  colors = [],
  onChange,
}) {
  const [target, setTarget] = useState('gallery')
  const [colorName, setColorName] = useState('')
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const previews = useMemo(
    () =>
      files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [files]
  )

  useEffect(() => {
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.url))
    }
  }, [files])

  const selectedColor = colors.find(
    color => color.name?.toLowerCase() === colorName.toLowerCase()
  )

  const displayedImages =
    target === 'gallery'
      ? images
      : selectedColor?.images || []

  function handleFileChange(event) {
    const selected = Array.from(event.target.files || [])

    setError('')
    setMessage('')

    if (selected.length > 10) {
      setError('You can upload a maximum of 10 images at a time.')
      setFiles([])
      event.target.value = ''
      return
    }

    setFiles(selected)
  }

  async function handleUpload() {
    if (!productId) {
      setError('Save the product as a draft before uploading images.')
      return
    }

    if (!files.length) {
      setError('Please select at least one image.')
      return
    }

    if (target === 'color' && !colorName) {
      setError('Please select a colour.')
      return
    }

    if (target === 'color' && !selectedColor) {
      setError('This colour has not been added to the product yet.')
      return
    }

    try {
      setUploading(true)
      setError('')
      setMessage('')

      const result = await uploadAdminProductImages(
        productId,
        files,
        target,
        colorName
      )

      const uploadedImages = result.data?.images || []

      if (target === 'gallery') {
        onChange({
          images: [...images, ...uploadedImages],
          colors,
        })
      } else {
        onChange({
          images,
          colors: colors.map(color =>
            color.name.toLowerCase() === colorName.toLowerCase()
              ? {
                  ...color,
                  images: [...(color.images || []), ...uploadedImages],
                }
              : color
          ),
        })
      }

      setFiles([])
      setMessage('Images uploaded successfully.')
    } catch (err) {
      setError(err.message || 'Unable to upload images.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(image) {
    if (!image.publicId) {
      setError('This image has no Cloudinary public ID and cannot be deleted here.')
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this image?'
    )

    if (!confirmed) return

    try {
      setDeletingId(image.publicId)
      setError('')
      setMessage('')

      await deleteAdminProductImages(productId, [image.publicId])

      if (target === 'gallery') {
        onChange({
          images: images.filter(
            item => item.publicId !== image.publicId
          ),
          colors,
        })
      } else {
        onChange({
          images,
          colors: colors.map(color =>
            color.name.toLowerCase() === colorName.toLowerCase()
              ? {
                  ...color,
                  images: (color.images || []).filter(
                    item => item.publicId !== image.publicId
                  ),
                }
              : color
          ),
        })
      }

      setMessage('Image deleted successfully.')
    } catch (err) {
      setError(err.message || 'Unable to delete image.')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="space-y-7">
      {/* Upload destination */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setTarget('gallery')
            setFiles([])
            setError('')
            setMessage('')
          }}
          className={`border px-4 py-3 text-[10px] uppercase tracking-[0.12em] transition ${
            target === 'gallery'
              ? 'border-neutral-950 bg-neutral-950 text-white'
              : 'border-neutral-200 text-neutral-600 hover:border-neutral-500'
          }`}
        >
          Main gallery
        </button>

        <button
          type="button"
          onClick={() => {
            setTarget('color')
            setFiles([])
            setError('')
            setMessage('')
          }}
          className={`border px-4 py-3 text-[10px] uppercase tracking-[0.12em] transition ${
            target === 'color'
              ? 'border-neutral-950 bg-neutral-950 text-white'
              : 'border-neutral-200 text-neutral-600 hover:border-neutral-500'
          }`}
        >
          Colour images
        </button>
      </div>

      {target === 'color' && (
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-neutral-500">
            Select colour
          </label>

          <select
            value={colorName}
            onChange={event => {
              setColorName(event.target.value)
              setFiles([])
              setError('')
              setMessage('')
            }}
            className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950"
          >
            <option value="">Choose a colour</option>
            {colors.map(color => (
              <option key={color.name} value={color.name}>
                {color.name}
              </option>
            ))}
          </select>

          {colors.length === 0 && (
            <p className="mt-2 text-xs text-neutral-400">
              Add product colours before uploading colour-specific images.
            </p>
          )}
        </div>
      )}

      {/* Existing images */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">
            {target === 'gallery'
              ? 'Gallery images'
              : `${colorName || 'Colour'} images`}
          </p>

          <span className="text-xs text-neutral-400">
            {displayedImages.length} images
          </span>
        </div>

        {displayedImages.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {displayedImages.map((image, index) => (
              <div
                key={image.publicId || image.url || index}
                className="group relative aspect-[3/4] overflow-hidden bg-neutral-100"
              >
                <img
                  src={image.url}
                  alt={image.alt || 'Product image'}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => handleDelete(image)}
                  disabled={Boolean(deletingId)}
                  aria-label="Delete image"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-white text-neutral-700 opacity-100 shadow-sm transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  {deletingId === image.publicId ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>

                {image.alt && (
                  <div className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-2 py-2 text-[9px] text-white">
                    {image.alt}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-36 flex-col items-center justify-center border border-dashed border-neutral-300 px-5 text-center">
            <ImagePlus size={22} className="mb-3 text-neutral-400" />
            <p className="text-sm text-neutral-600">No images uploaded yet</p>
            <p className="mt-1 text-xs text-neutral-400">
              Upload images to display them here.
            </p>
          </div>
        )}
      </div>

      {/* Upload area */}
      <div className="border border-neutral-200 p-5">
        <div className="mb-4">
          <p className="text-sm font-medium text-neutral-800">
            Upload new images
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            JPEG, PNG, WebP or AVIF. Maximum 8 MB per image and 10 images per upload.
          </p>
        </div>

        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center border border-dashed border-neutral-300 bg-neutral-50 px-5 text-center transition hover:border-neutral-600">
          <UploadCloud size={22} className="mb-3 text-neutral-500" />

          <span className="text-xs font-medium text-neutral-700">
            Choose images from your device
          </span>

          <span className="mt-1 text-[10px] text-neutral-400">
            You can select multiple images
          </span>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {previews.map((preview, index) => (
              <div key={`${preview.name}-${index}`} className="min-w-0">
                <div className="aspect-[3/4] bg-neutral-100">
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-1 truncate text-[9px] text-neutral-500">
                  {preview.name}
                </p>
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-neutral-500">
              {files.length} image{files.length === 1 ? '' : 's'} selected
            </p>

            <button
              type="button"
              onClick={() => setFiles([])}
              className="text-[10px] uppercase tracking-wider text-neutral-500 underline"
            >
              Clear selection
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={
            uploading ||
            !files.length ||
            (target === 'color' && !selectedColor)
          }
          className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-neutral-950 px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {uploading && (
            <LoaderCircle size={14} className="animate-spin" />
          )}
          {uploading ? 'Uploading...' : 'Upload images'}
        </button>
      </div>

      {error && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {message}
        </p>
      )}
    </div>
  )
}
