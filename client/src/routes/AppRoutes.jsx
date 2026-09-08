import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Marketplace from "../pages/Marketplace";
import ItemDetails from "../pages/ItemDetails";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import CreateListing from "../pages/CreateListing";
import ExchangeSuggestions from "../pages/ExchangeSuggestions";
import ExchangeRoom from "../pages/ExchangeRoom";
import AdminDashboard from "../pages/AdminDashboard";
import Notifications from "../pages/Notifications";
import NotFound from "../pages/NotFound";
import UserProfile from "../pages/UserProfile";

import MainLayout from "../layouts/MainLayout";

import ProtectedRoute from "../components/common/ProtectedRoute";

import AdminRoute from "../components/common/AdminRoute";

export default function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Public Routes */}

        <Route

          path="/"

          element={

            <MainLayout>

              <Home />

            </MainLayout>

          }

        />

        <Route

          path="/login"

          element={

            <MainLayout>

              <Login />

            </MainLayout>

          }

        />

        <Route

          path="/register"

          element={

            <MainLayout>

              <Register />

            </MainLayout>

          }

        />

        <Route

          path="/marketplace"

          element={

            <MainLayout>

              <Marketplace />

            </MainLayout>

          }

        />

        <Route

          path="/item/:id"

          element={

            <MainLayout>

              <ItemDetails />

            </MainLayout>

          }

        />

        {/* Protected Routes */}

        <Route

          path="/dashboard"

          element={

            <ProtectedRoute>

              <MainLayout>

                <Dashboard />

              </MainLayout>

            </ProtectedRoute>

          }

        />

        <Route

          path="/profile"

          element={

            <ProtectedRoute>

              <MainLayout>

                <Profile />

              </MainLayout>

            </ProtectedRoute>

          }

        />

        <Route

          path="/create-listing"

          element={

            <ProtectedRoute>

              <MainLayout>

                <CreateListing />

              </MainLayout>

            </ProtectedRoute>

          }

        />
        <Route
          path="/create-listing/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateListing />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route

          path="/suggestions"

          element={

            <ProtectedRoute>

              <MainLayout>

                <ExchangeSuggestions />

              </MainLayout>

            </ProtectedRoute>

          }

        />

        <Route

          path="/exchange-room/:id"

          element={

            <ProtectedRoute>

              <MainLayout>

                <ExchangeRoom />

              </MainLayout>

            </ProtectedRoute>

          }

        />

        {/* Public User Profile */}
        <Route
          path="/user/:id"
          element={
            <MainLayout>
              <UserProfile />
            </MainLayout>
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Notifications />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route

          path="/admin"

          element={

            <AdminRoute>

              <MainLayout>

                <AdminDashboard />

              </MainLayout>

            </AdminRoute>

          }

        />

        {/* 404 */}

        <Route

          path="*"

          element={

            <MainLayout>

              <NotFound />

            </MainLayout>

          }

        />

      </Routes>

    </BrowserRouter>

  );

}