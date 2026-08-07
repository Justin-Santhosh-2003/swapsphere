import { Link } from "react-router-dom";

import "./ListingCard.css";

export default function ListingCard({ listing }) {

  return (

    <div className="listing-card">

      {/* IMAGE AREA */}

      <div className="listing-image">

        {

          listing.images && listing.images.length > 0

            ? (

              <img

                src={listing.images[0]}

                alt={listing.title}

                className="img-fluid"

              />

            )

            : "📦"

        }

      </div>

      {/* DETAILS */}

      <div className="listing-content">

        <h5>

          {listing.title}

        </h5>

        <p className="listing-category">

          {listing.categoryId?.name}

        </p>

        <p>

          Condition:

          <span>

            {" "}

            {listing.condition}

          </span>

        </p>

        <p>

          Owner:

          <span>

            {" "}

            {listing.ownerId?.fullName}

          </span>

        </p>

        <Link

          to={`/item/${listing._id}`}

          className="btn btn-success w-100"

        >

          View Details

        </Link>

      </div>

    </div>

  );

}