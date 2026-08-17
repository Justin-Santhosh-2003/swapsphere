import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { getUserReviews, createReview } from "../api/reviewApi";
import { getMyExchangeRequests } from "../api/exchangeRequestApi";
import { getMyExchangeRooms } from "../api/exchangeRoomApi";
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
    const [selectedExchangeIndex, setSelectedExchangeIndex] = useState(0);
    const [selectedRevieweeId, setSelectedRevieweeId] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [myReviewedKeys, setMyReviewedKeys] = useState(new Set());
    const [unreviewedExchanges, setUnreviewedExchanges] = useState([]);


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
        const myId = user._id.toString();

        try {
            const [reviewsRes, requestsRes, roomsRes, givenReviewsRes] = await Promise.all([
                getUserReviews(user._id),
                getMyExchangeRequests("all"),
                getMyExchangeRooms().catch(() => ({ data: { rooms: [] } })),
                API.get("/reviews/given/me").catch(() => ({ data: { reviews: [] } }))
            ]);

            setReviews(reviewsRes.data.reviews || []);

            const revs = givenReviewsRes.data.reviews || [];
            const reviewedKeys = new Set();
            revs.forEach((r) => {
                const rIdStr = r.revieweeId ? (r.revieweeId._id?.toString() || r.revieweeId.toString()) : "";
                if (r.exchangeRequestId) {
                    const reqId = r.exchangeRequestId._id?.toString() || r.exchangeRequestId.toString();
                    reviewedKeys.add(reqId);
                    if (rIdStr) reviewedKeys.add(`${reqId}_${rIdStr}`);
                    if (r.exchangeRequestId.exchangeRoomId) {
                        const linkedRoom = r.exchangeRequestId.exchangeRoomId.toString();
                        reviewedKeys.add(linkedRoom);
                        if (rIdStr) reviewedKeys.add(`${linkedRoom}_${rIdStr}`);
                    }
                }
                if (r.exchangeRoomId) {
                    const roomIdObj = r.exchangeRoomId;
                    const roomIdStr = roomIdObj._id?.toString() || roomIdObj.toString();
                    reviewedKeys.add(roomIdStr);
                    if (rIdStr) reviewedKeys.add(`${roomIdStr}_${rIdStr}`);
                    if (roomIdObj.exchangeRequestId) {
                        const linkedReq = roomIdObj.exchangeRequestId.toString();
                        reviewedKeys.add(linkedReq);
                        if (rIdStr) reviewedKeys.add(`${linkedReq}_${rIdStr}`);
                    }
                }
            });
            setMyReviewedKeys(reviewedKeys);

            const rawRequests = (requestsRes.data.requests || []).filter(
                (req) => req.status === "COMPLETED"
            );
            const rawRooms = (roomsRes.data.rooms || []).filter(
                (rm) => rm.status === "COMPLETED"
            );

            // Track room IDs linked to requests to prevent duplicate display
            const linkedRequestIds = new Set(
                rawRooms.map((r) => r.exchangeRequestId?.toString()).filter(Boolean)
            );

            const unifiedList = [];

            // Add completed rooms (2-way & 3-way)
            rawRooms.forEach((room) => {
                const otherParticipants = room.participants
                    .filter((p) => (p.userId?._id?.toString() || p.userId?.toString()) !== myId)
                    .map((p) => p.userId);

                let displayTitle = "";
                if (room.exchangeType === "THREE_WAY") {
                    const itemTitles = room.items.map((i) => i.itemId?.title).filter(Boolean);
                    displayTitle = `🔄 3-Way Swap: ${itemTitles.join(" ➔ ")}`;
                } else {
                    const myItemObj = room.items.find(
                        (i) => (i.fromUserId?._id?.toString() || i.fromUserId?.toString()) === myId
                    );
                    const theirItemObj = room.items.find(
                        (i) => (i.toUserId?._id?.toString() || i.toUserId?.toString()) === myId
                    );
                    displayTitle = `${myItemObj?.itemId?.title || "Item"} ↔ ${theirItemObj?.itemId?.title || "Item"}`;
                }

                unifiedList.push({
                    _id: room._id,
                    exchangeRequestId: room.exchangeRequestId,
                    isRoom: true,
                    type: room.exchangeType,
                    displayTitle,
                    otherParticipants,
                    date: room.updatedAt
                });

            });

            // Add completed requests not covered by a room
            rawRequests.forEach((req) => {
                if (!linkedRequestIds.has(req._id.toString())) {
                    const isRequester = (req.requesterId?._id?.toString() || req.requesterId?.toString()) === myId;
                    const partner = isRequester ? req.receiverId : req.requesterId;
                    const myItem = isRequester ? req.offeredItemId : req.requestedItemId;
                    const theirItem = isRequester ? req.requestedItemId : req.offeredItemId;

                    unifiedList.push({
                        _id: req._id,
                        isRoom: false,
                        type: "DIRECT",
                        displayTitle: `${myItem?.title || "Item"} ↔ ${theirItem?.title || "Item"}`,
                        otherParticipants: [partner],
                        date: req.updatedAt
                    });
                }
            });

            unifiedList.sort((a, b) => new Date(b.date) - new Date(a.date));
            setCompletedExchanges(unifiedList);

            // Filter unreviewed exchanges
            const unreviewed = unifiedList.filter((ex) => {
                const exId = ex._id.toString();
                if (!reviewedKeys.has(exId)) return true;
                if (ex.otherParticipants && ex.otherParticipants.length > 1) {
                    return ex.otherParticipants.some((p) => !reviewedKeys.has(`${exId}_${p._id || p}`));
                }
                return false;
            });
            setUnreviewedExchanges(unreviewed);

            if (unreviewed.length > 0) {
                const firstEx = unreviewed[0];
                if (firstEx.otherParticipants?.[0]) {
                    setSelectedRevieweeId(firstEx.otherParticipants[0]._id || firstEx.otherParticipants[0]);
                }
            }
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

    const handleExchangeSelect = (indexStr) => {
        const idx = Number(indexStr);
        setSelectedExchangeIndex(idx);
        const selected = completedExchanges[idx];
        if (selected?.otherParticipants?.[0]) {
            const partnerId = selected.otherParticipants[0]._id || selected.otherParticipants[0];
            setSelectedRevieweeId(partnerId);
        }
    };

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [popupModal, setPopupModal] = useState({ show: false, title: "", message: "", isSuccess: true });

    const handleReviewPrompt = (e) => {
        e.preventDefault();
        const selectedEx = completedExchanges[selectedExchangeIndex];
        if (!selectedEx) return;
        setShowConfirmModal(true);
    };


    const handleConfirmSubmit = async () => {
        setShowConfirmModal(false);
        const selectedEx = completedExchanges[selectedExchangeIndex];
        if (!selectedEx) return;

        try {
            setReviewSubmitting(true);
            setError("");
            setMessage("");

            const payload = {
                exchangeRoomId: selectedEx.isRoom ? selectedEx._id : undefined,
                exchangeRequestId: selectedEx.exchangeRequestId || (!selectedEx.isRoom ? selectedEx._id : undefined),
                revieweeId: selectedRevieweeId,
                rating,
                comment
            };

            await createReview(payload);

            setShowReviewModal(false);
            setComment("");
            setPopupModal({
                show: true,
                title: "⭐ Review Submitted!",
                message: "Thank you for your feedback! Your review has been saved.",
                isSuccess: true
            });
            await loadReviewsAndExchanges();
            await fetchUser();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Failed to post review.";
            setShowReviewModal(false);
            setPopupModal({
                show: true,
                title: "ℹ️ Review Notice",
                message: msg,
                isSuccess: false
            });
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

    const selectedEx = completedExchanges[selectedExchangeIndex];

    return (
        <section className="profile-section">
            <div className="container">
                {message && <div className="alert alert-success alert-dismissible fade show">{message}</div>}
                {error && <div className="alert alert-danger alert-dismissible fade show">{error}</div>}

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
                            unreviewedExchanges.length > 0 ? (
                                <button
                                    className="btn btn-outline-success btn-sm fw-semibold rounded-pill px-3"
                                    onClick={() => {
                                        handleExchangeSelect(0);
                                        setShowReviewModal(true);
                                    }}
                                >
                                    ⭐ Leave a Review
                                </button>
                            ) : (
                                <span className="badge bg-secondary p-2 fw-semibold">✅ Reviewed</span>
                            )
                        )}

                    </div>

                    {reviews.length === 0 ? (
                        <div className="review-card text-center p-4">
                            <h5>No reviews received yet</h5>
                            <p className="text-warning fs-5 mb-1">⭐⭐⭐⭐⭐</p>
                            <span className="text-muted">Reviews from counterparties in your 2-way and 3-way completed exchanges will appear here.</span>
                        </div>
                    ) : (
                        reviews.map((rev) => (
                            <div className="review-card border rounded-4 p-3 mb-3 text-start bg-light shadow-sm" key={rev._id}>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <strong className="fs-6 text-dark">{rev.reviewerId?.fullName || "Anonymous"}</strong>
                                    <span className="text-warning ms-1">{"⭐".repeat(rev.rating)}</span>
                                    <small className="text-muted ms-auto">
                                        {new Date(rev.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                                {rev.comment && <p className="mb-0 text-secondary fst-italic">"{rev.comment}"</p>}
                            </div>
                        ))
                    )}
                </div>

                {/* EXCHANGE HISTORY SECTION */}
                <div className="profile-section-box mt-4">
                    <h3 className="mb-3">Exchange History</h3>
                    {completedExchanges.length === 0 ? (
                        <div className="history-card text-center p-4">
                            <span className="text-muted">Completed 2-way and 3-way exchanges will appear here.</span>
                        </div>
                    ) : (
                        completedExchanges.map((ex) => (
                            <div className="history-card border rounded-4 p-3 mb-2 text-start d-flex justify-content-between align-items-center flex-wrap gap-2 bg-white shadow-sm" key={ex._id}>
                                <div>
                                    <strong className="text-dark d-block mb-1">{ex.displayTitle}</strong>
                                    <div className="small text-muted">
                                        Partners: {ex.otherParticipants.map((p) => p.fullName || "User").join(", ")}
                                    </div>
                                </div>
                                <span className="badge bg-success rounded-pill px-3 py-2">✅ {ex.status}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* LEAVE REVIEW MODAL */}
            {showReviewModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content text-start rounded-4 shadow border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">⭐ Write a Review</h5>
                                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
                            </div>
                            <form onSubmit={handleReviewPrompt}>

                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Select Completed Exchange:</label>
                                        <select
                                            className="form-select rounded-3"
                                            value={selectedExchangeIndex}
                                            onChange={(e) => handleExchangeSelect(e.target.value)}
                                            required
                                        >
                                            {completedExchanges.map((ex, i) => (
                                                <option key={ex._id} value={i}>
                                                    {ex.displayTitle}
                                                </option>
                                            ))}


                                        </select>
                                    </div>

                                    {selectedEx && selectedEx.otherParticipants?.length > 1 && (
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Select Participant to Review:</label>
                                            <select
                                                className="form-select rounded-3"
                                                value={selectedRevieweeId}
                                                onChange={(e) => setSelectedRevieweeId(e.target.value)}
                                                required
                                            >
                                                {selectedEx.otherParticipants.map((part) => (
                                                    <option key={part._id || part} value={part._id || part}>
                                                        {part.fullName || "Participant"}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Rating (1 to 5 stars):</label>
                                        <select
                                            className="form-select rounded-3"
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
                                            className="form-control rounded-3"
                                            rows="3"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Great exchange experience! Item was in excellent condition."
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary rounded-pill px-4"
                                        onClick={() => setShowReviewModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold">
                                        Submit Review
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* SUBMIT REVIEW CONFIRMATION MODAL */}
            {showConfirmModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1060 }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 shadow border-0 text-center p-4">
                            <div className="modal-body">
                                <div className="fs-1 mb-2">❓</div>
                                <h4 className="fw-bold mb-3">Post Review Confirmation</h4>
                                <p className="text-secondary mb-3">
                                    Are you sure you want to post this <strong>{rating}-Star</strong> review for{" "}
                                    <strong>
                                        {completedExchanges[selectedExchangeIndex]?.otherParticipants?.find(
                                            (p) => (p._id || p)?.toString() === selectedRevieweeId
                                        )?.fullName || "Participant"}
                                    </strong>?
                                </p>
                                {comment && (
                                    <div className="p-3 bg-light rounded-3 text-start mb-4 fst-italic text-dark small border">
                                        "{comment}"
                                    </div>
                                )}
                                <div className="d-flex justify-content-center gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary rounded-pill px-4"
                                        onClick={() => setShowConfirmModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
                                        onClick={handleConfirmSubmit}
                                        disabled={reviewSubmitting}
                                    >
                                        {reviewSubmitting ? "Submitting..." : "Confirm & Post Review"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* POP-UP ALERT MODAL */}
            {popupModal.show && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 shadow border-0 text-center p-3">
                            <div className="modal-body">
                                <div className="fs-1 mb-2">
                                    {popupModal.isSuccess ? "🎉" : "ℹ️"}
                                </div>
                                <h4 className="fw-bold mb-2">{popupModal.title}</h4>
                                <p className="text-secondary mb-4">{popupModal.message}</p>
                                <button
                                    className={`btn ${popupModal.isSuccess ? "btn-success" : "btn-primary"} rounded-pill px-5 fw-bold`}
                                    onClick={() => setPopupModal({ show: false, title: "", message: "", isSuccess: true })}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}



