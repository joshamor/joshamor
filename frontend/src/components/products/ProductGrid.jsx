
import ProductCard from './ProductCard'
import './product-grid.css'

export default function ProductGrid({ products, columns = 4 }) {
  return (
    <div
      className="product-grid"
      style={{ '--product-columns': columns }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
