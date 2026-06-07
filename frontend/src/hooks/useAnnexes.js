import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export const useAnnexes = (params = {}) => {
  const [annexes, setAnnexes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnnexes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, val);
        }
      });
      const res = await api.get(`/annexes?${queryParams}`);
      setAnnexes(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching annexes');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchAnnexes();
  }, [fetchAnnexes]);

  return { annexes, pagination, loading, error, refetch: fetchAnnexes };
};

export const useAnnexeBySlug = (slug) => {
  const [annexe, setAnnexe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/annexes/${slug}`);
        setAnnexe(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Annexe not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  return { annexe, loading, error };
};

export const useAdminAnnexes = (params = {}) => {
  const [annexes, setAnnexes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnnexes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, val);
        }
      });
      const res = await api.get(`/admin/annexes?${queryParams}`);
      setAnnexes(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching annexes');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchAnnexes();
  }, [fetchAnnexes]);

  return { annexes, pagination, loading, error, refetch: fetchAnnexes };
};

export const useStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/annexes/stats');
        setStats(res.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { stats, loading, error };
};

export const useAdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { stats, loading, error };
};
