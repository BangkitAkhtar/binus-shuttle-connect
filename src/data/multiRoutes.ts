import { MultiRoute } from '../types';

export const multiRoutes: MultiRoute[] = [
  {
    id: 'mr1',
    label: 'Alam Sutera → Kemanggisan → Binus Square',
    stops: ['Alam Sutera', 'Kemanggisan', 'Binus Square'],
  },
  {
    id: 'mr2',
    label: 'Binus Square → Kemanggisan → Alam Sutera',
    stops: ['Binus Square', 'Kemanggisan', 'Alam Sutera'],
  },
  {
    id: 'mr3',
    label: 'Anggrek → Binus Square → Alam Sutera',
    stops: ['Anggrek', 'Binus Square', 'Alam Sutera'],
  },
  {
    id: 'mr4',
    label: 'Alam Sutera → Binus Square → Anggrek',
    stops: ['Alam Sutera', 'Binus Square', 'Anggrek'],
  },
  {
    id: 'mr5',
    label: 'Anggrek → Kemanggisan → Binus Square → Alam Sutera',
    stops: ['Anggrek', 'Kemanggisan', 'Binus Square', 'Alam Sutera'],
  },
];

export function getMultiRouteById(id: string): MultiRoute | undefined {
  return multiRoutes.find(r => r.id === id);
}
