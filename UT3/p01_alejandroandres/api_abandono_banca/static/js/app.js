// Script para gestionar la interacción del formulario y la llamada a la API
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-cliente');
  const btnCalcular = document.getElementById('btn-calcular');
  const btnText = btnCalcular.querySelector('.btn-text');
  const btnIcon = btnCalcular.querySelector('.btn-icon');
  const spinner = btnCalcular.querySelector('.spinner');

  const resultadoVacio = document.getElementById('resultado-vacio');
  const resultadoContenido = document.getElementById('resultado-contenido');
  const resultadoError = document.getElementById('resultado-error');
  const errorMensaje = document.getElementById('error-mensaje');

  const badgeRiesgo = document.getElementById('badge-riesgo');
  const badgeVeredicto = document.getElementById('badge-veredicto');
  const probabilidadValor = document.getElementById('probabilidad-valor');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const resIdCliente = document.getElementById('res-id-cliente');
  const resAbandono = document.getElementById('res-abandono');
  const resAccion = document.getElementById('res-accion');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Estado visual de carga
    btnCalcular.disabled = true;
    btnText.textContent = 'Calculando inferencia...';
    if (btnIcon) btnIcon.style.display = 'none';
    spinner.style.display = 'inline-block';
    resultadoError.style.display = 'none';

    // Construcción del objeto de entrada según el esquema Pydantic ClienteInput
    const payload = {
      id_cliente: document.getElementById('id_cliente').value.trim(),
      edad: parseInt(document.getElementById('edad').value, 10),
      ingresos_anuales: parseFloat(document.getElementById('ingresos_anuales').value),
      saldo_cuenta: parseFloat(document.getElementById('saldo_cuenta').value),
      num_productos: parseInt(document.getElementById('num_productos').value, 10),
      antiguedad_meses: parseInt(document.getElementById('antiguedad_meses').value, 10),
      tiene_tarjeta: document.getElementById('tiene_tarjeta').checked ? 1 : 0,
      tipo_cuenta: document.getElementById('tipo_cuenta').value,
      canal_preferido: document.getElementById('canal_preferido').value,
      nivel_estudios: document.getElementById('nivel_estudios').value,
      nivel_satisfaccion: document.getElementById('nivel_satisfaccion').value
    };

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let detalleError = 'Error al consultar la API.';
        try {
          const errData = await response.json();
          if (errData.detail) {
            detalleError = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch (_) {}
        throw new Error(detalleError);
      }

      const data = await response.json();

      // Renderizamos la respuesta recibida
      renderResultado(payload.id_cliente, data);

    } catch (err) {
      resultadoVacio.style.display = 'none';
      resultadoContenido.style.display = 'none';
      resultadoError.style.display = 'flex';
      errorMensaje.textContent = err.message || 'Error de conexión con el servidor.';
    } finally {
      btnCalcular.disabled = false;
      btnText.textContent = 'Calcular Riesgo de Abandono';
      if (btnIcon) btnIcon.style.display = 'inline-block';
      spinner.style.display = 'none';
    }
  });

  function renderResultado(idCliente, data) {
    resultadoVacio.style.display = 'none';
    resultadoError.style.display = 'none';
    resultadoContenido.style.display = 'flex';

    const probPct = (data.probabilidad_abandono * 100).toFixed(1);

    // Ajuste de textos y métricas
    resIdCliente.textContent = data.id_cliente || idCliente;
    probabilidadValor.textContent = `${probPct}%`;
    progressBarFill.style.width = `${Math.min(Math.max(probPct, 0), 100)}%`;
    resAbandono.textContent = data.abandono === 1 ? '1 (Cancela)' : '0 (Permanece)';
    resAccion.textContent = data.accion_recomendada;

    // Reseteo de clases de riesgo previas
    badgeRiesgo.className = 'badge';
    progressBarFill.className = 'progress-bar-fill';

    if (data.nivel_riesgo === 'Alto') {
      badgeRiesgo.textContent = 'RIESGO ALTO';
      badgeRiesgo.classList.add('badge-high');
      badgeVeredicto.textContent = 'Probabilidad alta de cancelación';
      progressBarFill.classList.add('bar-high');
    } else if (data.nivel_riesgo === 'Medio') {
      badgeRiesgo.textContent = 'RIESGO MEDIO';
      badgeRiesgo.classList.add('badge-medium');
      badgeVeredicto.textContent = 'Atención recomendada';
      progressBarFill.classList.add('bar-medium');
    } else {
      badgeRiesgo.textContent = 'RIESGO BAJO';
      badgeRiesgo.classList.add('badge-low');
      badgeVeredicto.textContent = 'Cliente fidelizado';
      progressBarFill.classList.add('bar-low');
    }
  }

  // Configuración de ejemplos predefinidos
  const ejemplos = {
    low: {
      id_cliente: 'CLI-1007',
      edad: 45,
      ingresos_anuales: 26327,
      saldo_cuenta: 0,
      num_productos: 2,
      antiguedad_meses: 98,
      tiene_tarjeta: true,
      tipo_cuenta: 'Ahorro',
      canal_preferido: 'Oficina',
      nivel_estudios: 'Grado',
      nivel_satisfaccion: 'Muy Alto'
    },
    medium: {
      id_cliente: 'CLI-1002',
      edad: 39,
      ingresos_anuales: 13335,
      saldo_cuenta: 4586,
      num_productos: 2,
      antiguedad_meses: 31,
      tiene_tarjeta: true,
      tipo_cuenta: 'Ahorro',
      canal_preferido: 'App Movil',
      nivel_estudios: 'Grado',
      nivel_satisfaccion: 'Alto'
    },
    high: {
      id_cliente: 'CLI-1001',
      edad: 40,
      ingresos_anuales: 13715,
      saldo_cuenta: 0,
      num_productos: 2,
      antiguedad_meses: 11,
      tiene_tarjeta: false,
      tipo_cuenta: 'Corriente',
      canal_preferido: 'App Movil',
      nivel_estudios: 'Grado',
      nivel_satisfaccion: 'Medio'
    }
  };

  // Asignar listeners a los botones de ejemplo
  document.querySelectorAll('.btn-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const tipo = btn.getAttribute('data-example');
      const datos = ejemplos[tipo];
      if (!datos) return;

      document.getElementById('id_cliente').value = datos.id_cliente;
      document.getElementById('edad').value = datos.edad;
      document.getElementById('ingresos_anuales').value = datos.ingresos_anuales;
      document.getElementById('saldo_cuenta').value = datos.saldo_cuenta;
      document.getElementById('num_productos').value = datos.num_productos;
      document.getElementById('antiguedad_meses').value = datos.antiguedad_meses;
      document.getElementById('tiene_tarjeta').checked = datos.tiene_tarjeta;
      document.getElementById('tipo_cuenta').value = datos.tipo_cuenta;
      document.getElementById('canal_preferido').value = datos.canal_preferido;
      document.getElementById('nivel_estudios').value = datos.nivel_estudios;
      document.getElementById('nivel_satisfaccion').value = datos.nivel_satisfaccion;

      // Disparamos automáticamente el cálculo
      form.dispatchEvent(new Event('submit'));
    });
  });
});
