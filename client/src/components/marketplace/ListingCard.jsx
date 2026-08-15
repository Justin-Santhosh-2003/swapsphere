import { Link } from "react-router-dom";
import { isMediaVideo } from "../../utils/mediaUtils";
import "./ListingCard.css";

export default function ListingCard({ listing }) {
  const images = listing.images || [];

  // Wanted item summary for preview
  const wantedSummary = listing.exchangePreferences && listing.exchangePreferences.length > 0
    ? listing.exchangePreferences
        .map((p) => p.subcategory || p.categoryId?.name)
        .filter(Boolean)
        .slice(0, 2)
        .join(" or ")
    : null;

  // Format condition label
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

  const primaryMedia = images[0] || "";
  const isPrimaryVideo = isMediaVideo(primaryMedia);

  return (
    <div className="listing-card">
      {/* IMAGE / VIDEO MEDIA AREA */}
      <div className="listing-image position-relative">
        {images.length > 0 ? (
          <>
            {isPrimaryVideo ? (
              <video
                src={primaryMedia}
                className="img-fluid w-100 h-100"
                style={{ objectFit: "cover" }}
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={primaryMedia}
                alt={listing.title}
                className="img-fluid"
              />
            )}

            {images.length > 1 && (
              <span className="badge-photo-count">
                {isPrimaryVideo ? "🎥 Video + " : "🖼️ "}{images.length}
              </span>
            )}
          </>
        ) : (
          <div className="fs-1 text-muted">📦</div>
        )}

        {/* CONDITION BADGE OVERLAY */}
        {listing.condition && (
          <span className="badge-condition">
            {formatCondition(listing.condition)}
          </span>
        )}
      </div>

      {/* DETAILS CONTENT */}
      <div className="listing-content d-flex flex-column flex-grow-1">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <span className="listing-category">
            {listing.categoryId?.icon || "📦"} {listing.categoryId?.name || "General"}
          </span>
          {listing.subcategory && (
            <span className="badge bg-light text-muted border px-2 py-1 small fw-normal">
              {listing.subcategory}
            </span>
          )}
        </div>

        <h5 className="listing-title" title={listing.title}>
          {listing.title}
        </h5>

        {/* WANTED EXCHANGE PREFERENCE PREVIEW */}
        {wantedSummary && (
          <div className="wants-box mb-3">
            <span className="wants-label">🔄 Seeking:</span>
            <span className="wants-text">{wantedSummary}</span>
          </div>
        )}

        <div className="mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
          <div className="owner-info d-flex align-items-center gap-2">
            <div className="owner-avatar">
              {listing.ownerId?.profilePicture ? (
                <img src={listing.ownerId.profilePicture} alt={listing.ownerId?.fullName} />
              ) : (
                <span>{(listing.ownerId?.fullName || "U")[0]}</span>
              )}
            </div>
            <span className="small text-muted fw-semibold text-truncate" style={{ maxWidth: "120px" }}>
              {listing.ownerId?.fullName || "Member"}
            </span>
          </div>

          <Link
            to={`/item/${listing._id}`}
            className="btn btn-sm btn-success px-3 rounded-pill fw-semibold"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}