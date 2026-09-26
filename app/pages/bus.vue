<script setup lang="ts">
import type { BusStop } from '~/types/BusStop';

definePageMeta({
	title: 'Bus',
});

useSeoMeta({
	title: 'Bus',
});

const route = useRoute();

const router = useRouter();

const { geojson, allStops } = useBusStops();

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
		name: 'bus',
		query: {
			stop: properties.code,
		},
	});
}

function zoomToStop(queryStop: string) {
	const stop = geojson.value?.features.find((f) => f.properties.code === queryStop);
	if (stop) {
		center.value = {
			lng: stop.geometry.coordinates[0]!,
			lat: stop.geometry.coordinates[1]!,
		};
		zoom.value = 15;
	}
}

onBeforeRouteUpdate((to) => {
	if (to.query.stop && typeof to.query.stop === 'string') {
		zoomToStop(to.query.stop);
	}
});

onMounted(() => {
	if (route.query.stop && typeof route.query.stop === 'string') zoomToStop(route.query.stop);

	const content = document.querySelector('#content');
	if (content) {
		const style = window.getComputedStyle(content);

		const primaryVar = style.getPropertyValue('--md-sys-color-primary').trim();
		const outlineVar = style.getPropertyValue('--md-sys-color-outline').trim();

		if (primaryVar) {
			console.log('Primary variable:', primaryVar);
			circleColor.value = primaryVar;
		}

		if (outlineVar) {
			console.log('Outline variable:', outlineVar);
			outlineColor.value = outlineVar;
		}
	}
});
</script>

<template>
	<div class="bg">
		<div class="pg">
			<m3e-heading class="heading" variant="headline" size="large">Bus Stops</m3e-heading>
			<BusStop v-if="allStops && allStops.length !== 0" :stops="allStops" />
			<ClientOnly>
				<MglMap v-if="geojson" :map-style="style" :center="center" :zoom="zoom">
					<MglGeoJsonSource source-id="stops" :data="toRaw(geojson)">
						<MglCircleLayer
							layer-id="stops"
							:paint="{
								'circle-color': circleColor,
								'circle-radius': 12,
								'circle-stroke-width': 1,
								'circle-stroke-color': outlineColor,
							}"
							@click="handleStopClick"
						/>
					</MglGeoJsonSource>
					<MglNavigationControl />
				</MglMap>
			</ClientOnly>
		</div>
	</div>
</template>

<style lang="css" scoped>
.bg {
	width: 100%;
	height: 100%;
	box-sizing: border-box;
	background-color: var(--md-sys-color-surface-container);
}

.pg {
	width: 100%;
	height: 100%;
	min-height: 0;
	overflow-y: auto;
	background-color: var(--md-sys-color-surface);
	border-radius: 32px;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	padding: 16px;
	gap: 16px;
}

.pg::-webkit-scrollbar {
	display: none;
}

.heading {
	color: var(--md-sys-color-on-surface);
}
</style>

<style lang="css">
.maplibregl-map {
	border-radius: 16px;
	min-height: 50svh;
	box-sizing: border-box;
}
</style>
