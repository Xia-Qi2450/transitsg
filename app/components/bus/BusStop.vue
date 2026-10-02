<script setup lang="ts">
import { addPinnedBusStop, deletePinnedBusStop, getPinnedBusStops } from '~/db/bus-db';
import type { BusStop } from '~~/shared/types/BusStop';
import { M3eSnackbar } from '@m3e/web/snackbar';
import { useSettings } from '~/composables/settings';
import { vibrate } from '~/plugins/vibrate.client';

const props = defineProps<{
	stops: BusStop[];
}>();

const { stops } = toRefs(props);

const emit = defineEmits<{
	location: [];
}>();

const route = useRoute();

const router = useRouter();

const { settings, refreshPreciseLocation, setPreciseLocationStatus } = useSettings();

const stopId = computed(() => route.params.stop);

const stop = ref<BusStop | null>(null);
const arrivals = ref<BusArrival[]>([]);
const now = ref<number>(Date.now());
const isPinned = ref<boolean>(false);

let timeInterval: ReturnType<typeof setInterval> | null = null;

const visibleArrivals = computed(() => {
	return arrivals.value.filter((a) => !hasPassedArrival(a));
});

async function refreshArrivals(s: BusStop) {
	console.log('Refreshing arrivals.');

	arrivals.value = await $fetch<BusArrival[]>('/api/bus-arrivals', {
		method: 'GET',
		params: {
			stopCode: s.code,
		},
	});
}

function hasPassedArrival(a: BusArrival) {
	const arrival = a?.NextBus?.EstimatedArrival;
	if (!arrival) return false;
	const arrivalTime = new Date(arrival).getTime();
	return now.value - arrivalTime > 30000;
}

async function togglePin() {
	if (!stop.value) {
		return;
	}

	if (isPinned.value) {
		await deletePinnedBusStop(stop.value.code);
	} else {
		await addPinnedBusStop(toRaw(stop.value));
	}

	isPinned.value = !isPinned.value;
}

async function enablePreciseLocation() {
	const location = await getCurrentLocation();
	if (location) {
		await setPreciseLocationStatus(true);
		emit('location');
	} else {
		M3eSnackbar.open('Geolocation API not supported by browser');
		await setPreciseLocationStatus(false);
	}
}

watch(
	stop,
	async (s) => {
		if (!s) return;
		await refreshArrivals(s);
		isPinned.value = (await getPinnedBusStops()).map((stop) => stop.code).includes(s.code);
		console.log('Is pinned:', isPinned.value);
	},
	{ immediate: true },
);

onBeforeRouteUpdate((to) => {
	if (typeof to.params.stop === 'string') {
		stop.value = getStop(stops.value, to.params.stop);
	}
});

onMounted(async () => {
	if (typeof stopId.value === 'string') {
		stop.value = getStop(stops.value, stopId.value);
	}

	timeInterval = setInterval(async () => {
		now.value = Date.now();

		const includesPastArrival = arrivals.value.some((a) => {
			return hasPassedArrival(a);
		});

		if (includesPastArrival && stop.value) {
			await refreshArrivals(stop.value);
		}
	}, 30000);
});

onMounted(async () => {
	await refreshPreciseLocation();
});

onBeforeUnmount(() => {
	if (timeInterval) clearInterval(timeInterval);
});
</script>

<template>
	<m3e-card v-if="stop">
		<div slot="header" class="header">
			<m3e-heading variant="title" size="large">{{ stop.name }}</m3e-heading>
			<m3e-icon-button v-vibrate @click="togglePin()">
				<Icon v-if="isPinned" name="material-symbols:keep" />
				<Icon v-else name="material-symbols:keep-outline" />
			</m3e-icon-button>
		</div>
		<div slot="content" class="content">
			<span>{{ stop.road }} ({{ stop.code }})</span>
			<m3e-expansion-panel class="arrivals-panel" @opening="vibrate()">
				<span slot="header">Bus arrivals</span>
				<m3e-action-list v-if="arrivals && arrivals.length !== 0" variant="segmented">
					<m3e-list-action
						v-for="arrival in visibleArrivals"
						:key="arrival.ServiceNo"
						@click="
							router.push({
								name: 'bus-service',
								params: {
									service: arrival.ServiceNo,
								},
							})
						"
					>
						<span>
							<span class="bus-number">{{ arrival.ServiceNo }}</span>
							<span>{{ ' ' }}</span>
							<span v-if="getStopName(stops, arrival.NextBus.DestinationCode)">
								for {{ getStopName(stops, arrival.NextBus.DestinationCode) }}
							</span>
							<span>{{ ' ' }}</span>
							<span class="time-to-arrival">
								{{ timeToArrival(arrival.NextBus.EstimatedArrival, now) }}
							</span>
						</span>
						<span v-if="arrival.NextBus2.EstimatedArrival" slot="supporting-text">
							Also {{ timeToArrival(arrival.NextBus2.EstimatedArrival, now)
							}}<span v-if="arrival.NextBus3.EstimatedArrival"
								>, {{ timeToArrival(arrival.NextBus3.EstimatedArrival, now) }}</span
							>
						</span>
					</m3e-list-action>
				</m3e-action-list>
				<div v-else class="loading-container">
					<m3e-loading-indicator />
				</div>
			</m3e-expansion-panel>
		</div>
	</m3e-card>
	<m3e-card v-else>
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
</template>

<style lang="css" scoped>
.content {
	display: flex;
	flex-direction: column;
	gap: 4px;
	box-sizing: border-box;
	margin-top: 8px;
}

.arrivals-panel {
	--m3e-expansion-panel-content-padding: 0;
	--m3e-expansion-panel-open-shape: 8px;
	--m3e-expansion-panel-shape: 8px;
}

.loading-container {
	display: flex;
	width: 100%;
	align-items: center;
	justify-content: center;
}

.bus-number {
	padding: 4px;
	box-sizing: border-box;
	border-radius: 8px;
	background-color: var(--md-sys-color-primary-container);
	color: var(--md-sys-color-on-primary-container);
	width: fit-content;
	height: fit-content;
}

.time-to-arrival {
	color: var(--md-sys-color-secondary);
	width: fit-content;
	height: fit-content;
}

.header {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}
</style>
