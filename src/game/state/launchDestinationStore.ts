import { useSyncExternalStore } from 'react'
import { createPersistedStore } from '../../shared/persistence/createPersistedStore'
import { isLaunchDestination, type LaunchDestination } from '../launchJourney'

export const launchDestinationStore = createPersistedStore<LaunchDestination>({
  key: 'selene-launch-destination-v1',
  initial: () => 'moon',
  decode: (value) => (isLaunchDestination(value) ? value : undefined),
})

export const useLaunchDestination = () =>
  useSyncExternalStore(launchDestinationStore.subscribe, launchDestinationStore.getSnapshot)
