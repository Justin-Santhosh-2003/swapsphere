import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

  // Show top 6 categories on home page
  const featuredCategories = categories.slice(0, 6);

  return (
    <section className="category-section">
      <div className="container">
        <div className="category-header">
          <span className="section-badge">EXPLORE CATEGORIES</span>
          <h2>What Can You Swap?</h2>
          <p>
            Browse broad categories and discover subcategories for easy item matching.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-success mb-2" role="status"></div>
            <p className="text-muted">Loading categories...</p>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {featuredCategories.map((category) => (
                <div
                  className="col-lg-4 col-md-6"
                  key={category._id}
                  onClick={() => handleCategoryClick(category._id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="category-card h-100 p-4 border rounded-4 shadow-sm hover-shadow bg-white transition-all">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="category-icon fs-1">
                        {category.icon || "📦"}
                      </div>
                      <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1 small font-semibold">
                        {(category.subcategories || []).length} Subcategories
                      </span>
                    </div>

                    <h4 className="fw-bold text-dark mb-2">{category.name}</h4>
                    
                    <p className="text-muted small mb-3">
                      {category.description}
                    </p>

                    {/* SUBCATEGORY TAGS */}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mt-auto">
                        {category.subcategories.slice(0, 3).map((sub, idx) => (
                          <span key={idx} className="badge bg-light text-secondary border px-2 py-1 small font-normal">
                            {sub}
                          </span>
                        ))}
                        {category.subcategories.length > 3 && (
                          <span className="badge bg-light text-muted border px-2 py-1 small">
                            +{category.subcategories.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-5">
              <Link to="/marketplace" className="btn btn-outline-success btn-lg rounded-pill px-4 fw-semibold">
                Browse All Categories & Marketplace →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}