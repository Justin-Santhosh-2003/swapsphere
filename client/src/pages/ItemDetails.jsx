import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getItemById, getMyItems } from "../api/itemApi";
import { sendExchangeRequest } from "../api/exchangeRequestApi";
import { useAuth } from "../context/AuthContext";
import { isMediaVideo } from "../utils/mediaUtils";
import "./ItemDetails.css";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Exchange Request Modal state
  const [showModal, setShowModal] = useState(false);
  const [myItems, setMyItems] = useState([]);
  const [selectedOfferedItem, setSelectedOfferedItem] = useState("");
  const [note, setNote] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState("");
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await getItemById(id);
        setItem(res.data.item);
      } catch (err) {
        console.error(err);
        setError("Item not found or unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleOpenRequestModal = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user && item && (item.ownerId?._id === user._id || item.ownerId === user._id)) {
      setError("This is your listing! You cannot request an exchange for your own item.");
      return;
    }

    try {
      const res = await getMyItems();
      const availableItems = (res.data.items || []).filter(
        (i) => i.status === "AVAILABLE"
      );
      setMyItems(availableItems);
      if (availableItems.length > 0) {
        setSelectedOfferedItem(availableItems[0]._id);
      }
      setShowModal(true);
    } catch (err) {
      console.error("Failed to load user items:", err);
      setError("Unable to fetch your listings for exchange.");
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedOfferedItem) {
      setRequestError("Please select an item to offer.");
      return;
    }

    try {
      setRequestLoading(true);
      setRequestError("");
      setRequestSuccess("");

      await sendExchangeRequest({
        offeredItemId: selectedOfferedItem,
        requestedItemId: item._id,
        note
      });

      setRequestSuccess("Exchange request sent successfully! Redirecting...");
      setTimeout(() => {
        setShowModal(false);
        setRequestSuccess("");
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Exchange request failed:", err);
      setRequestError(err.response?.data?.message || "Failed to send exchange request.");
    } finally {
      setRequestLoading(false);
    }
  };

  const formatCondition = (cond) => {
    switch (cond) {
      case "LIKE_NEW":
        return "Like New";
      case "EXCELLENT":
        return "Excellent";
      case "GOOD":
        return "Good";
      case "FAIR":
        return "Fair";
      case "POOR":
        return "Poor";
      default:
        return cond;
    }
  };

  if (loading) {
    return (
      <section className="item-details-section">
        <div className="container text-center py-5">
          <div className="spinner-border text-success mb-3" role="status"></div>
          <h4 className="text-muted fw-semibold">Loading Item Details...</h4>
        </div>
      </section>
    );
  }

  if (error || !item) {
    return (
      <section className="item-details-section">
        <div className="container text-center py-5">
          <div className="alert alert-danger max-width-500 mx-auto shadow-sm">
            ⚠️ {error || "Item not found."}
          </div>
          <Link to="/marketplace" className="btn btn-success mt-3 rounded-pill">
            ← Return to Marketplace
          </Link>
        </div>
      </section>
    );
  }

  const isOwner = user && (item.ownerId?._id === user._id || item.ownerId === user._id);
  const imagesList = item.images || [];

  return (
    <section className="item-details-section">
      <div className="container">
        <div className="mb-3">
          <Link to="/marketplace" className="text-decoration-none text-success fw-semibold">
            ← Back to Marketplace
          </Link>
        </div>

        <div className="item-details-card shadow-sm">
          {/* LEFT: IMAGE & VIDEO GALLERY & THUMBNAILS */}
          <div className="item-gallery-container d-flex flex-column align-items-center">
            <div className="item-image w-100 position-relative">
              {imagesList.length > 0 ? (
                isMediaVideo(imagesList[activeImageIndex] || imagesList[0]) ? (
                  <video
                    src={imagesList[activeImageIndex] || imagesList[0]}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-100 rounded-4 shadow-sm"
                    style={{ maxHeight: "420px", objectFit: "cover" }}
                  />
                ) : (
                  <img
                    src={imagesList[activeImageIndex] || imagesList[0]}
                    alt={item.title}
                    className="img-fluid rounded-4 shadow-sm"
                  />
                )
              ) : (
                <div className="fs-1 text-center py-5">📦</div>
              )}

              {item.condition && (
                <span className="position-absolute top-0 start-0 m-3 badge bg-white text-success shadow-sm px-3 py-2 rounded-pill fw-bold">
                  ✨ {formatCondition(item.condition)}
                </span>
              )}
            </div>

            {/* THUMBNAIL STRIP FOR MULTIPLE MEDIA FILES */}
            {imagesList.length > 1 && (
              <div className="item-gallery-thumbnails d-flex gap-2 mt-3 flex-wrap justify-content-center">
                {imagesList.map((imgUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`btn p-0 border position-relative ${activeImageIndex === index ? "border-success border-3 scale-105" : "border-1 opacity-75"}`}
                    style={{ width: "72px", height: "72px", overflow: "hidden", borderRadius: "14px", transition: "0.2s" }}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    {isMediaVideo(imgUrl) ? (
                      <>
                        <video
                          src={imgUrl}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <span className="position-absolute top-50 start-50 translate-middle badge bg-dark bg-opacity-75 p-1" style={{ fontSize: "10px" }}>
                          🎥
                        </span>
                      </>
                    ) : (
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${index + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: ITEM INFORMATION */}
          <div className="item-information flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="item-category badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-semibold">
                {item.categoryId?.icon || "📦"} {item.categoryId?.name}
              </span>
              {item.subcategory && (
                <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill fw-normal">
                  {item.subcategory}
                </span>
              )}
            </div>

            <h1 className="fw-bold mb-3">{item.title}</h1>

            <p className="item-description lead text-secondary fs-6 mb-4">{item.description}</p>

            {/* OWNER TRUST CARD */}
            <div className="owner-box p-3 bg-light rounded-4 border mb-4">
              <h6 className="fw-bold text-dark mb-2">Listed By</h6>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <Link
                  to={`/user/${item.ownerId?._id || item.ownerId}`}
                  className="d-flex align-items-center gap-3 text-decoration-none text-dark"
                >
                  <div className="owner-detail-avatar">
                    {item.ownerId?.profilePicture ? (
                      <img src={item.ownerId.profilePicture} alt={item.ownerId?.fullName} />
                    ) : (
                      <span>{(item.ownerId?.fullName || "U")[0]}</span>
                    )}
                  </div>
                  <div>
                    <h6 className="fw-bold m-0 text-success">{item.ownerId?.fullName}</h6>
                    <small className="text-muted">{item.ownerId?.location || "Member"} · View Profile →</small>
                  </div>
                </Link>

                <div className="trust-info d-flex gap-2">
                  <span className="badge bg-white text-dark border px-3 py-2 rounded-pill shadow-sm">
                    ⭐ {item.ownerId?.averageRating ?? 0} Rating
                  </span>
                  <span className="badge bg-white text-success border px-3 py-2 rounded-pill shadow-sm">
                    🔄 {item.ownerId?.totalCompletedExchanges ?? 0} Swaps
                  </span>
                </div>
              </div>
            </div>

            {/* WANTED EXCHANGE PREFERENCES */}
            <div className="exchange-box p-3 bg-success bg-opacity-10 rounded-4 border border-success border-opacity-25 mb-4">
              <h6 className="fw-bold text-success mb-2">🔄 Seeking in Exchange</h6>
              <div className="wanted-items d-flex flex-wrap gap-2">
                {item.exchangePreferences?.length > 0 ? (
                  item.exchangePreferences
                    .sort((a, b) => a.priority - b.priority)
                    .map((pref, index) => (
                      <span key={index} className="badge bg-white text-dark border shadow-sm px-3 py-2 rounded-pill">
                        <strong className="text-success me-1">Priority {pref.priority}:</strong>
                        {pref.categoryId?.name} {pref.subcategory ? `(${pref.subcategory})` : ""}
                      </span>
                    ))
                ) : (
                  <span className="text-muted small">Open to any reasonable barter offer</span>
                )}
              </div>
            </div>

            {!isOwner ? (
              <button
                className="exchange-button btn btn-success btn-lg w-100 py-3 rounded-4 fw-bold shadow-sm"
                onClick={handleOpenRequestModal}
              >
                ⚡ Propose Exchange Swap
              </button>
            ) : (
              <div className="alert alert-secondary text-center rounded-4 mb-0">
                ℹ️ This is your listing. You can manage or delete it from your <Link to="/dashboard" className="fw-bold text-dark">Dashboard</Link>.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REQUEST EXCHANGE MODAL */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">🔄 Propose Exchange Swap</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  disabled={requestLoading}
                ></button>
              </div>

              <form onSubmit={handleSendRequest}>
                <div className="modal-body">
                  {requestSuccess && <div className="alert alert-success rounded-3">{requestSuccess}</div>}
                  {requestError && <div className="alert alert-danger rounded-3">{requestError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Item You Want:</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={item.title}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Item to Offer in Return:</label>
                    {myItems.length > 0 ? (
                      <select
                        className="form-select rounded-3"
                        value={selectedOfferedItem}
                        onChange={(e) => setSelectedOfferedItem(e.target.value)}
                        required
                      >
                        {myItems.map((myItem) => (
                          <option key={myItem._id} value={myItem._id}>
                            {myItem.title} ({formatCondition(myItem.condition)})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="alert alert-warning mb-0 rounded-3">
                        You have no available items to offer. Please{" "}
                        <Link to="/create-listing" className="fw-bold text-dark">create a listing</Link> first.
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Message / Barter Note (Optional):</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Hi! I'd love to swap my item for yours..."
                    />
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowModal(false)}
                    disabled={requestLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4 fw-semibold"
                    disabled={requestLoading || myItems.length === 0}
                  >
                    {requestLoading ? "Sending..." : "Send Exchange Request"}
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