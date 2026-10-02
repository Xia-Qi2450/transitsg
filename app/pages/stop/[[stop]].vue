<script setup lang="ts">
import type { Geojson } from '~~/shared/types/Geojson';
import { GeolocateControl, type Map } from 'maplibre-gl';

definePageMeta({
	title: 'Bus Stop',
	name: 'bus-stop',
	alias: ['/bus'],
});

const { data: geojson } = await useFetch<Geojson>('/api/bus-stops');

const allStops = computed(() => {
	console.log('Initializing all stops:', geojson.value);
	return geojson.value?.features?.map((f) => f.properties) ?? [];
});

const map = useTemplateRef('map');

const { route, style, zoom, center, circleColor, outlineColor, textColor, handleStopClick } =
	useBus();

const stopId = computed(() => (typeof route.params.stop === 'string' ? route.params.stop : null));

const stop = computed(() => {
	if (!stopId.value || !allStops.value || allStops.value.length === 0) return null;
	return getStop(allStops.value, stopId.value);
});

useSeoMeta({
	title: () => (stop.value ? stop.value.name : 'Bus'),
	description: () =>
		stop.value
			? `View bus stop ${stop.value.name} on transitsg, a free and open-source web app made by (ing) Studios.`
			: 'Check bus timings and bus stops on transitsg, a free and open-source web app made by (ing) Studios.',
	ogTitle: () => (stop.value ? `${stop.value.name} | transitsg` : 'Bus | transitsg'),
	ogUrl: () =>
		stop.value
			? `https://transitsg.ingstudios.dev/stop/${stop.value.code}`
			: 'https://transitsg.ingstudios.dev/bus',
	ogDescription: () =>
		stop.value
			? `View bus stop ${stop.value.name} on transitsg, a free and open-source web app made by (ing) Studios.`
			: 'Check bus timings and bus stops on transitsg, a free and open-source web app made by (ing) Studios.',
	ogImage: 'https://transitsg.ingstudios.dev/og_bus.png',
	ogImageWidth: 1200,
	ogImageHeight: 630,
	ogSiteName: 'transitsg - all your Singapore transit needs in one app',
});

const { settings, refreshPreciseLocation } = useSettings();

function zoomToStop(queryStop: string) {
	console.log('Geojson:', geojson.value);
	const stop = geojson.value?.features.find((f) => f.properties.code === queryStop);
	if (stop) {
		center.value = {
			lng: stop.geometry.coordinates[0]!,
			lat: stop.geometry.coordinates[1]!,
		};
		zoom.value = 15;
	}
}

function addGeolocateControl() {
	const geolocate = new GeolocateControl({
		positionOptions: { enableHighAccuracy: true },
		trackUserLocation: true,
		showUserLocation: true,
		showAccuracyCircle: true,
	});
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const maplibreMap: Map = (map.value as any).map;
	maplibreMap.addControl(geolocate);

	if (!stopId.value) {
		// IMPORTANT: Small delay to ensure that maplibre has added the control then zoom in
		setTimeout(() => {
			geolocate.trigger();
		}, 10);
	}
}

watch(
	settings,
	async (newSettings) => {
		if (newSettings.usePreciseLocation) {
			console.log('New user precise location:', newSettings.usePreciseLocation);
			addGeolocateControl();
		}
	},
	{ immediate: true, deep: true },
);

onBeforeRouteUpdate((to) => {
	if (typeof to.params.stop === 'string') {
		zoomToStop(to.params.stop);
	}
});

onMounted(async () => {
	if (typeof stopId.value === 'string') {
		zoomToStop(stopId.value);
	}

	await refreshPreciseLocation();
});
</script>

<template>
	<div class="bg">
		<div class="pg">
			<m3e-heading class="heading" variant="headline" size="large">Bus Stops</m3e-heading>
			<BusStop
				v-if="allStops && allStops.length !== 0"
				:stops="allStops"
				@location="addGeolocateControl()"
			/>
			<ClientOnly>
				<MglMap v-if="geojson" ref="map" :map-style="style" :center="center" :zoom="zoom">
					<MglGeoJsonSource
						source-id="stops"
						:data="toRaw(geojson)"
						:cluster="true"
						:cluster-radius="24"
					>
						<MglCircleLayer
							layer-id="stops-cluster"
							:filter="['has', 'point_count']"
							:paint="{
								'circle-color': circleColor,
								'circle-radius': 12,
								'circle-stroke-width': 1,
								'circle-stroke-color': outlineColor,
							}"
						/>
						<MglSymbolLayer
							layer-id="stops-cluster-count"
							:filter="['has', 'point_count']"
							:layout="{
								'text-field': '{point_count_abbreviated}',
								'text-size': 12,
							}"
							:paint="{
								'text-color': textColor,
							}"
						/>

						<MglCircleLayer
							v-vibrate
							layer-id="stops"
							:filter="['!', ['has', 'point_count']]"
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
