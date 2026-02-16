import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { useAuth } from "./hooks/useAuth"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"


const ProtectedRoute = ( { children }) => {
  const { isAuthenticated , loading } = useAuth();
  if(loading) {
    return ( 
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading} = useAuth();
  if(loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  return!isAuthenticated ? children : <Navigate to="/dashboard" replace /> ;
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace /> } />;
      <Route path="/login" element={
        <PublicRoute>
          <Login/>
        </PublicRoute>
      }
      />
      <Route path="/register" element={
        <PublicRoute>
          <Register/>
        </PublicRoute>
      }
      />
      <Route path="/dashboard" element={
        <PublicRoute>
          <Dashboard/>
        </PublicRoute>
      }
      />
      <Route 
      path="*" 
      element={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-8">Page not found</p>
            <a href="/dashboard" className="btn-primary">
            Go to Dashboard </a>
          </div>
        </div>
      }
      />

    </Routes>
  );
};

function App() {
  return (
   <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
   </BrowserRouter>
  );
}
export default App
