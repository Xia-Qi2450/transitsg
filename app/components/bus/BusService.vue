<script setup lang="ts">
import { vibrate } from '~/plugins/vibrate.client';
import type { BusStop } from '~~/shared/types/BusStop';

const props = defineProps<{
	stops: BusStop[];
}>();

const { stops } = toRefs(props);

const emit = defineEmits<{
	routeAUpdate: [route: BusRoute[]];
	routeBUpdate: [route: BusRoute[]];
}>();

const route = useRoute();

const router = useRouter();

const services = ref<BusService[]>([]);
const routeA = ref<BusRoute[]>([]);
const routeB = ref<BusRoute[]>([]);

async function fetchRouteInfo(serviceNumber: string) {
	services.value = await $fetch<BusService[]>('/api/bus-services', {
		method: 'GET',
		query: {
			service: serviceNumber,
		},
	});
}

async function fetchRouteA(serviceNumber: string) {
	routeA.value = await $fetch<BusRoute[]>('/api/bus-service-stops', {
		method: 'GET',
		query: {
			service: serviceNumber,
			direction: 1,
		},
	});
	emit('routeAUpdate', routeA.value);
}

async function fetchRouteB(serviceNumber: string) {
	routeB.value = await $fetch<BusRoute[]>('/api/bus-service-stops', {
		method: 'GET',
		query: {
			service: serviceNumber,
			direction: 2,
		},
	});
	emit('routeBUpdate', routeB.value);
}

function goToStop(code: string) {
	router.push({
		name: 'bus-stop',
		params: {
			stop: code,
		},
	});
}

onBeforeRouteUpdate(async (to) => {
	if (typeof to.params.service === 'string') {
		await fetchRouteInfo(to.params.service);

		if (services.value[0]) {
			await fetchRouteA(to.params.service);
		}

		if (services.value[1]) {
			await fetchRouteB(to.params.service);
		}
	}
});

onMounted(async () => {
	if (typeof route.params.service === 'string') {
		await fetchRouteInfo(route.params.service);

		if (services.value[0]) {
			await fetchRouteA(route.params.service);
		}

		if (services.value[1]) {
			await fetchRouteB(route.params.service);
		}
	}
});
</script>

<template>
	<m3e-card v-if="route.params.service">
		<m3e-heading slot="header" variant="title" size="large">
			Service {{ route.params.service }}
		</m3e-heading>
		<div slot="content" class="content">
			<m3e-expansion-panel
				v-for="(service, i) in services"
				:key="`${service.ServiceNo}-${service.Direction}`"
				class="service-panel"
				@opening="vibrate()"
				@closing="vibrate()"
			>
				<span slot="header">For {{ getStopName(stops, service.DestinationCode) }}</span>

				<div class="direction-content">
					<m3e-list variant="segmented">
						<m3e-list-action v-vibrate @click="goToStop(service.DestinationCode)">
							<m3e-avatar slot="leading">
								<Icon name="material-symbols:pin-drop-outline" />
							</m3e-avatar>
							To {{ getStopName(stops, service.DestinationCode) }}
						</m3e-list-action>
						<m3e-list-action v-vibrate @click="goToStop(service.OriginCode)">
							<m3e-avatar slot="leading">
								<Icon name="material-symbols:pin-drop-outline" />
							</m3e-avatar>
							From {{ getStopName(stops, service.OriginCode) }}
						</m3e-list-action>
						<m3e-list-item>
							<m3e-avatar slot="leading">
								<Icon name="material-symbols:bus-railway-outline" />
							</m3e-avatar>
							Operated by {{ getOperatorName(service.Operator) }}
						</m3e-list-item>
						<m3e-list-item>
							<m3e-avatar slot="leading">
								<Icon name="material-symbols:directions-bus-outline" />
							</m3e-avatar>
							{{ service.Category }} service
						</m3e-list-item>
						<m3e-list-item v-if="service.LoopDesc">
							<m3e-avatar slot="leading">
								<Icon name="material-symbols:repeat-outline" />
							</m3e-avatar>
							Loops on {{ service.LoopDesc }}
						</m3e-list-item>
					</m3e-list>

					<m3e-heading variant="title" size="medium">Stops</m3e-heading>

					<m3e-action-list variant="segmented">
						<m3e-list-action
							v-for="(stop, j) in i === 0 ? routeA : routeB"
							:key="`${stop.BusStopCode}-${i}`"
							v-vibrate
							@click="goToStop(stop.BusStopCode)"
						>
							<m3e-avatar slot="leading">
								<Icon
									v-if="
										stop.BusStopCode === service.OriginCode ||
										stop.BusStopCode === service.DestinationCode
									"
									name="material-symbols:pin-drop-outline"
								/>
								<span v-else>{{ j + 1 }}</span>
							</m3e-avatar>
							{{ getStopName(stops, stop.BusStopCode) }}
							<span slot="supporting-text"
								>{{ getStop(stops, stop.BusStopCode)?.road }} ({{
									stop.Distance
								}}
								km)</span
							>
						</m3e-list-action>
					</m3e-action-list>
				</div>
			</m3e-expansion-panel>
		</div>
	</m3e-card>
</template>

<style lang="css" scoped>
.service-panel {
	--m3e-expansion-panel-content-padding: 0;
	--m3e-expansion-panel-open-shape: 8px;
	--m3e-expansion-panel-shape: 8px;
}

.direction-content {
	display: flex;
	flex-direction: column;
	gap: 8px;
	box-sizing: border-box;
}

.content {
	display: flex;
	flex-direction: column;
	gap: 4px;
	box-sizing: border-box;
	margin-top: 8px;
}
</style>
