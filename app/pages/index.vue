<script setup lang="ts">
import PinnedBusCard from '~/components/bus/PinnedBusCard.vue';
import { getPinnedBusStops } from '~/db/bus-db';
import type { BusStop } from '~/types/BusStop';
import type { TrafficIncident } from '~~/shared/types/TrafficIncident';
import type { TrainServiceMessage } from '~~/shared/types/TrainServiceMessage';

definePageMeta({
	title: 'Home',
});

useSeoMeta({
	title: 'Home',
});

const { data: trainServiceMessages } = await useFetch<TrainServiceMessage[]>(
	'/api/train-service-alerts',
);

const { data: trafficIncidents } = await useFetch<TrafficIncident[]>('/api/traffic-incidents');

const pinnedBusStops = ref<BusStop[]>([]);

onMounted(async () => {
	pinnedBusStops.value = await getPinnedBusStops();
});
</script>

<template>
	<div class="bg">
		<div class="pg">
			<m3e-heading
				v-if="pinnedBusStops && pinnedBusStops.length !== 0"
				class="heading"
				variant="headline"
				size="large"
				>Pinned Bus Stops</m3e-heading
			>
			<div v-if="pinnedBusStops && pinnedBusStops.length !== 0" class="pinned-stops">
				<PinnedBusCard
					v-for="stop in pinnedBusStops"
					:key="stop.code"
					v-vibrate
					:stop="stop"
				/>
			</div>

			<m3e-heading class="heading" variant="headline" size="large"
				>Service Alerts</m3e-heading
			>
			<m3e-card>
				<m3e-list slot="content" variant="segmented">
					<m3e-list-item v-for="alert in trainServiceMessages" :key="alert.Content">
						<m3e-avatar slot="leading">
							<Icon :name="getAlertIcon(alert.Content)" />
						</m3e-avatar>
						<span slot="overline">{{ alert.CreatedDate }}</span>
						{{ alert.Content }}
					</m3e-list-item>
				</m3e-list>
			</m3e-card>

			<m3e-heading class="heading" variant="headline" size="large"
				>Traffic Incidents</m3e-heading
			>
			<m3e-card>
				<m3e-list slot="content" variant="segmented">
					<m3e-list-item v-for="incident in trafficIncidents" :key="incident.Message">
						<m3e-avatar slot="leading">
							<Icon :name="getTrafficIcon(incident.Type)" />
						</m3e-avatar>
						<span slot="overline">{{ incident.Type }}</span>
						{{ incident.Message }}
					</m3e-list-item>
				</m3e-list>
			</m3e-card>
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
	overflow-y: scroll;
	background-color: var(--md-sys-color-surface);
	border-radius: 32px;
	padding: 16px;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.pg::-webkit-scrollbar {
	display: none;
}

.heading {
	color: var(--md-sys-color-on-surface);
}

.pinned-stops {
	display: grid;
	gap: 16px;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	grid-template-rows: auto;
	width: 100%;
}
</style>
