import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../../api/categoryApi";
import "./Categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to load categories on home page:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  const handleCategoryClick = (catId) => {
    navigate(`/marketplace?category=${catId}`);
  };

  return (
    <section className="category-section">
      <div className="container">
        <div className="category-header">
          <span className="section-badge">EXPLORE CATEGORIES</span>
          <h2>What Can You Swap?</h2>
          <p>
            Explore different categories and find items that match what you need.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <p className="text-muted">Loading categories...</p>
          </div>
        ) : (
          <div className="row g-4">
            {categories.map((category) => (
              <div
                className="col-lg-4 col-md-6"
                key={category._id}
                onClick={() => handleCategoryClick(category._id)}
                style={{ cursor: "pointer" }}
              >
                <div className="category-card h-100 p-4 border rounded shadow-sm hover-shadow">
                  <div className="category-icon fs-1 mb-3">
                    {category.icon || "📦"}
                  </div>
                  <h4 className="fw-bold">{category.name}</h4>
                  <p className="text-muted mb-0">
                    {category.description || `${(category.subcategories || []).join(", ")}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}