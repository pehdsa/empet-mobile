import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";
import { DEFAULT_LOCATION } from "@/constants/defaults";

interface LocationState {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);

  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status);
    return status;
  }, []);

  const centerOnUser = useCallback(async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(coords);
      return coords;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const status = await requestPermission();
      if (status === Location.PermissionStatus.GRANTED) {
        await centerOnUser();
      } else {
        setLocation({
          latitude: DEFAULT_LOCATION.latitude,
          longitude: DEFAULT_LOCATION.longitude,
        });
      }
    })();
  }, [requestPermission, centerOnUser]);

  return {
    location,
    permissionStatus,
    requestPermission,
    centerOnUser,
  };
}
