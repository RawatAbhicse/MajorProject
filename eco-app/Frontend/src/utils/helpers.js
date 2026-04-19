export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
        (error) => reject(error)
      );
    } else {
      reject(new Error('Geolocation not supported'));
    }
  });
};

// Add more helpers (e.g., formatDate) as needed