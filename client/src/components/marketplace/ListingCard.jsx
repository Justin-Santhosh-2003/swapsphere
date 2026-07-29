import { Link } from "react-router-dom";
import "./ListingCard.css";

export default function ListingCard({ listing }) {

  return (

    <div className="listing-card">


      {/* IMAGE AREA */}

      <div className="listing-image">

        {listing.image}

      </div>





      {/* DETAILS */}

      <div className="listing-content">


        <h5>
          {listing.title}
        </h5>



        <p className="listing-category">

          {listing.category}
          {" • "}
          {listing.subCategory}

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
            {listing.owner}
          </span>

        </p>







        <Link
          to={`/item/${listing.id}`}
          className="btn btn-success w-100"
        >

          View Details

        </Link>





      </div>


    </div>

  );

}