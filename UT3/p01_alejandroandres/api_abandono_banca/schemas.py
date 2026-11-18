from typing import Literal, Optional
from pydantic import BaseModel, Field

class ClienteInput(BaseModel):
    id_cliente: Optional[str] = Field(default="CLI-0001", description="Código identificativo único del cliente bancario", examples=["CLI-8492"])
    edad: float = Field(ge=18.0, le=120.0, description="Edad del cliente en años (debe ser mayor de edad)", examples=[42.0])
    ingresos_anuales: float = Field(gt=0.0, description="Ingresos anuales brutos percibidos en euros", examples=[48000.0])
    saldo_cuenta: float = Field(ge=0.0, description="Saldo actual disponible en su cuenta bancaria en euros", examples=[14200.0])
    num_productos: int = Field(ge=1, le=10, description="Número de productos contratados con el banco (cuentas, tarjetas, hipotecas...)", examples=[2])
    tiene_tarjeta: int = Field(ge=0, le=1, description="Dispone de tarjeta bancaria activa (1: Sí, 0: No)", examples=[1])
    antiguedad_meses: int = Field(ge=0, le=360, description="Antigüedad del cliente en la entidad bancaria en meses", examples=[60])
    tipo_cuenta: str = Field(description="Tipo de cuenta contratada principal (Ahorro, Corriente, Nomina, Inversion)", examples=["Ahorro"])
    canal_preferido: str = Field(description="Canal de contacto y operativa preferido (App Movil, Web, Oficina, Telefono, Cajero Antiguo)", examples=["App Movil"])
    nivel_estudios: str = Field(description="Nivel educativo máximo alcanzado (Primaria, Secundaria, Grado, Master, Doctorado)", examples=["Grado"])
    nivel_satisfaccion: str = Field(description="Nivel de satisfacción expresado con la entidad (Muy Bajo, Bajo, Medio, Alto, Muy Alto)", examples=["Alto"])


class PrediccionOutput(BaseModel):
    id_cliente: Optional[str] = Field(description="Código identificador del cliente analizado", examples=["CLI-8492"])
    abandono: int = Field(description="Predicción binaria de abandono (0: Permanece en el banco, 1: Abandona)", examples=[0])
    probabilidad_abandono: float = Field(description="Probabilidad estimada de fuga del cliente entre 0.0 y 1.0", examples=[0.20])
    nivel_riesgo: Literal["Bajo", "Medio", "Alto"] = Field(description="Clasificación operativa del riesgo según reglas de negocio", examples=["Bajo"])
    accion_recomendada: str = Field(description="Sugerencia comercial personalizada para el gestor bancario", examples=["Sin acción requerida. Cliente fidelizado."])
