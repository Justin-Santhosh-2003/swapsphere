import "./RecentListings.css";

export default function RecentListings() {


  const listings = [

    {
      image: "📷",
      title: "DSLR Camera",
      category: "Electronics",
      owner: "Alex",
      wants: "Looking for Guitar"
    },

    {
      image: "🎸",
      title: "Acoustic Guitar",
      category: "Hobbies",
      owner: "Rahul",
      wants: "Looking for Camera"
    },

    {
      image: "📱",
      title: "Smartphone",
      category: "Electronics",
      owner: "John",
      wants: "Looking for Laptop"
    }


  ];



  return (

    <section className="recent-section">


      <div className="container">


        <div className="recent-header">


          <span className="section-badge">
            RECENT LISTINGS
          </span>


          <h2>
            Discover Items Available for Swap
          </h2>


          <p>
            Explore recently added items from users
            looking for their next exchange.
          </p>


        </div>





        <div className="row g-4">


          {listings.map((item, index) => (


            <div
              className="col-lg-4 col-md-6"
              key={index}
            >


              <div className="listing-card">


                <div className="listing-image">

                  {item.image}

                </div>





                <div className="listing-content">


                  <span className="listing-category">
                    {item.category}
                  </span>


                  <h4>
                    {item.title}
                  </h4>


                  <p className="owner">
                    Owned by {item.owner}
                  </p>


                  <p className="wants">
                    🔄 {item.wants}
                  </p>


                  <button className="view-button">
                    View Details
                  </button>


                </div>


              </div>


            </div>


          ))}


        </div>




        <div className="marketplace-button">


          <button>
            Browse Marketplace →
          </button>


        </div>



      </div>


    </section>

  );

}