<script setup lang="ts">
import type { M3eAutocompleteElement } from '@m3e/web/autocomplete';
import BusService from '~/components/bus/BusService.vue';
import { vibrate } from '~/plugins/vibrate.client';
import type { BusStop } from '~~/shared/types/BusStop';

definePageMeta({
	title: 'Bus Service',
	name: 'bus-service',
	alias: '/services',
});

const route = useRoute();

const serviceNumber = ref<string | null>(
	typeof route.params.service === 'string' ? route.params.service : null,
);

useSeoMeta({
	title: () => (serviceNumber.value ? `Bus Service ${serviceNumber.value}` : 'Bus Services'),
	description: () =>
		serviceNumber.value
			? `View bus service ${serviceNumber.value} on transitsg, a free and open-source web app made by (ing) Studios.`
			: 'Check bus services on transitsg, a free and open-source web app made by (ing) Studios.',
	ogTitle: () =>
		serviceNumber.value ? `${serviceNumber.value} | transitsg` : 'Bus Services | transitsg',
	ogUrl: () =>
		serviceNumber.value
			? `https://transitsg.ingstudios.dev/service/${serviceNumber.value}`
			: 'https://transitsg.ingstudios.dev/service',
	ogDescription: () =>
		serviceNumber.value
			? `View bus stop ${serviceNumber.value} on transitsg, a free and open-source web app made by (ing) Studios.`
			: 'Check bus timings and bus stops on transitsg, a free and open-source web app made by (ing) Studios.',
	ogImage: 'https://transitsg.ingstudios.dev/og_bus.png',
	ogImageWidth: 1200,
	ogImageHeight: 630,
	ogSiteName: 'transitsg - all your Singapore transit needs in one app',
});

const router = useRouter();

const { style, zoom, center, circleColor, outlineColor, textColor, handleStopClick } = useBus();

const serviceInput = useTemplateRef<HTMLInputElement>('serviceInput');

const serviceResults = ref<string[]>([]);
const stops = ref<BusStop[]>([]);
const routeA = ref<BusRoute[] | null>(null);
const routeB = ref<BusRoute[] | null>(null);
const geojson = ref<Geojson | null>(null);

const routeAMap = computed(() => routeA.value?.map((r) => r.BusStopCode));
const routeBMap = computed(() => routeB.value?.map((r) => r.BusStopCode));

const geojsonRouteOnly = computed<Geojson>(() => {
	const featuresA =
		geojson.value?.features
			.filter((f) => routeAMap.value?.includes(f.properties.code))
			.reverse()
			.map((feature, idx) => {
				return {
					...feature,
					properties: {
						...feature.properties,
						index: `#${idx + 1}`,
					},
				};
			}) || [];

	const featuresB =
		geojson.value?.features
			.filter((f) => routeBMap.value?.includes(f.properties.code))
			.map((feature, idx) => {
				return {
					...feature,
					properties: {
						...feature.properties,
						index: `#${idx + 1}`,
					},
				};
			}) || [];
	return {
		type: 'FeatureCollection',
		features: [...featuresA, ...featuresB],
	};
});

async function onServiceQuery(el: M3eAutocompleteElement) {
	el.loading = true;

	const services = await $fetch('/api/query-bus-services', {
		method: 'GET',
		query: {
			query: serviceInput.value?.value || '',
		},
	});

	serviceResults.value = services;

	el.loading = false;
}

function goToService(el: M3eAutocompleteElement) {
	vibrate();
	const service = el.selected?.value;
	console.log('Navigating to:', service);
	router.push({
		name: 'bus-service',
		params: {
			service: service,
		},
	});
}

function onRouteAUpdate(route: BusRoute[]) {
	routeA.value = route;
}

function onRouteBUpdate(route: BusRoute[]) {
	routeB.value = route;
}

onMounted(async () => {
	geojson.value = await $fetch<Geojson>('/api/bus-stops', {
		method: 'GET',
	});

	stops.value = geojson.value.features?.map((f) => f.properties) ?? [];
});
</script>

<template>
	<div class="bg">
		<div class="pg">
			<m3e-heading class="heading" variant="headline" size="large">Bus Services</m3e-heading>

			<m3e-card>
				<m3e-heading slot="header" variant="title" size="large">Find a service</m3e-heading>
				<div slot="content" class="content">
					<m3e-form-field class="service-field">
						<label slot="label" for="service-input">Service number</label>
						<!-- eslint-disable-next-line vue/html-self-closing -->
						<input id="service-input" ref="serviceInput" />
					</m3e-form-field>
					<m3e-autocomplete
						for="service-input"
						@query="onServiceQuery($event.target)"
						@change="goToService($event.target)"
					>
						<m3e-loading-indicator slot="loading" />
						<m3e-option v-for="result in serviceResults" :key="result">
							{{ result }}
						</m3e-option>
					</m3e-autocomplete>
				</div>
			</m3e-card>
			<BusService
				v-if="stops"
				:stops="stops"
				@route-a-update="onRouteAUpdate"
				@route-b-update="onRouteBUpdate"
			/>
			<ClientOnly>
				<MglMap :map-style="style" :center="center" :zoom="zoom">
					<MglGeoJsonSource
						source-id="stops"
						:data="toRaw(geojsonRouteOnly)"
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
							layer-id="stops"
							:filter="['!', ['has', 'point_count']]"
							:paint="{
								'circle-color': circleColor,
								'circle-radius': 16,
								'circle-stroke-width': 1,
								'circle-stroke-color': outlineColor,
							}"
							@click="handleStopClick"
						/>
						<MglSymbolLayer
							layer-id="stops-index"
							:filter="['!', ['has', 'point_count']]"
							:layout="{
								'text-field': ['get', 'index'],
								'text-size': 12,
							}"
							:paint="{
								'text-color': textColor,
							}"
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

.content {
	display: flex;
	flex-direction: column;
	gap: 4px;
	box-sizing: border-box;
	margin-top: 8px;
}

.service-field {
	margin: 4px 0;
}
</style>

<style lang="css">
.maplibregl-map {
	border-radius: 16px;
	min-height: 50svh;
	box-sizing: border-box;
}
</style>
