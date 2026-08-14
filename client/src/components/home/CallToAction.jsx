import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./CallToAction.css";

export default function CallToAction() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-box">
          <h2>Ready to Start Swapping?</h2>
          <p>
            Turn unused items into something valuable. Join SwapSphere and discover smarter exchanges.
          </p>

          <div className="cta-buttons">
            <Link
              to={isAuthenticated ? "/create-listing" : "/register"}
              className="cta-primary btn btn-success btn-lg"
            >
              Start Swapping
            </Link>

            <Link to="/marketplace" className="cta-secondary btn btn-outline-light btn-lg">
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}