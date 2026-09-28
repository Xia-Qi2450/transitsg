import { getLocationPreference, setLocationPreference } from '~/db/settings-db';

const settings = ref<{
	usePreciseLocation?: boolean;
}>({});

async function setPreciseLocationStatus(enabled: boolean) {
	settings.value.usePreciseLocation = enabled;
	await setLocationPreference(enabled);
}

export function useSettings() {
	async function init() {
		settings.value.usePreciseLocation = await getLocationPreference();
	}

	return {
		settings,
		init,
		setPreciseLocationStatus,
	};
}
