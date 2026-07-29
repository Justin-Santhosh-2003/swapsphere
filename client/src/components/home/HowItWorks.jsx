import "./HowItWorks.css";

export default function HowItWorks() {

  const steps = [
    {
      icon: "📦",
      title: "List Your Item",
      description:
        "Upload your item and tell others what you are looking for in return."
    },

    {
      icon: "🔄",
      title: "Find a Match",
      description:
        "Discover people with items that match your exchange preferences."
    },

    {
      icon: "🤝",
      title: "Complete the Swap",
      description:
        "Connect with the user and complete your exchange securely."
    }
  ];


  return (

    <section className="how-section">


      <div className="container">


        {/* HEADER */}

        <div className="how-header">

          <span className="section-badge">
            HOW IT WORKS
          </span>


          <h2>
            Swap in Three Simple Steps
          </h2>


          <p>
            SwapSphere makes exchanging items simple, transparent,
            and hassle-free.
          </p>


        </div>





        {/* STEPS */}

        <div className="row justify-content-center">


          {steps.map((step, index) => (

            <div
              className="col-lg-4 col-md-6"
              key={index}
            >

              <div className="step-card">


                <div className="step-icon">
                  {step.icon}
                </div>


                <h4>
                  {step.title}
                </h4>


                <p>
                  {step.description}
                </p>


                <div className="step-number">
                  0{index + 1}
                </div>


              </div>


            </div>

          ))}


        </div>


      </div>


    </section>

  );
}