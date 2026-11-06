import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import RequireUser from "./RequireUser.jsx";
import Homepage from "../pages/Homepage.jsx";
import AboutStadium from "../pages/AboutStadium.jsx";
import AllQuestions from "../pages/AllQuestions.jsx";
import TicketingTerms from "../pages/TicketingTerms.jsx";
import Login from "../pages/Login.jsx";
import Seats from "../pages/Seats.jsx";
import Checkout from "../pages/Checkout.jsx";
import PaymentStatus from "../pages/PaymentStatus.jsx";
import MyTickets from "../pages/MyTickets.jsx";
import NotifyConfirm from "../pages/NotifyConfirm.jsx";
import NotFound from "../pages/NotFound.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Homepage />} />
        <Route path="about" element={<AboutStadium />} />
        <Route path="faq" element={<AllQuestions />} />
        <Route path="ticketing-terms" element={<TicketingTerms />} />
        <Route path="login" element={<Login />} />
        <Route path="events/:slug/seats" element={<Seats />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="payment/:id" element={<PaymentStatus />} />
        <Route path="notify/confirm" element={<NotifyConfirm />} />
        <Route
          path="tickets"
          element={
            <RequireUser>
              <MyTickets />
            </RequireUser>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}