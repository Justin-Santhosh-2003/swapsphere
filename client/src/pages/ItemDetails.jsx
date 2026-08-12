import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getItemById, getMyItems } from "../api/itemApi";
import { sendExchangeRequest } from "../api/exchangeRequestApi";
import { useAuth } from "../context/AuthContext";
import "./ItemDetails.css";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setError("Item not found.");
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
      alert("This is your listing! You cannot request an exchange for your own item.");
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
      alert("Unable to fetch your listings for exchange.");
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

      setRequestSuccess("Exchange request sent successfully!");
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

  if (loading) {
    return (
      <section className="item-details-section">
        <div className="container text-center py-5">
          <h3>Loading Item...</h3>
        </div>
      </section>
    );
  }

  if (error || !item) {
    return (
      <section className="item-details-section">
        <div className="container text-center py-5">
          <h3>{error}</h3>
        </div>
      </section>
    );
  }

  const isOwner = user && (item.ownerId?._id === user._id || item.ownerId === user._id);

  return (
    <section className="item-details-section">
      <div className="container">
        <div className="item-details-card">
          <div className="item-image">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="img-fluid rounded"
              />
            ) : (
              <div className="fs-1 text-center py-5">📦</div>
            )}
          </div>

          <div className="item-information">
            <span className="item-category">
              {item.categoryId?.name} {" > "} {item.subcategory}
            </span>

            <h1>{item.title}</h1>

            <p className="item-description">{item.description}</p>

            <p>
              <strong>Condition:</strong> {item.condition}
            </p>

            <div className="owner-box">
              <h5>Owner</h5>
              <p className="fw-semibold mb-1">{item.ownerId?.fullName}</p>
              <div className="trust-info">
                <span>⭐ {item.ownerId?.averageRating ?? 0}</span>
                <span>🔄 {item.ownerId?.totalCompletedExchanges ?? 0} Exchanges</span>
              </div>
            </div>

            <div className="exchange-box">
              <h5>Exchange Preferences</h5>
              <div className="wanted-items">
                {item.exchangePreferences?.length > 0 ? (
                  item.exchangePreferences
                    .sort((a, b) => a.priority - b.priority)
                    .map((pref, index) => (
                      <span key={index} className="badge bg-light text-dark border me-2 mb-2 p-2">
                        Priority {pref.priority}: {pref.categoryId?.name} - {pref.subcategory}
                      </span>
                    ))
                ) : (
                  <span>No preferences specified</span>
                )}
              </div>
            </div>

            {!isOwner ? (
              <button
                className="exchange-button btn btn-success w-100 py-2 fs-5 mt-3"
                onClick={handleOpenRequestModal}
              >
                🔄 Request Exchange
              </button>
            ) : (
              <div className="alert alert-info mt-3 text-center">
                This is your listing.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REQUEST EXCHANGE MODAL */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Propose Exchange</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  disabled={requestLoading}
                ></button>
              </div>

              <form onSubmit={handleSendRequest}>
                <div className="modal-body">
                  {requestSuccess && <div className="alert alert-success">{requestSuccess}</div>}
                  {requestError && <div className="alert alert-danger">{requestError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Item You Want:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.title}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Item to Offer in Return:</label>
                    {myItems.length > 0 ? (
                      <select
                        className="form-select"
                        value={selectedOfferedItem}
                        onChange={(e) => setSelectedOfferedItem(e.target.value)}
                        required
                      >
                        {myItems.map((myItem) => (
                          <option key={myItem._id} value={myItem._id}>
                            {myItem.title} ({myItem.condition})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="alert alert-warning mb-0">
                        You have no available items to offer. Please{" "}
                        <Link to="/create-listing">create a listing</Link> first.
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Message/Note (Optional):</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Hi! I'd love to swap my item for yours..."
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={requestLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-success"
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