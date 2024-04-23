import { useEffect, useState, useCallback, useMemo } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

import Combobox from "@/components/combobox";

interface Props {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

const debounce = (
  fn: (...params: any) => void | Promise<any>,
  delay: number
) => {
  let timeout: NodeJS.Timeout;

  return async (...args: any) => {
    clearTimeout(timeout);

    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        resolve(fn(...args));
      }, delay);
    });
  };
};
export const LocationSearch = ({ onPlaceSelect }: Props) => {
  const map = useMap();
  const places = useMapsLibrary("places");
  const [sessionToken, setSessionToken] =
    useState<google.maps.places.AutocompleteSessionToken>();
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);

  useEffect(() => {
    if (!places || !map) return;

    setAutocompleteService(new places.AutocompleteService());
    setPlacesService(new places.PlacesService(map));
    setSessionToken(new places.AutocompleteSessionToken());

    return () => setAutocompleteService(null);
  }, [map, places]);

  const fetchPredictions = useCallback(
    async (inputValue: string) => {
      return new Promise<any>(async (resolve) => {
        if (!autocompleteService || !inputValue) {
          return;
        }

        const request = { input: inputValue, sessionToken };
        const response = await autocompleteService.getPlacePredictions(request);

        if (
          !response ||
          !response.predictions ||
          !Array.isArray(response.predictions)
        )
          return;

        setPredictions(response.predictions);

        resolve(
          response.predictions.map((prediction) => ({
            label: prediction.description,
            value: prediction.place_id,
          }))
        );
      });
    },
    [autocompleteService, sessionToken]
  );

  const debouncedFetchPredictions = useMemo(() => {
    return debounce(fetchPredictions, 500);
  }, [fetchPredictions]);

  const onInputChange = useCallback(
    (value: google.maps.places.AutocompletePrediction | string) => {
      if (typeof value === "string") {
        fetchPredictions(value);
      }
    },
    [fetchPredictions]
  );

  const onSelect = useCallback(
    (prediction: google.maps.places.AutocompletePrediction | string) => {
      if (!places || typeof prediction === "string") return;

      const detailRequestOptions = {
        placeId: prediction.place_id,
        fields: ["geometry", "name", "formatted_address"],
        sessionToken,
      };

      const detailsRequestCallback = (
        placeDetails: google.maps.places.PlaceResult | null
      ) => {
        onPlaceSelect(placeDetails);
        setSessionToken(new places.AutocompleteSessionToken());
      };

      placesService?.getDetails(detailRequestOptions, detailsRequestCallback);
    },
    [onPlaceSelect, places, placesService, sessionToken]
  );

  return (
    <div className="grid gap-4 py-4">
      <Combobox
        items={predictions.map((prediction) => ({
          label: prediction.description,
          value: prediction.place_id,
        }))}
        onInputChange={onInputChange}
        loadOptions={debouncedFetchPredictions}
        placeholder="Search for a location"
        onSelectionChange={(value) => {
          const location = predictions.find(
            (prediction) => prediction.place_id === value
          );

          if (!location) return;

          onSelect(location);
        }}
      />
    </div>
  );
};
