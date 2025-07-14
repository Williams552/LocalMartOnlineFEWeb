import { useState, useEffect } from 'react';
import productUnitService from '../services/productUnitService';

// Hook để load tất cả đơn vị hoạt động
export const useActiveUnits = () => {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadUnits();
    }, []);

    const loadUnits = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await productUnitService.getActiveUnits();
            const formattedUnits = (data || []).map(unit => 
                productUnitService.formatUnitDisplay(unit)
            );
            setUnits(formattedUnits);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { units, loading, error, refetch: loadUnits };
};

// Hook để load đơn vị theo loại
export const useUnitsByType = (unitType, activeOnly = true) => {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (unitType) {
            loadUnits();
        }
    }, [unitType, activeOnly]);

    const loadUnits = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await productUnitService.getUnitsByType(unitType, activeOnly);
            const formattedUnits = (data || []).map(unit => 
                productUnitService.formatUnitDisplay(unit)
            );
            setUnits(formattedUnits);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { units, loading, error, refetch: loadUnits };
};

// Hook để load tất cả unit types
export const useUnitTypes = () => {
    const [unitTypes, setUnitTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadUnitTypes();
    }, []);

    const loadUnitTypes = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await productUnitService.getUnitTypes();
            setUnitTypes(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { unitTypes, loading, error, refetch: loadUnitTypes };
};

// Hook để quản lý đơn vị cho admin
export const useProductUnitManagement = (initialParams = {}) => {
    const [units, setUnits] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadUnits();
    }, [pagination.current, pagination.pageSize]);

    const loadUnits = async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productUnitService.getAllUnits({
                page: pagination.current,
                pageSize: pagination.pageSize,
                ...initialParams,
                ...params
            });

            const unitsData = response.items || response.data || [];
            const formattedUnits = unitsData.map(unit => 
                productUnitService.formatUnitDisplay(unit)
            );
            
            setUnits(formattedUnits);
            setPagination(prev => ({
                ...prev,
                total: response.totalItems || response.total || formattedUnits.length
            }));

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createUnit = async (unitData) => {
        try {
            await productUnitService.createUnit(unitData);
            await loadUnits(); // Reload list
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const updateUnit = async (id, unitData) => {
        try {
            await productUnitService.updateUnit(id, unitData);
            await loadUnits(); // Reload list
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const deleteUnit = async (id) => {
        try {
            await productUnitService.deleteUnit(id);
            await loadUnits(); // Reload list
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const toggleUnitStatus = async (id) => {
        try {
            await productUnitService.toggleUnitStatus(id);
            await loadUnits(); // Reload list
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const searchUnits = async (name) => {
        try {
            const data = await productUnitService.searchUnits(name, true);
            const formattedUnits = (data || []).map(unit => 
                productUnitService.formatUnitDisplay(unit)
            );
            setUnits(formattedUnits);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const changePagination = (newPagination) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        }));
    };

    return {
        units,
        pagination,
        loading,
        error,
        loadUnits,
        createUnit,
        updateUnit,
        deleteUnit,
        toggleUnitStatus,
        searchUnits,
        changePagination,
        clearError: () => setError(null)
    };
};

export default {
    useActiveUnits,
    useUnitsByType,
    useUnitTypes,
    useProductUnitManagement
};
