import type { BusOperator } from '~~/shared/types/BusOperator';

export function getOperatorName(code: BusOperator): string {
	switch (code) {
		case 'SBST': {
			return 'SBS Transit';
		}
		case 'SMRT': {
			return 'SMRT Corporation';
		}
		case 'TTS': {
			return 'Tower Transit Singapore';
		}
		case 'GAS': {
			return 'Go Ahead Singapore';
		}
	}
}
