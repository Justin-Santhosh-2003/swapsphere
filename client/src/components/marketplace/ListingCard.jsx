import "./ListingCard.css";

export default function ListingCard({ listing }) {

  return (

    <div className="listing-card">


      <div className="listing-image">

        {listing.image}

      </div>



      <div className="listing-body">


        <span className="listing-category">
          {listing.category}
        </span>



        <h4>
          {listing.title}
        </h4>



        <p className="listing-owner">
          Owned by {listing.owner}
        </p>



        <div className="listing-wants">

          <strong>
            Wants:
          </strong>

          <p>
            {listing.wants}
          </p>

        </div>



        <button className="listing-button">
          View Details
        </button>


      </div>


    </div>

  );

}