import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [locations, setLocations] = useState([]);
    const [selectedLocationId, setSelectedLocationId] = useState(localStorage.getItem('selectedLocationId') || 'all');
    const [loading, setLoading] = useState(true);

    const fetchLocations = async () => {
        try {
            const { data } = await api.get('/locations');
            setLocations(data);
        } catch (err) {
            console.error('Failed to fetch locations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    useEffect(() => {
        if (selectedLocationId !== 'all') {
            localStorage.setItem('selectedLocationId', selectedLocationId);
        } else {
            localStorage.removeItem('selectedLocationId');
        }
    }, [selectedLocationId]);

    const selectedLocation = selectedLocationId === 'all'
        ? null
        : locations.find(loc => loc.id === selectedLocationId);

    return (
        <LocationContext.Provider value={{
            locations,
            selectedLocationId,
            setSelectedLocationId,
            selectedLocation,
            refreshLocations: fetchLocations,
            loading
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
