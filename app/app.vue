<script setup lang="ts">
import type { BusStop } from './types/BusStop';
import type { Geojson } from './types/Geojson';

const route = useRoute();

const router = useRouter();

const { isDark } = useTheme();

const { data: geojson } = await useFetch<Geojson>('/api/bus-stops');

const allStops = computed(() => {
	console.log('Initializing all stops:', geojson.value);
	return geojson.value?.features?.map((f) => f.properties) ?? [];
});

const { isMobile } = useMobile();

const searchInput = useTemplateRef<HTMLInputElement>('searchInput');

const searchSuggestions = ref<BusStop[]>([]);

async function startSearch() {
	searchSuggestions.value = await searchBusStops(allStops.value, searchInput.value?.value || '');
}

function goToStop(code: string) {
	router.push({
		name: 'bus-stop',
		params: {
			stop: code,
		},
	});
}

const routePath = computed(() => {
	return route.path.toLowerCase() || '';
});
</script>

<template>
	<div id="content" class="content" :class="isDark ? 'dark' : 'light'">
		<ClientOnly>
			<m3e-app-bar class="app-bar" centered>
				<span v-if="!isMobile" slot="leading" class="app-bar-title">{{
					$route.meta.title
				}}</span>
				<div slot="title" class="app-bar-content">
					<m3e-search-view class="search-bar" contained @query="startSearch()">
						<!-- eslint-disable vue/html-self-closing -->
						<input
							ref="searchInput"
							slot="input"
							placeholder="Search bus and MRT stops..."
						/>
						<!-- eslint-enable vue/html-self-closing -->
						<m3e-action-list>
							<m3e-list-action
								v-for="stop in searchSuggestions"
								:key="stop.code"
								v-vibrate
								@click="goToStop(stop.code)"
							>
								{{ stop.name }}
							</m3e-list-action>
						</m3e-action-list>
					</m3e-search-view>
				</div>
			</m3e-app-bar>
		</ClientOnly>
		<div class="bottom">
			<ClientOnly>
				<m3e-nav-rail class="nav-rail">
					<m3e-nav-item
						v-vibrate
						:selected.prop="routePath === '/'"
						@click="router.push('/')"
					>
						<Icon slot="icon" name="material-symbols:home-outline" />
						Home
					</m3e-nav-item>
					<m3e-nav-item
						v-vibrate
						:selected.prop="
							routePath.startsWith('/bus') || routePath.startsWith('/stop')
						"
						@click="router.push('/bus')"
					>
						<Icon slot="icon" name="material-symbols:directions-bus-outline" />
						Bus
					</m3e-nav-item>
					<m3e-nav-item
						v-vibrate
						:selected.prop="routePath.startsWith('/mrt')"
						@click="router.push('/mrt')"
					>
						<Icon slot="icon" name="material-symbols:train-outline" />
						MRT
					</m3e-nav-item>
				</m3e-nav-rail>
			</ClientOnly>

			<NuxtLayout>
				<NuxtPage :page-key="(route) => route.name as string" class="page" />
			</NuxtLayout>

			<ClientOnly>
				<m3e-nav-bar class="nav-bar" mode="compact">
					<m3e-nav-item
						v-vibrate
						:selected.prop="routePath === '/'"
						@click="router.push('/')"
					>
						<Icon slot="icon" name="material-symbols:home-outline" />
						Home
					</m3e-nav-item>
					<m3e-nav-item
						v-vibrate
						:selected.prop="
							routePath.startsWith('/bus') || routePath.startsWith('/stop')
						"
						@click="router.push('/bus')"
					>
						<Icon slot="icon" name="material-symbols:directions-bus-outline" />
						Bus
					</m3e-nav-item>
					<m3e-nav-item
						v-vibrate
						:selected.prop="routePath.startsWith('/mrt')"
						@click="router.push('/mrt')"
					>
						<Icon slot="icon" name="material-symbols:train-outline" />
						MRT
					</m3e-nav-item>
				</m3e-nav-bar>
			</ClientOnly>
		</div>
		<VitePwaManifest />
	</div>
</template>

<style lang="css" scoped>
.content {
	display: flex;
	flex-direction: column;
	width: 100svw;
	height: 100svh;
	overflow: hidden;
}

.app-bar {
	flex-shrink: 0;
	--m3e-app-bar-container-color: var(--md-sys-color-surface-container);
}

.bottom {
	flex-grow: 1;
	display: flex;
	flex-direction: row;
	min-height: 0;
}

.nav-rail {
	flex-shrink: 0;
	background-color: var(--md-sys-color-surface-container);
}

.nav-bar {
	display: none;
	flex-shrink: 0;
	background-color: var(--md-sys-color-surface-container);
}

.page {
	flex-grow: 1;
	min-height: 0;
}

.app-bar-content {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	gap: 16px;
}

.search-bar {
	min-width: 100px;
	width: 50%;
	--m3e-search-bar-container-color: var(--md-sys-color-surface);
	--m3e-search-view-container-color: var(--md-sys-color-surface);
	margin: 8px 0;
	box-sizing: border-box;
}

.app-bar-title {
	font-size: 1.6rem;
	margin: 0 16px;
	color: var(--md-sys-color-on-surface);
	width: 10svw;
	box-sizing: border-box;
}

@media (max-width: 768px) {
	.bottom {
		display: grid;
		grid-template-rows: calc(100svh - 150px) auto;
	}

	.search-bar {
		width: 100%;
	}

	.nav-rail {
		display: none;
	}

	.nav-bar {
		display: flex;
	}
}
</style>
