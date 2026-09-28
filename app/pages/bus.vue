<script setup lang="ts">
import type { Geojson } from '~/types/Geojson';
import { GeolocateControl, type Map } from 'maplibre-gl';

definePageMeta({
	title: 'Bus',
});

const { data: geojson } = await useFetch<Geojson>('/api/bus-stops');

useSeoMeta({
	title: 'Bus',
	description:
		'Check bus timings and bus stops on transitsg, a free and open-source web app made by (ing) Studios.',
	ogTitle: 'MRT | transitsg',
	ogUrl: 'https://transitsg.ingstudios.dev/bus',
	ogDescription:
		'Check bus timings and bus stops on transitsg, a free and open-source web app made by (ing) Studios.',
	ogImage: 'https://transitsg.ingstudios.dev/og_bus.png',
	ogImageWidth: 1200,
	ogImageHeight: 630,
	ogSiteName: 'transitsg - all your Singapore transit needs in one app',
});

const map = useTemplateRef('map');

const { style, zoom, center, circleColor, outlineColor, textColor, route, handleStopClick } =
	useBus();

const { settings, refreshPreciseLocation, setPreciseLocationStatus } = useSettings();

async function enablePreciseLocation() {
	console.log('Use precise location:', settings.value.usePreciseLocation);
	const location = await getCurrentLocation();
	if (location) {
		await setPreciseLocationStatus(true);
	} else {
		M3eSnackbar.open('Geolocation API not supported by browser');
		await setPreciseLocationStatus(false);
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

	if (route.name !== 'bus-stop') {
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

onMounted(async () => {
	await refreshPreciseLocation();
});
</script>

<template>
	<div class="bg">
		<div class="pg">
			<m3e-heading class="heading" variant="headline" size="large">Bus Stops</m3e-heading>
			<m3e-card>
				<m3e-heading slot="header" variant="title" size="large">
					Select a stop to view timings
				</m3e-heading>
				<div slot="content" class="content">
					<span>Select a stop from the map below to view bus arrival times and more</span>
				</div>
				<div slot="actions">
					<ClientOnly>
						<m3e-button
							v-if="!settings.usePreciseLocation"
							v-vibrate
							variant="text"
							@click="enablePreciseLocation()"
						>
							<Icon slot="icon" name="material-symbols:my-location-outline" />
							Use precise location
						</m3e-button>
					</ClientOnly>
				</div>
			</m3e-card>
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
