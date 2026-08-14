import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getItems } from "../../api/itemApi";
import ListingCard from "../marketplace/ListingCard";
import "./RecentListings.css";

export default function RecentListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await getItems({ limit: 3, sort: "newest" });
        setListings(res.data.items || []);
      } catch (err) {
        console.error("Failed to load recent items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <section className="recent-section py-5">
      <div className="container">
        <div className="recent-header text-center mb-5">
          <span className="section-badge">RECENT LISTINGS</span>
          <h2>Discover Items Available for Swap</h2>
          <p>
            Explore recently added items from users looking for their next exchange.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <p className="text-muted">Loading recent listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">No listings available yet.</p>
          </div>
        ) : (
          <div className="row g-4">
            {listings.map((item) => (
              <div className="col-lg-4 col-md-6" key={item._id}>
                <ListingCard listing={item} />
              </div>
            ))}
          </div>
        )}

        <div className="marketplace-button text-center mt-5">
          <Link to="/marketplace" className="btn btn-success btn-lg">
            Browse Marketplace →
          </Link>
        </div>
      </div>
    </section>
  );
}