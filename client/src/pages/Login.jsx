import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({

    email: "",
    password: ""

  });

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // Show suspension message if redirected here by axios interceptor
  useEffect(() => {
    const authError = sessionStorage.getItem("authError");
    if (authError) {
      setError(authError);
      sessionStorage.removeItem("authError");
    }
  }, []);

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      setError("");

      const res = await loginUser(formData);

      login(res.data.token);

      navigate("/dashboard");

    }

    catch (err) {

      setError(

        err.response?.data?.message ||

        "Login failed."

      );

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <section className="login-page">

      <div className="container">

        <div className="login-card">

          <div className="text-center mb-4">

            <h2 className="login-logo">

              SwapSphere

            </h2>

            <p className="login-subtitle">

              Welcome back! Sign in to continue swapping.

            </p>

          </div>

          {

            error && (

              <div className="alert alert-danger">

                {error}

              </div>

            )

          }

          <form onSubmit={handleSubmit}>

            <div className="mb-3">

              <label className="form-label">

                Email Address

              </label>

              <input

                type="email"

                name="email"

                className="form-control"

                placeholder="Enter your email"

                value={formData.email}

                onChange={handleChange}

                required

              />

            </div>

            <div className="mb-3">

              <label className="form-label">

                Password

              </label>

              <input

                type="password"

                name="password"

                className="form-control"

                placeholder="Enter your password"

                value={formData.password}

                onChange={handleChange}

                required

              />

            </div>

            <div className="text-end mb-4">

              <Link

                to="#"

                className="forgot-password"

              >

                Forgot Password?

              </Link>

            </div>

            <button

              type="submit"

              className="btn btn-success w-100 login-btn"

              disabled={loading}

            >

              {

                loading

                  ? "Logging in..."

                  : "Login"

              }

            </button>

          </form>

          <div className="divider">

            <span>

              OR

            </span>

          </div>

          <button

            className="btn btn-outline-dark w-100 google-btn"

          >

            <span className="google-icon">

              G

            </span>

            Continue with Google

          </button>

          <p className="register-text">

            Don't have an account?

            <Link to="/register">

              Register

            </Link>

          </p>

        </div>

      </div>

    </section>

  );

}