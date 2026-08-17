import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicProfile } from "../api/userApi";
import "./UserProfile.css";

export default function UserProfile() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await getPublicProfile(id);
                setProfile(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "User not found.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <section className="up-section">
                <div className="up-loading">
                    <div className="up-spinner" />
                    <p>Loading profile...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="up-section">
                <div className="up-error">
                    <span>😕</span>
                    <h3>{error}</h3>
                    <Link to="/marketplace" className="up-btn">Browse Marketplace</Link>
                </div>
            </section>
        );
    }

    const { user, items, reviews } = profile;
    const joinedYear = user.createdAt ? new Date(user.createdAt).getFullYear() : "—";

    return (
        <section className="up-section">
            <div className="up-container">

                {/* ── PROFILE HEADER ─────────────────────────── */}
                <div className="up-header-card">
                    <div className="up-avatar">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.fullName} />
                        ) : (
                            <span>{(user.fullName || "U")[0]}</span>
                        )}
                    </div>
                    <div className="up-header-info">
                        <h1 className="up-name">{user.fullName}</h1>
                        <p className="up-meta">
                            📍 {user.location || "—"} &nbsp;·&nbsp; Member since {joinedYear}
                        </p>
                        {user.bio && <p className="up-bio">{user.bio}</p>}
                    </div>
                    <div className="up-stats">
                        <div className="up-stat">
                            <strong>{user.averageRating > 0 ? user.averageRating.toFixed(1) : "—"}</strong>
                            <span>⭐ Rating</span>
                        </div>
                        <div className="up-stat">
                            <strong>{user.totalCompletedExchanges || 0}</strong>
                            <span>🔄 Swaps</span>
                        </div>
                        <div className="up-stat">
                            <strong>{user.exchangeSuccessRate || 0}%</strong>
                            <span>✅ Success</span>
                        </div>
                    </div>
                </div>

                <div className="up-body">

                    {/* ── ACTIVE LISTINGS ─────────────────────── */}
                    <div className="up-section-box">
                        <h2 className="up-section-title">
                            📦 Active Listings
                            <span className="up-count">{items.length}</span>
                        </h2>
                        {items.length === 0 ? (
                            <p className="up-empty">No active listings at the moment.</p>
                        ) : (
                            <div className="up-listings-grid">
                                {items.map((item) => (
                                    <Link
                                        key={item._id}
                                        to={`/item/${item._id}`}
                                        className="up-listing-card"
                                    >
                                        <div className="up-listing-img">
                                            {item.images?.[0] ? (
                                                <img src={item.images[0]} alt={item.title} />
                                            ) : (
                                                <span>📦</span>
                                            )}
                                        </div>
                                        <div className="up-listing-info">
                                            <strong>{item.title}</strong>
                                            <span>{item.categoryId?.name}{item.subcategory ? ` · ${item.subcategory}` : ""}</span>
                                            <span className="up-condition">{item.condition?.replace(/_/g, " ")}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── REVIEWS ─────────────────────────────── */}
                    <div className="up-section-box">
                        <h2 className="up-section-title">
                            ⭐ Reviews Received
                            <span className="up-count">{reviews.length}</span>
                        </h2>
                        {reviews.length === 0 ? (
                            <p className="up-empty">No reviews yet.</p>
                        ) : (
                            <div className="up-reviews">
                                {reviews.map((rev) => (
                                    <div key={rev._id} className="up-review-card">
                                        <div className="up-review-header">
                                            <div className="up-review-avatar">
                                                {rev.reviewerId?.profilePicture ? (
                                                    <img src={rev.reviewerId.profilePicture} alt={rev.reviewerId.fullName} />
                                                ) : (
                                                    <span>{(rev.reviewerId?.fullName || "U")[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <strong>{rev.reviewerId?.fullName || "Anonymous"}</strong>
                                                <div className="up-stars">{"⭐".repeat(rev.rating)}</div>
                                            </div>
                                            <small className="up-review-date ms-auto">
                                                {new Date(rev.createdAt).toLocaleDateString()}
                                            </small>
                                        </div>
                                        {rev.comment && (
                                            <p className="up-review-comment">"{rev.comment}"</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
