<script setup lang="ts">
import type { BusStop } from '~/types/BusStop';

const props = defineProps<{
	stop: BusStop;
}>();

const { stop } = toRefs(props);

const router = useRouter();
</script>

<template>
	<m3e-card
		actionable
		@click="
			router.push({
				name: 'bus',
				query: {
					stop: stop.code,
				},
			})
		"
	>
		<div slot="header" class="header">
			<m3e-avatar>
				<Icon name="material-symbols:bus-map-pin-outline" />
			</m3e-avatar>
			<m3e-heading variant="title" size="large">{{ stop.name }}</m3e-heading>
		</div>
		<div slot="content" class="content">
			<span>{{ stop.road }} ({{ stop.code }})</span>
		</div>
	</m3e-card>
</template>

<style lang="css" scoped>
.header {
	display: flex;
	flex-direction: row;
	gap: 16px;
}

.content {
	box-sizing: border-box;
	margin-top: 8px;
}
</style>
