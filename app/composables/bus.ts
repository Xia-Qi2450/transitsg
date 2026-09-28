import type { BusStop } from '~/types/BusStop';

export function useBus() {
	const route = useRoute();

	const router = useRouter();

	const style = 'https://tiles.openfreemap.org/styles/liberty';

	const zoom = ref<number>(10);
	const center = ref<{
		lng: number;
		lat: number;
	}>({
		lng: 103.8501,
		lat: 1.2897,
	});

	const circleColor = ref<string>('#006A66');
	const outlineColor = ref<string>('#6F7978');
	const textColor = ref<string>('#ffffff');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function handleStopClick(e: any) {
		console.log(e);

		const feature = e.features[0];
		if (!feature) {
			console.error('No feature found.');
			return;
		}

		const properties: BusStop = feature.properties;

		router.push({
			name: 'bus-stop',
			params: {
				stop: properties.code,
			},
		});
	}

	onMounted(() => {
		const content = document.querySelector('#content');
		if (content) {
			const style = window.getComputedStyle(content);

			const primaryVar = style.getPropertyValue('--md-sys-color-primary').trim();
			const outlineVar = style.getPropertyValue('--md-sys-color-outline').trim();
			const onPrimaryVar = style.getPropertyValue('--md-sys-color-on-primary').trim();

			if (primaryVar) {
				console.log('Primary variable:', primaryVar);
				circleColor.value = primaryVar;
			}

			if (outlineVar) {
				console.log('Outline variable:', outlineVar);
				outlineColor.value = outlineVar;
			}

			if (onPrimaryVar) {
				console.log('On primary variable:', onPrimaryVar);
				textColor.value = onPrimaryVar;
			}
		}
	});

	return {
		route,
		style,
		zoom,
		center,
		circleColor,
		outlineColor,
		textColor,
		handleStopClick,
	};
}
