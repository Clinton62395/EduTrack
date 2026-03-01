/**
 * Format time from Firebase Timestamp or Date
 * @param {any} timestamp - Firebase Timestamp or JS Date
 * @returns {string} - Formatted time (HH:MM)
 */
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return "···";

  try {
    let date;

    // Handle Firebase Timestamp
    if (timestamp.toDate && typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    }
    // Handle JS Date
    else if (timestamp instanceof Date) {
      date = timestamp;
    }
    // Handle milliseconds number
    else if (typeof timestamp === "number") {
      date = new Date(timestamp);
    }
    // Handle string ISO format
    else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    } else {
      return "···";
    }

    // Format HH:MM
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Erreur formatting time:", error);
    return "···";
  }
};

/**
 * Format relative time (Today, Yesterday, or date)
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "···";

  try {
    let date;

    if (timestamp.toDate && typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === "number") {
      date = new Date(timestamp);
    } else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    } else {
      return "···";
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    if (messageDate.getTime() === today.getTime()) {
      return "Aujourd'hui";
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return "Hier";
    } else {
      return date.toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
      });
    }
  } catch (error) {
    console.error("Erreur formatting relative time:", error);
    return "···";
  }
};
