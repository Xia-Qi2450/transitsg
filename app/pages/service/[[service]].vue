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

const router = useRouter();

const serviceInput = useTemplateRef<HTMLInputElement>('serviceInput');

const serviceResults = ref<string[]>([]);
const stops = ref<BusStop[]>([]);

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

onMounted(async () => {
	stops.value =
		(
			await $fetch<Geojson>('/api/bus-stops', {
				method: 'GET',
			})
		).features?.map((f) => f.properties) ?? [];
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
			<BusService v-if="stops" :stops="stops" />
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
