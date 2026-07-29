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
import NotFound from "../pages/NotFound";
import MainLayout from "../layouts/MainLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
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

  <Route
    path="/dashboard"
    element={
      <MainLayout>
        <Dashboard />
      </MainLayout>
    }
  />

  <Route
    path="/profile"
    element={
      <MainLayout>
        <Profile />
      </MainLayout>
    }
  />

  <Route
    path="/create-listing"
    element={
      <MainLayout>
        <CreateListing />
      </MainLayout>
    }
  />

  <Route
    path="/suggestions"
    element={
      <MainLayout>
        <ExchangeSuggestions />
      </MainLayout>
    }
  />

  <Route
    path="/exchange-room/:id"
    element={
      <MainLayout>
        <ExchangeRoom />
      </MainLayout>
    }
  />

  <Route
    path="/admin"
    element={
      <MainLayout>
        <AdminDashboard />
      </MainLayout>
    }
  />

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