import { useEffect, useRef } from "react";

const AdvancedMarker = ({ position, map, content, onClick }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !position) return;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position,
      map,
      content,
    });

    if (onClick) {
      marker.addListener("click", onClick);
    }

    markerRef.current = marker;

    return () => {
      marker.map = null;
    };
  }, [map, position, content, onClick]);

  return null;
};

export default AdvancedMarker;
