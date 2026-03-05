import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshCompany = async () => {
        try {
            const { data } = await api.get('/company');
            setCompany(data);
        } catch (err) {
            console.error("Failed to fetch company profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshCompany();
    }, []);

    return (
        <CompanyContext.Provider value={{ company, setCompany, refreshCompany, loading }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};
