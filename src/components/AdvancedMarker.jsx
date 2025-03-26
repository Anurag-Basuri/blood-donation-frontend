import { useEffect, useRef } from "react";

const AdvancedMarker = ({ position, map, icon, onClick }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !position) return;

    // Create the AdvancedMarkerElement
    const marker = new google.maps.marker.AdvancedMarkerElement({
      position,
      map,
      icon,
    });

    // Attach click listener
    if (onClick) {
      marker.addListener("click", onClick);
    }

    // Save the marker instance
    markerRef.current = marker;

    return () => {
      // Cleanup the marker
      marker.map = null;
    };
  }, [map, position, icon, onClick]);

  return null;
};

export default AdvancedMarker;
