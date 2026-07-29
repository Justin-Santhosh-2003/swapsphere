import "./Dashboard.css";

export default function Dashboard() {


  const stats = [

    {
      icon: "📦",
      title: "My Listings",
      value: "5",
      text: "Active items"
    },

    {
      icon: "🔄",
      title: "Exchange Requests",
      value: "3",
      text: "Pending requests"
    },

    {
      icon: "✨",
      title: "Suggestions",
      value: "4",
      text: "Possible swaps"
    },

    {
      icon: "⭐",
      title: "Trust Score",
      value: "4.8",
      text: "Average rating"
    }

  ];




  const activities = [

    {
      icon:"📷",
      text:"You listed DSLR Camera",
      time:"2 hours ago"
    },

    {
      icon:"🔄",
      text:"Exchange request received for Guitar",
      time:"Yesterday"
    },

    {
      icon:"⭐",
      text:"You received a new review",
      time:"3 days ago"
    }

  ];




  return (

    <section className="dashboard-section">


      <div className="container">



        <div className="dashboard-header">


          <h1>
            Welcome back 👋
          </h1>


          <p>
            Manage your listings, exchanges, and account activity.
          </p>


        </div>







        <div className="row g-4">


          {stats.map((stat,index)=>(

            <div
              className="col-lg-3 col-md-6"
              key={index}
            >

              <div className="stat-card">


                <div className="stat-icon">
                  {stat.icon}
                </div>


                <h3>
                  {stat.value}
                </h3>


                <h5>
                  {stat.title}
                </h5>


                <p>
                  {stat.text}
                </p>


              </div>


            </div>

          ))}


        </div>







        <div className="dashboard-actions">


          <h3>
            Quick Actions
          </h3>



          <div className="action-buttons">


            <button>
              ➕ Create Listing
            </button>


            <button>
              🔍 Find Exchanges
            </button>


            <button>
              📋 View Requests
            </button>


          </div>


        </div>







        <div className="activity-section">


          <h3>
            Recent Activity
          </h3>




          <div className="activity-box">


            {activities.map((activity,index)=>(

              <div
                className="activity-item"
                key={index}
              >


                <span className="activity-icon">

                  {activity.icon}

                </span>



                <div>

                  <p>
                    {activity.text}
                  </p>

                  <small>
                    {activity.time}
                  </small>

                </div>


              </div>

            ))}


          </div>


        </div>




      </div>


    </section>

  );

}