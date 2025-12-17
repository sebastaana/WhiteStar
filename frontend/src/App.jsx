import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import Landing from './pages/Landing';
import Catalog from './pages/Catalog';
import Auth from './pages/Auth';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Reservations from './pages/Reservations';
import StockManagement from './pages/StockManagement';
import Reports from './pages/Reports';
import OrderConfirmation from './pages/OrderConfirmation';
import UserManagement from './pages/UserManagement';
import CustomerServiceDashboard from './pages/CustomerServiceDashboard';
import CustomerLookup from './pages/CustomerLookup';
import ComplaintManagement from './pages/ComplaintManagement';
import OrderTracking from './pages/OrderTracking';
import TaskManagement from './pages/TaskManagement';
import SellerStockView from './pages/SellerStockView';
import MyComplaints from './pages/MyComplaints';

function App() {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Navbar />
              <ToastContainer />
              <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/register" element={<Auth />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/reservations" element={<Reservations />} />
                  <Route path="/stock-management" element={<StockManagement />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/customer-service/dashboard" element={<CustomerServiceDashboard />} />
                  <Route path="/customer-service/customers" element={<CustomerLookup />} />
                  <Route path="/customer-service/complaints" element={<ComplaintManagement />} />
                  <Route path="/customer-service/orders" element={<OrderTracking />} />
                  <Route path="/tasks" element={<TaskManagement />} />
                  <Route path="/seller-stock" element={<SellerStockView />} />
                  <Route path="/my-complaints" element={<MyComplaints />} />
                </Routes>
              </main>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
