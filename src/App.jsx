import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CompanyProvider } from './contexts/CompanyContext';
import { LocationProvider } from './contexts/LocationContext';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from './components/ui/Tooltip';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Expenses from './pages/Expenses/ExpenseList';
import Clients from './pages/Clients';
import Company from './pages/Company';
import InvoiceList from './pages/Invoices/InvoiceList';
import InvoiceCreate from './pages/Invoices/InvoiceCreate';
import InvoiceDetail from './pages/Invoices/InvoiceDetail';
import InvoiceEdit from './pages/Invoices/InvoiceEdit';
import QuotationList from './pages/Quotations/QuotationList';
import QuotationCreate from './pages/Quotations/QuotationCreate';
import QuotationDetail from './pages/Quotations/QuotationDetail';
import QuotationEdit from './pages/Quotations/QuotationEdit';
import ClientDetail from './pages/ClientDetail';
import UserManagement from './pages/Admin/UserManagement';
import Locations from './pages/Admin/Locations';
import Revenue from './pages/Revenue';
import ProfitLoss from './pages/ProfitLoss';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import SearchModal from './components/Layout/SearchModal';

const PrivateRoute = ({ children, roles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-background">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (roles.length > 0 && !roles.includes(user.role)) return <Navigate to="/dashboard" />;

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground">
            <Sidebar />
            <div className="md:ml-64 flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-200">
                <TopBar />
                <SearchModal />
                <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 overflow-x-hidden relative">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <CompanyProvider>
                    <LocationProvider>
                        <TooltipProvider delayDuration={400}>
                            <Toaster
                                position="top-center"
                                toastOptions={{
                                    className: 'text-[11px] font-bold uppercase tracking-widest border border-border bg-background text-text rounded-md shadow-xl',
                                    duration: 3000,
                                    style: {
                                        borderRadius: '8px',
                                        background: 'rgb(var(--background))',
                                        color: 'rgb(var(--text))',
                                        border: '1px solid rgb(var(--border))',
                                    },
                                    success: {
                                        iconTheme: {
                                            primary: 'rgb(var(--primary))',
                                            secondary: 'rgb(var(--background))',
                                        },
                                    },
                                }}
                            />
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />

                                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                                <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
                                <Route path="/revenue" element={<PrivateRoute><Revenue /></PrivateRoute>} />
                                <Route path="/profit-loss" element={<PrivateRoute><ProfitLoss /></PrivateRoute>} />
                                <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
                                <Route path="/clients/:id" element={<PrivateRoute><ClientDetail /></PrivateRoute>} />
                                <Route path="/company" element={<PrivateRoute><Company /></PrivateRoute>} />

                                <Route path="/invoices" element={<PrivateRoute><InvoiceList /></PrivateRoute>} />
                                <Route path="/invoices/create" element={<PrivateRoute><InvoiceCreate /></PrivateRoute>} />
                                <Route path="/invoices/:id" element={<PrivateRoute><InvoiceDetail /></PrivateRoute>} />
                                <Route path="/invoices/:id/edit" element={<PrivateRoute><InvoiceEdit /></PrivateRoute>} />

                                <Route path="/quotations" element={<PrivateRoute><QuotationList /></PrivateRoute>} />
                                <Route path="/quotations/create" element={<PrivateRoute><QuotationCreate /></PrivateRoute>} />
                                <Route path="/quotations/:id" element={<PrivateRoute><QuotationDetail /></PrivateRoute>} />
                                <Route path="/quotations/:id/edit" element={<PrivateRoute><QuotationEdit /></PrivateRoute>} />

                                <Route path="/admin/users" element={<PrivateRoute roles={['super_admin']}><UserManagement /></PrivateRoute>} />
                                <Route path="/admin/locations" element={<PrivateRoute roles={['super_admin']}><Locations /></PrivateRoute>} />

                                <Route path="/" element={<Navigate to="/dashboard" />} />
                            </Routes>
                        </TooltipProvider>
                    </LocationProvider>
                </CompanyProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
