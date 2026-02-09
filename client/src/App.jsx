import { useState } from 'react';
import MenuPrincipal from './components/MenuPrincipal';
import OpcionesJugador from './components/OpcionesJugador';
import Registro from './components/Registro';
import IngresoCodigo from './components/IngresoCodigo';
import RecuperarCodigo from './components/RecuperarCodigo';
import SelectorJuego from './components/SelectorJuego';
import JuegoMemoria from './components/JuegoMemoria';
import JuegoAtrapaFruta from './components/JuegoAtrapaFruta';
import JuegoTopo from './components/JuegoTopo';
import JuegoPalabra from './components/JuegoPalabra';


function App() {
  const [pantalla, setPantalla] = useState('menu'); // menu, opciones, registro, ingreso, selector, recuperar, juego1, juego2, juego3, juego4
  const [usuario, setUsuario] = useState(null);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {pantalla === 'menu' && (
        <MenuPrincipal onJugar={() => setPantalla('opciones')} />
      )}

      {pantalla === 'opciones' && (
        <OpcionesJugador
          onRegistrar={() => setPantalla('registro')}
          onIngresar={() => setPantalla('ingreso')}
          onRecuperar={() => setPantalla('recuperar')}
          onVolver={() => setPantalla('menu')}
        />
      )}

      {pantalla === 'registro' && (
        <Registro
          onVolver={() => setPantalla('opciones')}
        />
      )}

      {pantalla === 'ingreso' && (
        <IngresoCodigo
          onVolver={() => setPantalla('opciones')}
          onIngresoExitoso={(user) => {
            setUsuario(user);
            setPantalla('selector');
          }}
        />
      )}

      {pantalla === 'recuperar' && (
        <RecuperarCodigo
          onVolver={() => setPantalla('opciones')}
        />
      )}

      {pantalla === 'selector' && (
        <SelectorJuego
          usuario={usuario}
          onVolver={() => setPantalla('menu')}
          onSeleccionarJuego={(id) => {
            if (id === 1) setPantalla('juego1');
            else if (id === 2) setPantalla('juego2');
            else if (id === 3) setPantalla('juego3');
            else if (id === 4) setPantalla('juego4');
            else console.log("Juego no implementado aún", id);
          }}
        />
      )}

      {pantalla === 'juego1' && (
        <JuegoMemoria
          usuario={usuario}
          onVolver={() => setPantalla('selector')}
        />
      )}

      {pantalla === 'juego2' && (
        <JuegoAtrapaFruta
          usuario={usuario}
          onVolver={() => setPantalla('selector')}
        />
      )}

      {pantalla === 'juego3' && (
        <JuegoTopo
          usuario={usuario}
          onVolver={() => setPantalla('selector')}
        />
      )}

      {pantalla === 'juego4' && (
        <JuegoPalabra
          usuario={usuario}
          onVolver={() => setPantalla('selector')}
        />
      )}
    </div>
  );
}

export default App;
