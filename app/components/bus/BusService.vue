<script setup lang="ts">
import type { BusStop } from '~~/shared/types/BusStop';

const props = defineProps<{
	stops: BusStop[];
}>();

const { stops } = toRefs(props);

const route = useRoute();

const services = ref<BusService[]>([]);

async function fetchRouteInfo(serviceNumber: string) {
	services.value = await $fetch<BusService[]>('/api/bus-services', {
		method: 'GET',
		query: {
			service: serviceNumber,
		},
	});
}

onBeforeRouteUpdate(async (to) => {
	if (typeof to.params.service === 'string') {
		await fetchRouteInfo(to.params.service);
	}
});

onMounted(async () => {
	if (typeof route.params.service === 'string') {
		await fetchRouteInfo(route.params.service);
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
				v-for="service in services"
				:key="`${service.ServiceNo}-${service.Direction}`"
				class="service-panel"
			>
				<span slot="header">For {{ getStopName(stops, service.DestinationCode) }}</span>
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

.content {
	display: flex;
	flex-direction: column;
	gap: 4px;
	box-sizing: border-box;
	margin-top: 8px;
}
</style>
