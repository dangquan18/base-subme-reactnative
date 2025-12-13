import { useState, useEffect } from "react";
import { packageService } from "@/services/package.service";
import { Package, PackageCategory } from "@/types";

export const usePackages = (category?: PackageCategory) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchPackages();
  }, [category]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packageService.getPackages({ category });
      setPackages(response.packages);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching packages:", err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchPackages();
  };

  return { packages, loading, error, refetch };
};

export const useFeaturedPackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchFeaturedPackages();
  }, []);

  const fetchFeaturedPackages = async () => {
    try {
      setLoading(true);
      const data = await packageService.getFeaturedPackages();
      setPackages(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching featured packages:", err);
    } finally {
      setLoading(false);
    }
  };

  return { packages, loading, error, refetch: fetchFeaturedPackages };
};

export const usePackageDetail = (id: string) => {
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      fetchPackageDetail();
    }
  }, [id]);

  const fetchPackageDetail = async () => {
    try {
      setLoading(true);
      const data = await packageService.getPackageById(id);
      setPackageData(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching package detail:", err);
    } finally {
      setLoading(false);
    }
  };

  return { packageData, loading, error, refetch: fetchPackageDetail };
};
