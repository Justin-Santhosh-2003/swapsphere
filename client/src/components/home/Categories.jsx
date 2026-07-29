import "./Categories.css";

export default function Categories() {


  const categories = [

    {
      icon: "📱",
      title: "Electronics",
      description: "Phones, laptops, cameras and gadgets"
    },

    {
      icon: "🎮",
      title: "Gaming",
      description: "Consoles, games and gaming accessories"
    },

    {
      icon: "📚",
      title: "Books",
      description: "Textbooks, novels and study materials"
    },

    {
      icon: "👕",
      title: "Fashion",
      description: "Clothes, shoes and accessories"
    },

    {
      icon: "🎸",
      title: "Hobbies",
      description: "Instruments, collectibles and equipment"
    },

    {
      icon: "🏠",
      title: "Lifestyle",
      description: "Home items and everyday essentials"
    }

  ];



  return (

    <section className="category-section">


      <div className="container">


        <div className="category-header">


          <span className="section-badge">
            EXPLORE CATEGORIES
          </span>


          <h2>
            What Can You Swap?
          </h2>


          <p>
            Explore different categories and find items
            that match what you need.
          </p>


        </div>





        <div className="row g-4">


          {categories.map((category, index) => (

            <div
              className="col-lg-4 col-md-6"
              key={index}
            >


              <div className="category-card">


                <div className="category-icon">
                  {category.icon}
                </div>


                <h4>
                  {category.title}
                </h4>


                <p>
                  {category.description}
                </p>


              </div>


            </div>

          ))}


        </div>


      </div>


    </section>

  );

}