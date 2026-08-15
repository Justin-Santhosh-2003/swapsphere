import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { getUserReviews, createReview } from "../api/reviewApi";
import { getMyExchangeRequests } from "../api/exchangeRequestApi";
import "./Profile.css";

export default function Profile() {
    const { user, updateUser, fetchUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [reviews, setReviews] = useState([]);
    const [completedExchanges, setCompletedExchanges] = useState([]);

    // Write review modal state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedExchangeId, setSelectedExchangeId] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    const [editData, setEditData] = useState({
        fullName: "",
        phone: "",
        bio: "",
        location: ""
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        if (user) {
            setEditData({
                fullName: user.fullName || "",
                phone: user.phone || "",
                bio: user.bio || "",
                location: user.location || ""
            });
            setPreviewUrl(user.profilePicture || "");
            loadReviewsAndExchanges();
        }
    }, [user]);

    const loadReviewsAndExchanges = async () => {
        if (!user?._id) return;
        try {
            const [reviewsRes, requestsRes] = await Promise.all([
                getUserReviews(user._id),
                getMyExchangeRequests("all")
            ]);
            setReviews(reviewsRes.data.reviews || []);

            const completed = (requestsRes.data.requests || []).filter(
                (req) => req.status === "ACCEPTED" || req.status === "COMPLETED"
            );
            setCompletedExchanges(completed);
        } catch (err) {
            console.error("Error loading reviews/exchanges:", err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        setError("");

        try {
            const formData = new FormData();
            formData.append("fullName", editData.fullName);
            formData.append("phone", editData.phone);
            formData.append("bio", editData.bio);
            formData.append("location", editData.location);
            if (selectedFile) {
                formData.append("profilePicture", selectedFile);
            }

            const res = await API.put("/users/me", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.user) {
                updateUser(res.data.user);
            } else {
                fetchUser();
            }

            setMessage("Profile updated successfully!");
            setIsEditing(false);
            setSelectedFile(null);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!selectedExchangeId) return;

        try {
            setReviewSubmitting(true);
            await createReview({
                exchangeRequestId: selectedExchangeId,
                rating,
                comment
            });
            setMessage("Review posted successfully!");
            setShowReviewModal(false);
            setComment("");
            loadReviewsAndExchanges();
            fetchUser();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to post review.");
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (!user) {
        return (
            <section className="profile-section">
                <div className="container text-center">
                    <h4>Loading profile...</h4>
                </div>
            </section>
        );
    }

    const joinedYear = user.createdAt
        ? new Date(user.createdAt).getFullYear()
        : "2026";

    return (
        <section className="profile-section">
            <div className="container">
                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="profile-card">
                    <div className="profile-image">
                        {previewUrl ? (
                            <img src={previewUrl} alt={user.fullName} />
                        ) : (
                            "👤"
                        )}
                    </div>

                    {!isEditing ? (
                        <>
                            <h1>{user.fullName}</h1>
                            <p className="joined">Member since {joinedYear} • 📍 {user.location}</p>
                            {user.phone && <p className="text-muted mb-1">📞 {user.phone}</p>}
                            <p className="bio">{user.bio || "No bio added yet."}</p>

                            <button
                                className="btn btn-outline-success btn-sm mt-3 mb-3"
                                onClick={() => setIsEditing(true)}
                            >
                                ✏️ Edit Profile
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleSave} className="w-100 text-start mt-3">
                            <div className="mb-3">
                                <label className="form-label">Profile Picture</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editData.fullName}
                                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editData.location}
                                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Phone</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Bio</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={editData.bio}
                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-success" disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setIsEditing(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="trust-cards mt-4">
                        <div>
                            ⭐
                            <strong>{user.averageRating || 0}</strong>
                            <span>Rating</span>
                        </div>
                        <div>
                            🔄
                            <strong>{user.totalCompletedExchanges || 0}</strong>
                            <span>Exchanges</span>
                        </div>
                        <div>
                            ✅
                            <strong>{user.exchangeSuccessRate || 0}%</strong>
                            <span>Success Rate</span>
                        </div>
                    </div>
                </div>

                {/* REVIEWS SECTION */}
                <div className="profile-section-box mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>Reviews Received ({reviews.length})</h3>
                        {completedExchanges.length > 0 && (
                            <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() => {
                                    setSelectedExchangeId(completedExchanges[0]._id);
                                    setShowReviewModal(true);
                                }}
                            >
                                ⭐ Leave a Review
                            </button>
                        )}
                    </div>

                    {reviews.length === 0 ? (
                        <div className="review-card">
                            <h5>No reviews yet</h5>
                            <p>⭐⭐⭐⭐⭐</p>
                            <span>Your received exchange reviews will be displayed here.</span>
                        </div>
                    ) : (
                        reviews.map((rev) => (
                            <div className="review-card border rounded p-3 mb-3 text-start" key={rev._id}>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <strong className="fs-6">{rev.reviewerId?.fullName || "Anonymous"}</strong>
                                    <span className="text-warning">{"⭐".repeat(rev.rating)}</span>
                                    <small className="text-muted ms-auto">
                                        {new Date(rev.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                                {rev.comment && <p className="mb-0 text-secondary">"{rev.comment}"</p>}
                            </div>
                        ))
                    )}
                </div>

                {/* EXCHANGE HISTORY SECTION */}
                <div className="profile-section-box mt-4">
                    <h3>Exchange History</h3>
                    {completedExchanges.length === 0 ? (
                        <div className="history-card">
                            <span>Accepted or completed exchanges will appear here.</span>
                        </div>
                    ) : (
                        completedExchanges.map((ex) => (
                            <div className="history-card border rounded p-3 mb-2 text-start d-flex justify-content-between align-items-center" key={ex._id}>
                                <div>
                                    <strong>{ex.offeredItemId?.title} ↔ {ex.requestedItemId?.title}</strong>
                                    <div className="small text-muted">
                                        Partner: {ex.requesterId?._id === user._id ? ex.receiverId?.fullName : ex.requesterId?.fullName}
                                    </div>
                                </div>
                                <span className="badge bg-success">{ex.status}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* LEAVE REVIEW MODAL */}
            {showReviewModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content text-start">
                            <div className="modal-header">
                                <h5 className="modal-title">Write a Review</h5>
                                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
                            </div>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Select Exchange:</label>
                                        <select
                                            className="form-select"
                                            value={selectedExchangeId}
                                            onChange={(e) => setSelectedExchangeId(e.target.value)}
                                            required
                                        >
                                            {completedExchanges.map((ex) => (
                                                <option key={ex._id} value={ex._id}>
                                                    {ex.offeredItemId?.title} ↔ {ex.requestedItemId?.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Rating (1 to 5 stars):</label>
                                        <select
                                            className="form-select"
                                            value={rating}
                                            onChange={(e) => setRating(Number(e.target.value))}
                                        >
                                            <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                                            <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                                            <option value={3}>⭐⭐⭐ (3 - Average)</option>
                                            <option value={2}>⭐⭐ (2 - Below Average)</option>
                                            <option value={1}>⭐ (1 - Poor)</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Comment / Experience:</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Great exchange, item condition was as described..."
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowReviewModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success" disabled={reviewSubmitting}>
                                        {reviewSubmitting ? "Submitting..." : "Submit Review"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
