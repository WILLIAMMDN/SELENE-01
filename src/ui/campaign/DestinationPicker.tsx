import { useId } from 'react'
import { LAUNCH_DESTINATIONS, type LaunchDestination } from '../../game/launchJourney'

export default function DestinationPicker({
  value,
  onChange,
}: {
  value: LaunchDestination
  onChange: (destination: LaunchDestination) => void
}) {
  const id = useId()
  return (
    <div>
      <h2>
        <label htmlFor={id}>Mapa para explorar después de la simulación</label>
      </h2>
      <select
        id={id}
        value={value}
        aria-describedby={`${id}-help`}
        onChange={(event) => onChange(event.target.value as LaunchDestination)}
      >
        {LAUNCH_DESTINATIONS.map((destination) => (
          <option key={destination.id} value={destination.id}>
            {destination.name} · {destination.place}
          </option>
        ))}
      </select>
      <p className="field-help" id={`${id}-help`}>
        Es un mapa opcional del juego. La campaña científica de ODYSSEY sigue en órbita lunar;
        elegir Marte no representa que esa nave viaje allí ni una misión humana de NASA.
      </p>
    </div>
  )
}
