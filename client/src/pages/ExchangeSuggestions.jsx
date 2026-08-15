import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSuggestions } from "../api/suggestionApi";
import { sendExchangeRequest } from "../api/exchangeRequestApi";
import { initiateThreeWayRoom } from "../api/exchangeRoomApi";
import "./ExchangeSuggestions.css";

export default function ExchangeSuggestions() {
  const navigate = useNavigate();
  const [directMatches, setDirectMatches] = useState([]);
  const [threeWayMatches, setThreeWayMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await getSuggestions();
      setDirectMatches(res.data.directMatches || []);
      setThreeWayMatches(res.data.threeWayMatches || []);
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setError(err.response?.data?.message || "Failed to load suggestions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleProposeDirectSwap = async (myItem, otherItem) => {
    try {
      setActionMessage("");
      await sendExchangeRequest({
        offeredItemId: myItem._id,
        requestedItemId: otherItem._id,
        note: `Swap proposal for ${otherItem.title}`
      });
      setActionMessage(`Exchange request sent to ${otherItem.owner?.fullName || "owner"} for ${otherItem.title}! 🎉`);
    } catch (err) {
      console.error("Propose swap error:", err);
      setError(err.response?.data?.message || "Failed to send exchange request.");
    }
  };

  const handleInitiateThreeWaySwap = async (match) => {
    try {
      setActionMessage("");
      setError("");
      const res = await initiateThreeWayRoom({
        itemAId: match.itemA._id,
        itemBId: match.itemB._id,
        itemCId: match.itemC._id
      });
      const roomId = res.data.room?._id;
      if (roomId) {
        navigate(`/exchange-room/${roomId}`);
      } else {
        setActionMessage("3-Way Exchange proposal initiated! Waiting for User B & User C to accept. 🎉");
      }
    } catch (err) {
      console.error("Initiate 3-way swap error:", err);
      setError(err.response?.data?.message || "Failed to initiate 3-way exchange proposal.");
    }
  };

  return (
    <section className="suggestions-section">
      <div className="container">
        {/* HERO HEADER */}
        <div className="suggestions-header-card text-center mb-5 p-4 rounded-4 shadow-sm bg-white border">
          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-bold mb-2">
            RECOMMENDED FOR YOU
          </span>
          <h1 className="fw-bold display-6 mb-2">Exchange Suggestions</h1>
          <p className="text-muted max-width-600 mx-auto mb-4">
            Discover mutual 2-way swaps and 3-way exchanges based on your item preferences.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <span className="badge bg-success px-3 py-2 rounded-pill fs-6">
              ⚡ Direct Match: {directMatches.length}
            </span>
            <span className="badge bg-primary px-3 py-2 rounded-pill fs-6">
              🔄 3-Way Exchange: {threeWayMatches.length}
            </span>
          </div>
        </div>

        {actionMessage && (
          <div className="alert alert-success alert-dismissible fade show rounded-3 shadow-sm mb-4" role="alert">
            <strong>Success!</strong> {actionMessage}
            <button type="button" className="btn-close" onClick={() => setActionMessage("")}></button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success mb-3" style={{ width: "3rem", height: "3rem" }} role="status"></div>
            <h4 className="fw-bold text-dark">Finding best exchange matches...</h4>
            <p className="text-muted small">Comparing item categories and exchange preferences...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger rounded-3 shadow-sm">{error}</div>
        ) : (
          <>
            {/* DIRECT MATCHES */}
            <div className="suggestion-block mb-5">
              <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <h2 className="fw-bold m-0 text-dark">
                  ⚡ Direct Match: {directMatches.length}
                </h2>
                <span className="small text-muted">Mutual category & preference alignment</span>
              </div>

              {directMatches.length === 0 ? (
                <div className="p-5 text-center border rounded-4 bg-white shadow-sm">
                  <div className="fs-1 mb-2">🤝</div>
                  <h4 className="fw-bold text-dark">No Direct Matches Found</h4>
                  <p className="text-muted mb-2">
                    Make sure you've added <strong>Wanted Exchange Preferences</strong> when listing items!
                  </p>
                  <Link to="/create-listing" className="btn btn-outline-success btn-sm rounded-pill px-4 mt-2">
                    Add New Listing with Preferences →
                  </Link>
                </div>
              ) : (
                directMatches.map((match, index) => (
                  <div className="direct-match-card bg-white border rounded-4 p-4 mb-4 shadow-sm" key={index}>
                    <div className="row align-items-center g-3">
                      {/* MY ITEM */}
                      <div className="col-md-5">
                        <div className="match-item-box d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                          <div className="item-thumb-wrapper position-relative">
                            <img
                              src={match.myItem.images && match.myItem.images[0] ? match.myItem.images[0] : "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400"}
                              alt={match.myItem.title}
                              className="item-thumb rounded-3"
                            />
                            <span className="badge bg-secondary position-absolute top-0 start-0 m-1 small">You</span>
                          </div>
                          <div>
                            <span className="badge bg-success bg-opacity-10 text-success mb-1 small">
                              {match.myItem.condition || "EXCELLENT"}
                            </span>
                            <h5 className="fw-bold mb-1 text-truncate" style={{ maxWidth: "200px" }}>{match.myItem.title}</h5>
                            <p className="text-muted small mb-0">Your Item</p>
                          </div>
                        </div>
                      </div>

                      {/* SWAP INDICATOR */}
                      <div className="col-md-2 text-center my-2 my-md-0">
                        <div className="swap-badge-circle mx-auto shadow-sm">
                          <span className="fs-4">⚡</span>
                        </div>
                        <span className="badge bg-success bg-opacity-10 text-success mt-2 small fw-bold">DIRECT MATCH</span>
                      </div>

                      {/* OTHER USER ITEM */}
                      <div className="col-md-5">
                        <div className="match-item-box d-flex align-items-center justify-content-between gap-3 p-3 bg-light rounded-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="item-thumb-wrapper">
                              <img
                                src={match.otherItem.images && match.otherItem.images[0] ? match.otherItem.images[0] : "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400"}
                                alt={match.otherItem.title}
                                className="item-thumb rounded-3"
                              />
                            </div>
                            <div>
                              <span className="badge bg-primary bg-opacity-10 text-primary mb-1 small">
                                Owner: {match.otherItem.owner?.fullName || "User"}
                              </span>
                              <h5 className="fw-bold mb-1 text-truncate" style={{ maxWidth: "180px" }}>{match.otherItem.title}</h5>
                              <p className="text-muted small mb-0">Offered for Barter</p>
                            </div>
                          </div>

                          <div className="d-flex flex-column gap-2">
                            <button
                              className="btn btn-success btn-sm rounded-pill px-3 fw-semibold text-nowrap"
                              onClick={() => handleProposeDirectSwap(match.myItem, match.otherItem)}
                            >
                              ⚡ Propose Swap
                            </button>
                            <Link to={`/item/${match.otherItem._id}`} className="btn btn-outline-secondary btn-sm rounded-pill text-nowrap">
                              👁️ View Item
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* THREE-WAY EXCHANGES */}
            <div className="suggestion-block">
              <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <h2 className="fw-bold m-0 text-dark">
                  🔄 3-Way Exchange: {threeWayMatches.length}
                </h2>
                <span className="small text-muted">Exchange matching 3 users</span>
              </div>

              {threeWayMatches.length === 0 ? (
                <div className="p-5 text-center border rounded-4 bg-white shadow-sm">
                  <div className="fs-1 mb-2">🔄</div>
                  <h4 className="fw-bold text-dark">No 3-Way Exchanges Found</h4>
                  <p className="text-muted mb-0">
                    3-Way exchanges appear automatically when 3 users match each other's preferences!
                  </p>
                </div>
              ) : (
                threeWayMatches.map((match, index) => (
                  <div className="three-way-card bg-white border rounded-4 p-4 mb-4 shadow-sm" key={index}>
                    <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                      <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill fw-bold">
                        🔄 3-WAY EXCHANGE #{index + 1}
                      </span>
                      <button
                        className="btn btn-success btn-sm rounded-pill px-4 fw-bold"
                        onClick={() => handleInitiateThreeWaySwap(match)}
                      >
                        ⚡ Initiate 3-Way Exchange
                      </button>
                    </div>

                    <div className="row g-3 align-items-center text-center">
                      {/* ITEM A (YOU) */}
                      <div className="col-md-3">
                        <div className="cycle-node-box p-3 bg-light rounded-4 border h-100">
                          <span className="badge bg-secondary mb-2">STEP 1: YOU GIVE</span>
                          <img
                            src={match.itemA.images && match.itemA.images[0] ? match.itemA.images[0] : "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400"}
                            alt={match.itemA.title}
                            className="cycle-thumb rounded-3 mb-2"
                          />
                          <h6 className="fw-bold text-dark mb-1 text-truncate">{match.itemA.title}</h6>
                          <p className="text-muted small mb-0">Your Item</p>
                        </div>
                      </div>

                      {/* ARROW 1 */}
                      <div className="col-md-1 d-flex justify-content-center">
                        <div className="cycle-arrow-circle">➔</div>
                      </div>

                      {/* ITEM B */}
                      <div className="col-md-3">
                        <div className="cycle-node-box p-3 bg-light rounded-4 border h-100">
                          <span className="badge bg-info text-dark mb-2">STEP 2: RECEIVE FROM</span>
                          <img
                            src={match.itemB.images && match.itemB.images[0] ? match.itemB.images[0] : "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400"}
                            alt={match.itemB.title}
                            className="cycle-thumb rounded-3 mb-2"
                          />
                          <h6 className="fw-bold text-dark mb-1 text-truncate">{match.itemB.title}</h6>
                          <p className="text-primary small mb-0 fw-semibold">{match.itemB.owner?.fullName || "User B"}</p>
                        </div>
                      </div>

                      {/* ARROW 2 */}
                      <div className="col-md-1 d-flex justify-content-center">
                        <div className="cycle-arrow-circle">➔</div>
                      </div>

                      {/* ITEM C */}
                      <div className="col-md-3">
                        <div className="cycle-node-box p-3 bg-light rounded-4 border h-100">
                          <span className="badge bg-success mb-2">STEP 3: USER C GETS YOURS</span>
                          <img
                            src={match.itemC.images && match.itemC.images[0] ? match.itemC.images[0] : "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400"}
                            alt={match.itemC.title}
                            className="cycle-thumb rounded-3 mb-2"
                          />
                          <h6 className="fw-bold text-dark mb-1 text-truncate">{match.itemC.title}</h6>
                          <p className="text-success small mb-0 fw-semibold">{match.itemC.owner?.fullName || "User C"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="cycle-footer text-center mt-3 pt-3 border-top">
                      <span className="badge bg-success bg-opacity-10 text-success px-4 py-2 rounded-pill fw-semibold">
                        3-Way Exchange Ring: You give {match.itemA.title} → {match.itemB.owner?.fullName} gives {match.itemB.title} → {match.itemC.owner?.fullName} gives {match.itemC.title} → You!
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}