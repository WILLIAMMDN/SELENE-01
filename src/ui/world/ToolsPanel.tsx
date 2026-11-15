import { TOOL_ACTIONS } from '../../world/tools/toolLayout'

export default function ToolsPanel({ onClose }: { onClose: () => void }) {
  const play = (id: string) => {
    window.dispatchEvent(new CustomEvent('selene-tool-action', { detail: id }))
    onClose()
  }
  return (
    <>
      <span className="paper-kicker">TALLER / BANCO DE HERRAMIENTAS</span>
      <h2 id="dialog-title">Conoce tus herramientas.</h2>
      <p>
        Selecciona una herramienta para verla salir del cofre, mostrar su movimiento y volver a su
        sitio.
      </p>
      <div className="menu-grid">
        {TOOL_ACTIONS.map(([id, name, description]) => (
          <button key={id} onClick={() => play(id)}>
            <strong>{name}</strong>
            <small>{description}</small>
          </button>
        ))}
      </div>
      <div className="menu-grid">
        <button onClick={() => play('open')}>Abrir cofre</button>
        <button onClick={() => play('close')}>Cerrar cofre</button>
      </div>
    </>
  )
}
