import { vibrate } from '~/plugins/vibrate.client';
import type { BusStop } from '~~/shared/types/BusStop';

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

	const circleColor = ref<string>('#E9EFEE');
	const outlineColor = ref<string>('#6F7978');
	const textColor = ref<string>('#161D1C');
	const busColor = ref<string>('#006A66');
	const busTextColor = ref<string>('#ffffff');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function handleStopClick(e: any) {
		vibrate();

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
			const surfaceContainerVar = style
				.getPropertyValue('--md-sys-color-surface-container')
				.trim();
			const onSurfaceVar = style.getPropertyValue('--md-sys-color-on-surface').trim();

			if (primaryVar) {
				console.log('Primary variable:', primaryVar);
				busColor.value = primaryVar;
			}

			if (onPrimaryVar) {
				console.log('On primary variable:', onPrimaryVar);
				busTextColor.value = onPrimaryVar;
			}

			if (outlineVar) {
				console.log('Outline variable:', outlineVar);
				outlineColor.value = outlineVar;
			}

			if (onSurfaceVar) {
				console.log('On surface variable:', onSurfaceVar);
				textColor.value = onSurfaceVar;
			}

			if (surfaceContainerVar) {
				console.log('Surface container variable:', surfaceContainerVar);
				circleColor.value = surfaceContainerVar;
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
		busColor,
		busTextColor,
		handleStopClick,
	};
}
