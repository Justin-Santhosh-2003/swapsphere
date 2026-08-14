import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./HeroSection.css";

export default function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="hero">
      <div className="container">
        <div className="row align-items-center">
          {/* LEFT */}
          <div className="col-lg-6 hero-left">
            <span className="hero-badge">SMART BARTER PLATFORM</span>

            <h1 className="hero-title">
              Exchange What You Have.
              <br />
              Find What You Need.
            </h1>

            <p className="hero-text">
              Swap items directly with people without spending money.
              SwapSphere helps you discover the perfect exchange.
            </p>

            <div className="hero-buttons">
              <Link
                to={isAuthenticated ? "/create-listing" : "/register"}
                className="btn btn-success btn-lg"
              >
                Start Swapping
              </Link>

              <Link to="/marketplace" className="btn btn-outline-success btn-lg">
                Browse Marketplace
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-lg-6 hero-right">
            <div className="exchange-wrapper">
              <div className="exchange-triangle">
                <svg
                  className="triangle-arrows"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* Camera → Guitar */}
                  <path d="M50 25 L25 72" />
                  {/* Guitar → Phone */}
                  <path d="M25 78 L75 78" />
                  {/* Phone → Camera */}
                  <path d="M75 72 L50 25" />
                </svg>

                {/* CAMERA */}
                <div className="triangle-card camera-card">
                  <div className="triangle-icon">📷</div>
                  <h5>Camera</h5>
                </div>

                {/* GUITAR */}
                <div className="triangle-card guitar-card">
                  <div className="triangle-icon">🎸</div>
                  <h5>Guitar</h5>
                </div>

                {/* PHONE */}
                <div className="triangle-card phone-card">
                  <div className="triangle-icon">📱</div>
                  <h5>Phone</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}