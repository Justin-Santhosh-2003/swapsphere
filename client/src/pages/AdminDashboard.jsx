import "./AdminDashboard.css";

export default function AdminDashboard() {


  const stats = [

    {
      icon:"👥",
      title:"Total Users",
      value:"250"
    },

    {
      icon:"📂",
      title:"Categories",
      value:"15"
    },

    {
      icon:"📦",
      title:"Active Listings",
      value:"500"
    },

    {
      icon:"🔄",
      title:"Completed Exchanges",
      value:"120"
    }

  ];





  const categories = [

    {
      name:"Electronics",
      sub:["Camera","Smartphone","Laptop"]
    },

    {
      name:"Musical Instruments",
      sub:["Guitar","Keyboard"]
    },

    {
      name:"Books",
      sub:["Education","Fiction"]
    }

  ];





  const listings = [

    {
      item:"📷 DSLR Camera",
      user:"Justin",
      status:"Available"
    },

    {
      item:"🎸 Guitar",
      user:"Alex",
      status:"Available"
    },

    {
      item:"📱 Smartphone",
      user:"Rahul",
      status:"Review"
    }

  ];





  return (

    <section className="admin-section">


      <div className="container">



        <div className="admin-header">


          <span>
            ADMIN PANEL
          </span>


          <h1>
            Dashboard
          </h1>


          <p>
            Manage users, categories, and marketplace activities.
          </p>


        </div>








        <div className="row g-4">


          {
            stats.map((stat,index)=>(

              <div
                className="col-lg-3 col-md-6"
                key={index}
              >


                <div className="admin-stat-card">


                  <div className="admin-icon">

                    {stat.icon}

                  </div>



                  <h2>
                    {stat.value}
                  </h2>



                  <p>
                    {stat.title}
                  </p>



                </div>


              </div>


            ))
          }



        </div>








        <div className="admin-box">


          <div className="box-header">


            <h3>
              Category Management
            </h3>


            <button>
              + Add Category
            </button>


          </div>





          <div className="category-list">


            {
              categories.map((category,index)=>(


                <div
                  className="category-card"
                  key={index}
                >


                  <h5>
                    📂 {category.name}
                  </h5>



                  <ul>

                    {
                      category.sub.map((item,i)=>(

                        <li key={i}>
                          {item}
                        </li>

                      ))
                    }

                  </ul>


                </div>


              ))
            }



          </div>


        </div>








        <div className="admin-box">


          <div className="box-header">


            <h3>
              Listing Moderation
            </h3>


          </div>





          {
            listings.map((listing,index)=>(


              <div
                className="listing-row"
                key={index}
              >



                <div>

                  <h5>
                    {listing.item}
                  </h5>


                  <p>
                    Owner: {listing.user}
                  </p>


                </div>



                <div>


                  <span className="status">

                    {listing.status}

                  </span>


                  <button>
                    View
                  </button>


                </div>



              </div>


            ))
          }



        </div>





      </div>


    </section>

  );

}