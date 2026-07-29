import "./Features.css";

export default function Features() {


  const features = [

    {
      icon: "🔄",
      title: "Smart Exchange Matching",
      description:
        "Discover possible exchanges by matching your items with what other users need."
    },

    {
      icon: "🔗",
      title: "Two-way & Three-way Swaps",
      description:
        "Exchange directly with another user or participate in multi-user exchange cycles."
    },

    {
      icon: "🛡️",
      title: "Trust & Reputation",
      description:
        "Build trust through ratings, reviews, and completed exchange history."
    },

    {
      icon: "💬",
      title: "Exchange Rooms",
      description:
        "Communicate privately with exchange participants after a request is accepted."
    },

    {
      icon: "📍",
      title: "Meeting Coordination",
      description:
        "Plan and coordinate item handovers with other exchange participants."
    },

    {
      icon: "⭐",
      title: "Ratings & Reviews",
      description:
        "Share your experience and help create a reliable swapping community."
    }

  ];



  return (

    <section className="features-section">


      <div className="container">


        <div className="features-header">


          <span className="section-badge">
            WHY SWAPSPHERE
          </span>


          <h2>
            More Than Just a Marketplace
          </h2>


          <p>
            SwapSphere combines intelligent matching,
            secure communication, and trust systems to make
            item exchange easier.
          </p>


        </div>





        <div className="row g-4">


          {features.map((feature, index) => (


            <div
              className="col-lg-4 col-md-6"
              key={index}
            >


              <div className="feature-card">


                <div className="feature-icon">
                  {feature.icon}
                </div>


                <h4>
                  {feature.title}
                </h4>


                <p>
                  {feature.description}
                </p>


              </div>


            </div>


          ))}


        </div>


      </div>


    </section>

  );

}