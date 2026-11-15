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
        <label htmlFor={id}>Destino de llegada</label>
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
        Al terminar el despegue entrarás a este mapa con tu tripulante y su traje espacial.
      </p>
    </div>
  )
}
