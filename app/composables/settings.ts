import { getLocationPreference, setLocationPreference } from '~/db/settings-db';

export function useSettings() {
	const settings = ref<{
		usePreciseLocation?: boolean;
	}>({});

	async function setPreciseLocationStatus(enabled: boolean) {
		settings.value.usePreciseLocation = enabled;
		await setLocationPreference(enabled);
	}

	async function refreshPreciseLocation() {
		settings.value.usePreciseLocation = await getLocationPreference();
	}

	return {
		settings,
		refreshPreciseLocation,
		setPreciseLocationStatus,
	};
}
