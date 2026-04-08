"use client";

import BuyerDashboard from "./buyer";
import SellerDashboard from "./seller";
import { useLocation } from "@/hooks/use-location";

interface Props {
  role: string;
  userName: string;
}

export default function DashboardShell({ role, userName }: Props) {
  const { location, status, requestLocation } = useLocation();

  const sharedProps = {
    userLocation: location?.label ?? "",
    userCoords: location ? { lat: location.lat, lng: location.lng } : undefined,
    userName,
    locationStatus: status,
    onRequestLocation: requestLocation,
  };

  if (role === "buyer") return <BuyerDashboard {...sharedProps} />;
  return <SellerDashboard {...sharedProps} />;
}
