import { useEffect, useState } from "react";
import config from "./api-config";

type Country = { country: string ,arabic_country:string};

export const useCountryList = () => {
  const [countries, setCountries] = useState<string[]>([]);
  const [load, setLoad] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const base_url=config.BASE_URL;

  useEffect(() => {
    const createOrganizationAndFetchCountries = async () => {
      try {
        console.log("Creating organization...");
        const orgResponse = await fetch(base_url+"/create_organization", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ organization_name: "Omantel" }),
        });

        if (!orgResponse.ok) {
          throw new Error(`Failed to create organization: ${orgResponse.status} ${orgResponse.statusText}`);
        }

        const orgData = await orgResponse.json();
        console.log("Organization created successfully", orgData);

        const vendorKey =
          orgData?.result?.[0]?.vendor_key ?? "";

        if (!vendorKey) {
          throw new Error("No vendor key found in response");
        }

        localStorage.setItem("vendor_key", vendorKey);

        const countryResponse = await fetch(base_url+"/country", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vendor_key: vendorKey }),
        });

        if (!countryResponse.ok) {
          throw new Error(`Failed to get country: ${countryResponse.status} ${countryResponse.statusText}`);
        }

        const data = await countryResponse.json();
        if (data.message === "success") {
          // const filteredCountries = data.result.map((c: Country) => c.country);
          const filteredCountries = data.result.map((c: Country) => ({
  country: c.country,
  arabic_country: c.arabic_country,
}));
          setCountries(filteredCountries);
        } else {
          throw new Error("Failed to retrieve countries");
        }

      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoad(false);
      }
    };

    createOrganizationAndFetchCountries();
  }, []);

  return { countries, load, error };
};
