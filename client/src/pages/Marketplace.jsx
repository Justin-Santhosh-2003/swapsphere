import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Marketplace.css";
import ListingCard from "../components/marketplace/ListingCard";
import SearchableSelect from "../components/common/SearchableSelect";
import { getItems } from "../api/itemApi";
import { getCategories } from "../api/categoryApi";

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sync selectedCategory with searchParams
  useEffect(() => {
    const catFromUrl = searchParams.get("category") || "";
    if (catFromUrl !== selectedCategory) {
      setSelectedCategory(catFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data.categories || []);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      setSelectedSubcategory("");
      return;
    }

    const category = categories.find((cat) => cat._id === selectedCategory);
    if (category) {
      setSubcategories(category.subcategories || []);
    } else {
      setSubcategories([]);
    }
    setSelectedSubcategory("");
  }, [selectedCategory, categories]);

  // Combined effect: reset page on filter changes, then fetch
  useEffect(() => {
    // Reset to page 1 whenever a filter (not the page itself) changes
    // We track this by resetting currentPage inside the effect
    // This single effect replaces the two-effect pattern that caused race conditions.
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await getItems({
          search,
          categoryId: selectedCategory,
          subcategory: selectedSubcategory,
          condition: selectedCondition,
          sort: selectedSort,
          page: currentPage,
          limit: 12
        });
        setListings(res.data.items || []);
        setCurrentPage(res.data.currentPage || 1);
        setTotalPages(res.data.totalPages || 1);
      } catch (error) {
        console.error("Failed to load marketplace items:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchItems();
    }, 400);

    return () => clearTimeout(timer);
  }, [
    search,
    selectedCategory,
    selectedSubcategory,
    selectedCondition,
    selectedSort,
    currentPage
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategory, selectedSubcategory, selectedCondition, selectedSort]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedCondition("");
    setSelectedSort("newest");
    setSearchParams({});
  };

  const selectedCategoryObj = categories.find((c) => c._id === selectedCategory);

  const hasActiveFilters =
    search || selectedCategory || selectedSubcategory || selectedCondition || selectedSort !== "newest";

  return (
    <section className="marketplace-page">
      <div className="container">
        {/* HEADER */}
        <div className="marketplace-header text-center mb-4">
          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-semibold mb-2">
            BARTER MARKETPLACE
          </span>
          <h1 className="fw-bold display-5">Explore SwapSphere Items</h1>
          <p className="text-secondary max-width-600 mx-auto">
            Discover items available for cash-free exchange. Find something you need and propose a swap with something you have.
          </p>
        </div>

        {/* UNIFIED SEARCH AND FILTER CONTROL PANEL */}
        <div className="marketplace-tools-box shadow-sm mb-5">
          <div className="marketplace-search-wrapper mb-3">
            <span className="search-icon-left">🔍</span>
            <input
              type="text"
              className="marketplace-search-input"
              placeholder="Search items by keyword, title, description, or wanted exchange preferences..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch("")}
                title="Clear search"
              >
                ✖
              </button>
            )}
          </div>

          <div className="marketplace-filters-grid">
            {/* SEARCHABLE CATEGORY SELECT */}
            <div>
              <label className="form-label small fw-bold text-muted mb-1">Category:</label>
              <SearchableSelect
                options={categories.map((c) => ({
                  value: c._id,
                  label: c.name,
                  icon: c.icon,
                  badge: `${(c.subcategories || []).length} sub`
                }))}
                value={selectedCategory}
                onChange={(catId) => {
                  setSelectedCategory(catId);
                  if (catId) setSearchParams({ category: catId });
                  else setSearchParams({});
                }}
                placeholder="All Categories"
                searchPlaceholder="Search categories..."
              />
            </div>

            {/* SEARCHABLE SUBCATEGORY SELECT */}
            <div>
              <label className="form-label small fw-bold text-muted mb-1">Subcategory:</label>
              <SearchableSelect
                options={subcategories.map((sub) => ({
                  value: sub,
                  label: sub
                }))}
                value={selectedSubcategory}
                onChange={(sub) => setSelectedSubcategory(sub)}
                placeholder={selectedCategory ? "All Subcategories" : "Select Category First"}
                searchPlaceholder="Search subcategories..."
                disabled={!selectedCategory}
              />
            </div>

            {/* CONDITION SELECT */}
            <div>
              <label className="form-label small fw-bold text-muted mb-1">Item Condition:</label>
              <select
                className="form-select rounded-3"
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
              >
                <option value="">All Conditions</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
              </select>
            </div>

            {/* SORT SELECT */}
            <div>
              <label className="form-label small fw-bold text-muted mb-1">Sort By:</label>
              <select
                className="form-select rounded-3"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* ACTIVE FILTER BADGES BAR */}
          {hasActiveFilters && (
            <div className="active-filters-bar mt-3 pt-3 border-top">
              <span className="small text-muted fw-bold me-2">Active Filters:</span>
              {search && (
                <span className="filter-badge">
                  Search: "{search}"{" "}
                  <button onClick={() => setSearch("")}>×</button>
                </span>
              )}
              {selectedCategoryObj && (
                <span className="filter-badge">
                  Category: {selectedCategoryObj.name}{" "}
                  <button onClick={() => { setSelectedCategory(""); setSearchParams({}); }}>×</button>
                </span>
              )}
              {selectedSubcategory && (
                <span className="filter-badge">
                  Subcategory: {selectedSubcategory}{" "}
                  <button onClick={() => setSelectedSubcategory("")}>×</button>
                </span>
              )}
              {selectedCondition && (
                <span className="filter-badge">
                  Condition: {selectedCondition}{" "}
                  <button onClick={() => setSelectedCondition("")}>×</button>
                </span>
              )}
              <button
                type="button"
                className="reset-all-btn ms-auto"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* LISTINGS GRID */}
        <div className="listing-grid">
          {loading ? (
            Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="skeleton-card"></div>
            ))
          ) : listings.length > 0 ? (
            listings.map((item) => <ListingCard key={item._id} listing={item} />)
          ) : (
            <div className="empty-marketplace text-center p-5 bg-white rounded-4 shadow-sm">
              <div className="empty-icon fs-1 mb-3">🔍</div>
              <h3 className="fw-bold">No Barter Items Found</h3>
              <p className="text-muted">Try changing your search terms or active category filters.</p>
              <button
                className="btn btn-outline-success mt-2 rounded-pill px-4"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination-container d-flex justify-content-center align-items-center gap-3 mt-5">
            <button
              className="btn btn-outline-success px-4 rounded-pill fw-semibold"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ← Previous
            </button>

            <span className="page-number fw-bold text-success">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="btn btn-outline-success px-4 rounded-pill fw-semibold"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}