import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import API from "../api/axios";
import { getMyExchangeRequests, respondToExchangeRequest, cancelExchangeRequest } from "../api/exchangeRequestApi";
import { getMyExchangeRooms, respondToThreeWayProposal } from "../api/exchangeRoomApi";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [listings, setListings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [threeWayRooms, setThreeWayRooms] = useState([]);
    const [suggestionCount, setSuggestionCount] = useState(0);
    const [requestTab, setRequestTab] = useState("received"); // "received" | "sent"
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMessage, setActionMessage] = useState("");

    const [deletingId, setDeletingId] = useState(null);
    const [listingToDelete, setListingToDelete] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [requestToCancel, setRequestToCancel] = useState(null);

    // Bug #1 fix: normalise user ID — API returns _id, JWT returns id
    const myId = user?._id?.toString() || user?.id?.toString();

    // =========================================
    // FETCH DASHBOARD DATA
    // =========================================
    const fetchDashboardData = useCallback(async () => {
        try {
            const [listingsRes, requestsRes, suggestionsRes, roomsRes] = await Promise.all([
                API.get("/items/my-items"),
                getMyExchangeRequests("all"),
                API.get("/suggestions").catch(() => ({ data: { directMatches: [], threeWayMatches: [] } })),
                getMyExchangeRooms().catch(() => ({ data: { rooms: [] } }))
            ]);

            setListings(listingsRes.data.items || []);
            setRequests(requestsRes.data.requests || []);
            setThreeWayRooms(roomsRes.data.rooms || []);
            // Bug #11 fix: real suggestion count
            const direct = suggestionsRes.data.directMatches?.length || 0;
            const threeWay = suggestionsRes.data.threeWayMatches?.length || 0;
            setSuggestionCount(direct + threeWay);
        } catch (err) {
            console.error("Failed to load dashboard data:", err);
            setError(err.response?.data?.message || "Unable to load dashboard.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // =========================================
    // RESPOND TO REQUEST (ACCEPT / REJECT)
    // =========================================
    const handleRespond = async (requestId, status) => {
        try {
            setActionMessage("");
            setErrorMessage("");
            const res = await respondToExchangeRequest(requestId, status);
            setActionMessage(res.data.message);
            fetchDashboardData();
        } catch (err) {
            console.error("Failed to respond to request:", err);
            setErrorMessage(err.response?.data?.message || "Failed to respond.");
        }
    };

    // =========================================
    // CANCEL REQUEST
    // =========================================
    const confirmCancelRequest = (req) => {
        setRequestToCancel(req);
    };

    const handleCancelRequest = async () => {
        if (!requestToCancel) return;
        try {
            setActionMessage("");
            setErrorMessage("");
            const res = await cancelExchangeRequest(requestToCancel._id);
            setActionMessage(res.data.message);
            setRequestToCancel(null);
            fetchDashboardData();
        } catch (err) {
            console.error("Failed to cancel request:", err);
            setErrorMessage(err.response?.data?.message || "Failed to cancel request.");
            setRequestToCancel(null);
        }
    };

    // =========================================
    // DELETE LISTING
    // =========================================
    const openDeleteConfirmation = (listing) => setListingToDelete(listing);
    const closeDeleteConfirmation = () => { if (!deletingId) setListingToDelete(null); };

    const handleDelete = async () => {
        if (!listingToDelete) return;
        const listingId = listingToDelete._id;
        try {
            setDeletingId(listingId);
            await API.delete(`/items/${listingId}`);
            setListings((prev) => prev.filter((item) => item._id !== listingId));
            setListingToDelete(null);
        } catch (err) {
            console.error("Failed to delete listing:", err);
            setError(err.response?.data?.message || "Unable to delete listing.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <section className="dashboard-section">
                <div className="container text-center">
                    <h4>Loading dashboard...</h4>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="dashboard-section">
                <div className="container">
                    <div className="alert alert-danger">{error}</div>
                </div>
            </section>
        );
    }

    // Bug #1 fix: compare using normalised string IDs
    const pendingRequestsCount = requests.filter(
        (r) => r.status === "PENDING" &&
            (r.receiverId?._id?.toString() === myId || r.receiverId?.toString() === myId)
    ).length;

    const receivedRequests = requests.filter(
        (r) => r.receiverId?._id?.toString() === myId || r.receiverId?.toString() === myId
    );
    const sentRequests = requests.filter(
        (r) => r.requesterId?._id?.toString() === myId || r.requesterId?.toString() === myId
    );

    const stats = [
        {
            icon: "📦",
            title: "My Listings",
            value: listings.length,
            text: "Active items"
        },
        {
            icon: "🔄",
            title: "Exchange Requests",
            value: pendingRequestsCount,
            text: "Pending for action"
        },
        {
            icon: "✨",
            title: "Suggestions",
            value: suggestionCount,
            text: "Possible swaps"
        },
        {
            icon: "⭐",
            title: "Trust Score",
            value: user?.averageRating || 0,
            text: "Average rating"
        }
    ];

    const handleRespondThreeWay = async (roomId, status) => {
        try {
            setActionMessage("");
            setErrorMessage("");
            const res = await respondToThreeWayProposal(roomId, status);
            setActionMessage(res.data.message);
            fetchDashboardData();
        } catch (err) {
            console.error("Failed to respond to 3-way proposal:", err);
            setErrorMessage(err.response?.data?.message || "Failed to respond.");
        }
    };

    const pendingThreeWayCount = threeWayRooms.filter(
        (r) => r.exchangeType === "THREE_WAY" &&
            r.status === "PROPOSED" &&
            r.participants.some((p) => (p.userId?._id?.toString() === myId || p.userId?.toString() === myId) && p.status === "PENDING")
    ).length;

    const myThreeWayRooms = threeWayRooms.filter((r) => r.exchangeType === "THREE_WAY");

    return (
        <section className="dashboard-section">
            <div className="container">
                {actionMessage && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                        {actionMessage}
                        <button type="button" className="btn-close" onClick={() => setActionMessage("")}></button>
                    </div>
                )}

                {errorMessage && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        ⚠️ {errorMessage}
                        <button type="button" className="btn-close" onClick={() => setErrorMessage("")}></button>
                    </div>
                )}

                {/* HEADER */}
                <div className="dashboard-header">
                    <h1>
                        Welcome back {user?.fullName ? user.fullName.split(" ")[0] : ""} 👋
                    </h1>
                    <p>Manage your listings, exchanges, and account activity.</p>
                </div>

                {/* STATS */}
                <div className="row g-4">
                    {stats.map((stat, index) => (
                        <div className="col-lg-3 col-md-6" key={index}>
                            <div className="stat-card">
                                <div className="stat-icon">{stat.icon}</div>
                                <h3>{stat.value}</h3>
                                <h5>{stat.title}</h5>
                                <p>{stat.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* QUICK ACTIONS */}
                <div className="dashboard-actions">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                        <Link to="/create-listing" className="btn btn-success">
                            ➕ Create Listing
                        </Link>
                        <Link to="/suggestions" className="btn btn-outline-success">
                            🔍 Find Exchanges
                        </Link>
                        <a href="#requests-section" className="btn btn-outline-primary">
                            📋 View Requests ({pendingRequestsCount + pendingThreeWayCount})
                        </a>
                    </div>
                </div>

                {/* EXCHANGE REQUESTS SECTION */}
                <div className="activity-section mb-5" id="requests-section">
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <h3>Exchange Requests & Rooms</h3>
                        <div className="btn-group">
                            <button
                                className={`btn btn-sm ${requestTab === "received" ? "btn-success" : "btn-outline-success"}`}
                                onClick={() => setRequestTab("received")}
                            >
                                Received ({receivedRequests.length})
                            </button>
                            <button
                                className={`btn btn-sm ${requestTab === "sent" ? "btn-success" : "btn-outline-success"}`}
                                onClick={() => setRequestTab("sent")}
                            >
                                Sent ({sentRequests.length})
                            </button>
                            <button
                                className={`btn btn-sm ${requestTab === "threeway" ? "btn-success" : "btn-outline-primary"}`}
                                onClick={() => setRequestTab("threeway")}
                            >
                                🔄 3-Way ({myThreeWayRooms.length})
                            </button>
                        </div>
                    </div>

                    <div className="activity-box">
                        {requestTab === "threeway" ? (
                            myThreeWayRooms.length === 0 ? (
                                <div className="text-center p-4">
                                    <p className="text-muted mb-0">No 3-Way exchange proposals or rooms active yet.</p>
                                    <Link to="/suggestions" className="btn btn-sm btn-outline-success mt-2">Find 3-Way Matches →</Link>
                                </div>
                            ) : (
                                myThreeWayRooms.map((room) => {
                                    const myPart = room.participants.find(p => p.userId?._id?.toString() === myId || p.userId?.toString() === myId);
                                    const acceptedCount = room.participants.filter(p => p.status === "ACCEPTED").length;
                                    const isPendingMyAction = room.status === "PROPOSED" && myPart?.status === "PENDING";
                                    const myReceivedItem = room.items.find(i => i.toUserId?._id?.toString() === myId || i.toUserId?.toString() === myId);
                                    const myGivenItem = room.items.find(i => i.fromUserId?._id?.toString() === myId || i.fromUserId?.toString() === myId);

                                    return (
                                        <div className="activity-item p-3 border-bottom d-flex align-items-center flex-wrap gap-3" key={room._id}>
                                            <span className="fs-3">🔄</span>
                                            <div className="flex-grow-1">
                                                <strong>3-Way Exchange Ring ({acceptedCount}/3 Accepted)</strong>
                                                <div className="small text-muted mt-1">
                                                    You give: <strong>{myGivenItem?.itemId?.title}</strong> ➔ Receive: <strong>{myReceivedItem?.itemId?.title}</strong>
                                                </div>
                                                <div className="d-flex gap-2 mt-2">
                                                    <span className={`badge ${room.status === 'ACTIVE' ? 'bg-success' : room.status === 'PROPOSED' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                        {room.status === 'PROPOSED' ? `Pending Approvals (${acceptedCount}/3)` : room.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-2">
                                                {isPendingMyAction && (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleRespondThreeWay(room._id, "ACCEPTED")}
                                                        >
                                                            Accept 3-Way Swap
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleRespondThreeWay(room._id, "REJECTED")}
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {room.status === "ACTIVE" && (
                                                    <Link
                                                        to={`/exchange-room/${room._id}`}
                                                        className="btn btn-sm btn-success fw-bold"
                                                    >
                                                        🤝 Enter 3-Way Exchange Room
                                                    </Link>
                                                )}
                                                {room.status === "PROPOSED" && !isPendingMyAction && (
                                                    <span className="badge bg-info text-dark p-2">Waiting for Counterparties ({acceptedCount}/3)</span>
                                                )}
                                                {room.status === "COMPLETED" && (
                                                    <span className="badge bg-secondary p-2">✅ Completed</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )
                        ) : requestTab === "received" ? (
                            receivedRequests.length === 0 ? (
                                <div className="text-center p-4">
                                    <p className="text-muted mb-0">No received exchange requests yet.</p>
                                </div>
                            ) : (
                                receivedRequests.map((req) => (
                                    <div className="activity-item p-3 border-bottom d-flex align-items-center flex-wrap gap-3" key={req._id}>
                                        <span className="fs-3">🔄</span>
                                        <div className="flex-grow-1">
                                            <strong>From: {req.requesterId?.fullName}</strong>
                                            <div className="small text-muted mt-1">
                                                They offer: <strong>{req.offeredItemId?.title}</strong> for your <strong>{req.requestedItemId?.title}</strong>
                                            </div>
                                            {req.note && <div className="small fst-italic text-secondary mt-1">"{req.note}"</div>}
                                            <span className={`badge mt-2 ${req.status === 'PENDING' ? 'bg-warning text-dark' : req.status === 'ACCEPTED' ? 'bg-success' : 'bg-secondary'}`}>
                                                {req.status}
                                            </span>
                                        </div>

                                        <div className="d-flex gap-2">
                                            {req.status === "PENDING" && (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleRespond(req._id, "ACCEPTED")}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleRespond(req._id, "REJECTED")}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {req.status === "ACCEPTED" && (
                                                <Link
                                                    to={`/exchange-room/${req._id}`}
                                                    className="btn btn-sm btn-success"
                                                >
                                                    🤝 Go to Exchange Room
                                                </Link>
                                            )}
                                            {req.status === "COMPLETED" && (
                                                <span className="badge bg-secondary p-2">✅ Completed</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            sentRequests.length === 0 ? (
                                <div className="text-center p-4">
                                    <p className="text-muted mb-0">You haven't sent any exchange requests yet.</p>
                                </div>
                            ) : (
                                sentRequests.map((req) => (
                                    <div className="activity-item p-3 border-bottom d-flex align-items-center flex-wrap gap-3" key={req._id}>
                                        <span className="fs-3">📤</span>
                                        <div className="flex-grow-1">
                                            <strong>To: {req.receiverId?.fullName}</strong>
                                            <div className="small text-muted mt-1">
                                                You offered: <strong>{req.offeredItemId?.title}</strong> for <strong>{req.requestedItemId?.title}</strong>
                                            </div>
                                            <span className={`badge mt-2 ${req.status === 'PENDING' ? 'bg-warning text-dark' : req.status === 'ACCEPTED' ? 'bg-success' : 'bg-secondary'}`}>
                                                {req.status}
                                            </span>
                                        </div>

                                        {req.status === "PENDING" && (
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => confirmCancelRequest(req)}
                                            >
                                                Cancel Request
                                            </button>
                                        )}
                                        {req.status === "ACCEPTED" && (
                                            <Link
                                                to={`/exchange-room/${req._id}`}
                                                className="btn btn-sm btn-success"
                                            >
                                                🤝 Go to Exchange Room
                                            </Link>
                                        )}
                                        {req.status === "COMPLETED" && (
                                            <span className="badge bg-secondary p-2">✅ Completed</span>
                                        )}
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>

                {/* MY LISTINGS */}
                <div className="activity-section">
                    <h3>My Listings</h3>
                    <div className="activity-box">
                        {listings.length === 0 ? (
                            <div className="text-center p-4">
                                <p>You haven't created any listings yet.</p>
                                <Link to="/create-listing" className="btn btn-success">
                                    Create Your First Listing
                                </Link>
                            </div>
                        ) : (
                            listings.map((listing) => (
                                <div className="activity-item" key={listing._id}>
                                    <span className="activity-icon">
                                        {listing.images && listing.images.length > 0 ? (
                                            <img
                                                src={listing.images[0]}
                                                alt={listing.title}
                                                style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                                            />
                                        ) : (
                                            "📦"
                                        )}
                                    </span>

                                    <div>
                                        <p>{listing.title}</p>
                                        <small>
                                            {listing.categoryId?.name || "Category"} • {listing.subcategory} • {listing.condition}
                                        </small>
                                    </div>

                                    <div className="d-flex gap-2 ms-auto">
                                        <Link to={`/item/${listing._id}`} className="btn btn-sm btn-outline-success">
                                            View
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn-sm listing-edit-btn"
                                            onClick={() => navigate(`/create-listing/${listing._id}`)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm listing-delete-btn"
                                            onClick={() => openDeleteConfirmation(listing)}
                                            disabled={deletingId === listing._id}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {listingToDelete && (
                <div className="delete-modal-backdrop" onClick={closeDeleteConfirmation}>
                    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-icon">🗑️</div>
                        <h3>Delete Listing?</h3>
                        <p>Are you sure you want to delete <strong>{listingToDelete.title}</strong>?</p>
                        <small>This listing will no longer appear in your active listings.</small>
                        <div className="delete-modal-actions">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={closeDeleteConfirmation}
                                disabled={Boolean(deletingId)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDelete}
                                disabled={Boolean(deletingId)}
                            >
                                {deletingId ? "Deleting..." : "Delete Listing"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* CANCEL REQUEST CONFIRMATION MODAL */}
            {requestToCancel && (
                <div className="delete-modal-backdrop" onClick={() => setRequestToCancel(null)}>
                    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-icon">🚫</div>
                        <h3>Cancel Exchange Request?</h3>
                        <p>Are you sure you want to cancel your request for <strong>{requestToCancel.requestedItemId?.title}</strong>?</p>
                        <small>This request will be marked as cancelled.</small>
                        <div className="delete-modal-actions">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setRequestToCancel(null)}
                            >
                                Keep Request
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleCancelRequest}
                            >
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
