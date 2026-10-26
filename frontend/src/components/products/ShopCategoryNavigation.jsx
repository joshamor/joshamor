
import { Link } from 'react-router-dom'
import './shop-category-navigation.css'

export default function ShopCategoryNavigation({
  category,
  subcategory,
  onSubcategoryChange,
}) {
  const subcategories = category?.subcategories || []

  return (
    <section className="shop-category-navigation">
      <nav className="shop-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/shop">Shop</Link>

        {category?.slug && (
          <>
            <span>›</span>
            <span aria-current="page">{category.label}</span>
          </>
        )}

        {subcategory && (
          <>
            <span>›</span>
            <span aria-current="page">{subcategory}</span>
          </>
        )}
      </nav>

      {subcategories.length > 0 && (
        <nav
          className="shop-subcategories"
          aria-label="Product subcategories"
        >
          {subcategories.map((item) => (
            <button
              key={item}
              type="button"
              className={
                subcategory === item ? 'is-active' : ''
              }
              aria-pressed={subcategory === item}
              onClick={() =>
                onSubcategoryChange(
                  subcategory === item ? null : item
                )
              }
            >
              {item}
            </button>
          ))}
        </nav>
      )}
    </section>
  )
}
