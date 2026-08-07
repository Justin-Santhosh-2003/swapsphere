import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getItemById } from "../api/itemApi";
import "./ItemDetails.css";

export default function ItemDetails() {

  const { id } = useParams();

  const [item, setItem] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    const fetchItem = async () => {

      try {

        setLoading(true);

        const res = await getItemById(id);

        setItem(res.data.item);

      }

      catch (err) {

        console.error(err);

        setError("Item not found.");

      }

      finally {

        setLoading(false);

      }

    };

    fetchItem();

  }, [id]);

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

  return (

    <section className="item-details-section">

      <div className="container">

        <div className="item-details-card">

          <div className="item-image">

            {
              item.images && item.images.length > 0
                ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="img-fluid"
                  />
                )
                : "📦"
            }

          </div>

          <div className="item-information">

            <span className="item-category">

              {item.categoryId?.name}

              {" > "}

              {item.subcategory}

            </span>

            <h1>

              {item.title}

            </h1>

            <p className="item-description">

              {item.description}

            </p>

            <p>

              <strong>Condition:</strong>

              {" "}

              {item.condition}

            </p>

            <div className="owner-box">

              <h5>

                Owner

              </h5>

              <p>

                {item.ownerId?.fullName}

              </p>

              <div className="trust-info">

                <span>

                  ⭐ {item.ownerId?.averageRating ?? 0}

                </span>

                <span>

                  🔄 {item.ownerId?.totalCompletedExchanges ?? 0} Exchanges

                </span>

              </div>

            </div>

            <div className="exchange-box">

              <h5>

                Exchange Preferences

              </h5>

              <div className="wanted-items">

                {

                  item.exchangePreferences?.length > 0

                    ? (

                      item.exchangePreferences
                        .sort((a, b) => a.priority - b.priority)
                        .map((pref, index) => (

                          <span key={index}>

                            {pref.categoryId?.name}

                            {" - "}

                            {pref.subcategory}

                          </span>

                        ))

                    )

                    : (

                      <span>

                        No preferences specified

                      </span>

                    )

                }

              </div>

            </div>

            {

              item.videos && item.videos.length > 0 && (

                <div className="exchange-box">

                  <h5>

                    Videos

                  </h5>

                  {

                    item.videos.map((video, index) => (

                      <video

                        key={index}

                        src={video}

                        controls

                        width="250"

                      />

                    ))

                  }

                </div>

              )

            }

            <button className="exchange-button">

              Request Exchange

            </button>

          </div>

        </div>

      </div>

    </section>

  );

}