import { defaultPatterns, WebHaptics } from 'web-haptics';

const haptics = new WebHaptics();

export default defineNuxtPlugin((app) => {
	app.vueApp.directive('vibrate', {
		mounted(el) {
			el.addEventListener('click', vibrate);
		},
		unmounted(el) {
			el.removeEventListener('click', vibrate);
		},
	});
});

function vibrate() {
	haptics.trigger(defaultPatterns.light);
}
