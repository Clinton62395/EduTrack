import { useCallback, useState } from "react";

/**
 * Hook useImageZoom
 * Gère l'agrandissement/zoom des images dans les messages
 * Évite que le composant soit illisible
 */
export const useImageZoom = () => {
  const [zoomedImage, setZoomedImage] = useState(null);

  const openZoom = useCallback((imageUri, imageType = "message") => {
    setZoomedImage({
      uri: imageUri,
      type: imageType,
      timestamp: Date.now(),
    });
  }, []);

  const closeZoom = useCallback(() => {
    setZoomedImage(null);
  }, []);

  const toggleZoom = useCallback(
    (imageUri, isOpen) => {
      if (isOpen) {
        openZoom(imageUri);
      } else {
        closeZoom();
      }
    },
    [openZoom, closeZoom],
  );

  return {
    zoomedImage,
    openZoom,
    closeZoom,
    toggleZoom,
    isZoomed: !!zoomedImage,
  };
};
