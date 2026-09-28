export async function getCurrentLocation(): Promise<GeolocationPosition | null> {
	if (!import.meta.client) return null;

	if ('geolocation' in navigator) {
		return await new Promise((resolve) => {
			navigator.geolocation.getCurrentPosition((pos) => {
				console.log('Location:', pos);
				resolve(pos);
			});
		});
	} else {
		return null;
	}
}
