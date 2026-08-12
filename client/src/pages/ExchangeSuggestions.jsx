import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSuggestions } from "../api/suggestionApi";
import { sendExchangeRequest } from "../api/exchangeRequestApi";
import "./ExchangeSuggestions.css";

export default function ExchangeSuggestions() {
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
        note: `Smart match swap proposal for ${otherItem.title}`
      });
      setActionMessage(`Exchange request sent to ${otherItem.owner?.fullName || "owner"} for ${otherItem.title}! 🎉`);
    } catch (err) {
      console.error("Propose swap error:", err);
      alert(err.response?.data?.message || "Failed to send exchange request.");
    }
  };

  return (
    <section className="suggestions-section">
      <div className="container">
        <div className="suggestions-header">
          <span>SMART MATCHING ENGINE</span>
          <h1>Exchange Suggestions</h1>
          <p>Automated mutual exchange matching based on your item preferences.</p>
        </div>

        {actionMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {actionMessage}
            <button type="button" className="btn-close" onClick={() => setActionMessage("")}></button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <h3>Finding intelligent exchange matches...</h3>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <>
            {/* DIRECT EXCHANGES */}
            <div className="suggestion-block mb-5">
              <h2>Direct 2-Way Matches</h2>

              {directMatches.length === 0 ? (
                <div className="p-4 text-center border rounded bg-light">
                  <p className="mb-1 text-muted">No direct 2-way matches found currently.</p>
                  <small className="text-secondary">
                    Tip: Make sure you've added <strong>Exchange Preferences</strong> when creating or editing your listings!
                  </small>
                </div>
              ) : (
                directMatches.map((match, index) => (
                  <div className="direct-match border rounded p-4 mb-3" key={index}>
                    <div className="exchange-user text-center">
                      <div className="item-icon mb-2">
                        {match.myItem.images && match.myItem.images[0] ? (
                          <img src={match.myItem.images[0]} alt={match.myItem.title} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
                        ) : (
                          "📦"
                        )}
                      </div>
                      <h4>{match.myItem.title}</h4>
                      <p className="text-muted small">You (Your Item)</p>
                    </div>

                    <div className="exchange-arrow text-success fs-2 fw-bold">↔</div>

                    <div className="exchange-user text-center">
                      <div className="item-icon mb-2">
                        {match.otherItem.images && match.otherItem.images[0] ? (
                          <img src={match.otherItem.images[0]} alt={match.otherItem.title} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
                        ) : (
                          "🎁"
                        )}
                      </div>
                      <h4>{match.otherItem.title}</h4>
                      <p className="text-muted small">Owner: {match.otherItem.owner?.fullName || "User"}</p>
                    </div>

                    <div className="ms-auto text-center mt-3 mt-md-0">
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleProposeDirectSwap(match.myItem, match.otherItem)}
                      >
                        ⚡ Propose Swap
                      </button>
                      <Link to={`/item/${match.otherItem._id}`} className="btn btn-outline-secondary btn-sm">
                        View Item
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* THREE-WAY EXCHANGES */}
            <div className="suggestion-block">
              <h2>Three-Way Circular Matches</h2>

              {threeWayMatches.length === 0 ? (
                <div className="p-4 text-center border rounded bg-light">
                  <p className="mb-0 text-muted">No 3-way circular matches found currently.</p>
                </div>
              ) : (
                threeWayMatches.map((match, index) => (
                  <div className="three-way border rounded p-4 mb-3" key={index}>
                    <div className="cycle-card text-center">
                      <span>📦</span>
                      <h4>{match.itemA.title}</h4>
                      <p>You</p>
                    </div>

                    <div className="cycle-arrow text-success fs-3">↓</div>

                    <div className="cycle-card text-center">
                      <span>🎁</span>
                      <h4>{match.itemB.title}</h4>
                      <p>{match.itemB.owner?.fullName}</p>
                    </div>

                    <div className="cycle-arrow text-success fs-3">↓</div>

                    <div className="cycle-card text-center">
                      <span>✨</span>
                      <h4>{match.itemC.title}</h4>
                      <p>{match.itemC.owner?.fullName}</p>
                    </div>

                    <div className="back-arrow text-success small fw-bold">
                      ↺ Completes cycle back to You
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