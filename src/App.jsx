import React, { useState, useMemo } from 'react';

// --- CONFIGURACIÓN DE RANGOS ---
const RANKS = [
  { id: 'bronce', name: 'Bronce', color: '#CD7F32', minRM: 0, nextRM: 40 },
  { id: 'plata', name: 'Plata', color: '#C0C0C0', minRM: 40, nextRM: 65 },
  { id: 'oro', name: 'Oro', color: '#FFD700', minRM: 65, nextRM: 90 },
  { id: 'platino', name: 'Platino', color: '#00E5FF', minRM: 90, nextRM: 115 },
  {
    id: 'diamante',
    name: 'Diamante',
    color: '#B388FF',
    minRM: 115,
    nextRM: 140,
  },
  { id: 'leyenda', name: 'Leyenda', color: '#FF1744', minRM: 140, nextRM: 999 },
];

const getRankByRM = (rm) => {
  return (
    RANKS.slice()
      .reverse()
      .find((r) => rm >= r.minRM) || RANKS[0]
  );
};

// --- GRUPOS MUSCULARES CON SUBDIVISIONES ANATÓMICAS ---
const MUSCLE_GROUPS = {
  pectoral: {
    name: 'Pectoral',
    subparts: [
      'Pectoral Alto (Clavicular)',
      'Pectoral Medio (Esternal)',
      'Pectoral Bajo (Costal)',
    ],
    baseMultiplier: 1.0,
  },
  espalda: {
    name: 'Espalda',
    subparts: [
      'Dorsal Ancho',
      'Trapecio Medio/Bajo',
      'Redondo Mayor y Romboides',
    ],
    baseMultiplier: 1.05,
  },
  hombros: {
    name: 'Hombros (Deltoides)',
    subparts: [
      'Deltoides Anterior',
      'Deltoides Lateral',
      'Deltoides Posterior',
    ],
    baseMultiplier: 0.65,
  },
  biceps: {
    name: 'Bíceps y Antebrazo',
    subparts: [
      'Cabeza Larga del Bíceps',
      'Cabeza Corta del Bíceps',
      'Braquial y Antebrazo',
    ],
    baseMultiplier: 0.45,
  },
  triceps: {
    name: 'Tríceps (3 Cabezas)',
    subparts: ['Cabeza Larga', 'Cabeza Lateral', 'Cabeza Medial'],
    baseMultiplier: 0.5,
  },
  abdomen: {
    name: 'Core y Abdomen',
    subparts: [
      'Recto Abdominal Superior',
      'Recto Abdominal Inferior',
      'Oblicuos Externos',
    ],
    baseMultiplier: 0.6,
  },
  cuadriceps: {
    name: 'Cuádriceps',
    subparts: [
      'Recto Femoral',
      'Vasto Lateral (Externo)',
      'Vasto Medial (Lágrima)',
    ],
    baseMultiplier: 1.35,
  },
  femoral_gluteo: {
    name: 'Isquios y Glúteo',
    subparts: ['Glúteo Mayor y Medio', 'Bíceps Femoral', 'Semitendinoso'],
    baseMultiplier: 1.3,
  },
  gemelos: {
    name: 'Gemelos y Sóleo',
    subparts: ['Gastrocnemio Interno', 'Gastrocnemio Externo', 'Sóleo'],
    baseMultiplier: 1.1,
  },
};

const DAYS_OF_WEEK = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

// --- BASE DE DATOS DE RECETAS FIT DE SUPERMERCADO ESPAÑOL (20 por categoría mediante base + variantes) ---
const MEAL_CATEGORIES = [
  'Desayunos',
  'Almuerzos',
  'Comidas',
  'Meriendas',
  'Cenas',
  'Aperitivos',
];

const BASE_RECIPES = {
  Desayunos: [
    {
      name: 'Tostada Mediterránea Proteica',
      ing: 'Pan masa madre, tomate rallado, jamón serrano sin borde graso y 2 huevos a la plancha.',
      kcal: 420,
      prot: 32,
    },
    {
      name: 'Tortitas de Avena Cheesecake',
      ing: '60g avena, 1 huevo, 100ml claras (bote Mercadona), queso fresco batido 0% y arándanos.',
      kcal: 450,
      prot: 36,
    },
    {
      name: 'Bowl Griego Crunch',
      ing: 'Yogur proteico (YoPRO/Hacendado +Proteínas), nueces, cacao puro desgrasado y plátano.',
      kcal: 380,
      prot: 28,
    },
    {
      name: 'Revuelto Ibérico en Pan Cristal',
      ing: 'Pan de cristal tostado, 2 huevos revueltos con taquitos de pavo braseado y aguacate.',
      kcal: 440,
      prot: 30,
    },
    {
      name: 'Gachas (Porridge) de Chocolate Blanco',
      ing: 'Leche desnatada, copos de avena, proteína whey sabor choco blanco y fresas.',
      kcal: 410,
      prot: 38,
    },
  ],
  Almuerzos: [
    {
      name: 'Bocadillo Integral de Lomo Embuchado',
      ing: 'Pan integral de centeno, 80g de lomo embuchado (altísimo en proteína), tomate y aceite de oliva.',
      kcal: 360,
      prot: 34,
    },
    {
      name: 'Wrap Rápido de Pollo Asado y Queso',
      ing: 'Tortilla integral, tiras de pollo al ast (de sobre saludable), queso Havarti Light y espinacas.',
      kcal: 390,
      prot: 31,
    },
    {
      name: 'Tosta de Salmón Ahumado y Queso Cottage',
      ing: '2 rebanadas pan tostado, envase de queso Cottage, salmón ahumado y eneldo.',
      kcal: 370,
      prot: 29,
    },
    {
      name: 'Tortitas de Arroz con Atún al Natural y Huevo Duro',
      ing: '4 tortitas de arroz/maíz, 2 latas de atún al natural, 1 huevo cocido picado y pimiento asado.',
      kcal: 340,
      prot: 35,
    },
    {
      name: 'Pudin de Chía y Proteína con Frutos Secos',
      ing: 'Yogur +Proteínas, semillas de chía, almendras naturales y mandarina.',
      kcal: 320,
      prot: 26,
    },
  ],
  Comidas: [
    {
      name: 'Fajitas Mexicanas de Ternera Magra',
      ing: 'Carne picada 95% magra, pimientos, cebolla, sazonador fajitas, tortillas y yogur griego natural.',
      kcal: 610,
      prot: 48,
    },
    {
      name: 'Pasta Pesto Cremoso Fit con Pollo',
      ing: 'Macarrones integrales, pechuga de pollo en dados, 1 cdta pesto + 2 cdas Philadelphia Light y cherrys.',
      kcal: 590,
      prot: 46,
    },
    {
      name: 'Smash Burger Casera con Patatas Airfryer',
      ing: '2 discos de ternera magra, pan brioche, queso cheddar light, pepinillos y patatas gajo sin aceite.',
      kcal: 650,
      prot: 52,
    },
    {
      name: 'Wok de Fideos Udon y Contramuslo Teriyaki',
      ing: 'Fideos udon, contramuslo de pollo deshuesado, brócoli, zanahoria, salsa de soja y sésamo.',
      kcal: 570,
      prot: 44,
    },
    {
      name: 'Arroz Caldoso Rápido con Gambones y Sepia',
      ing: 'Arroz redondo, sepia troceada, gambones pelados congelados, caldo de pescado en brick y azafrán.',
      kcal: 540,
      prot: 45,
    },
  ],
  Meriendas: [
    {
      name: 'Queso Fresco Batido 0% con Crema de Cacahuete',
      ing: '250g queso batido 0%, 1 cucharada crema 100% cacahuete, canela y manzana troceada.',
      kcal: 330,
      prot: 28,
    },
    {
      name: 'Sándwich Tostado de Pavo y Queso Proteico',
      ing: 'Pan de molde 100% integral, 100g pechuga de pavo 92% carne y queso lonchas +Proteínas.',
      kcal: 350,
      prot: 33,
    },
    {
      name: 'Batido Helado Frappuccino Proteico',
      ing: 'Café expreso frío, hielo picado, 250ml leche evaporada/desnatada y 1 cazo de proteína.',
      kcal: 240,
      prot: 30,
    },
    {
      name: 'Mugcake (Bizcocho al Microondas en 2 min)',
      ing: '1 huevo, 40g harina de avena, 1 cdta levadura, cacao puro, leche y 1 onza chocolate 85%.',
      kcal: 340,
      prot: 22,
    },
    {
      name: 'Rollitos de Jamón Cocido Extra y Guacamole',
      ing: '150g jamón cocido categoría extra relleno de guacamole fresco del súper y picos integrales.',
      kcal: 310,
      prot: 29,
    },
  ],
  Cenas: [
    {
      name: 'Kebab / Shawarma Casero en Pan de Pita',
      ing: 'Pan de pita, pollo marinado con curry/comino/limón, lechuga, cebolla morada y salsa yogur casera.',
      kcal: 490,
      prot: 44,
    },
    {
      name: 'Pizza Fit con Base de Tortilla o Pollo',
      ing: 'Tortilla de trigo grande, tomate frito cero, abundante mozzarella rallada light, atún y jamón.',
      kcal: 460,
      prot: 41,
    },
    {
      name: 'Salmón al Papillote o Airfryer con Espárragos',
      ing: 'Lomo de salmón fresco, espárragos trigueros, patata asada al microondas y limón.',
      kcal: 520,
      prot: 40,
    },
    {
      name: 'Tacos de Merluza o Bacalao Crujiente',
      ing: 'Filetes de merluza rebozados en copos de maíz triturados (Cornflakes sin azúcar) al horno y ensalada.',
      kcal: 430,
      prot: 42,
    },
    {
      name: 'Sartén de Huevos Rotos Saludables con Jamón',
      ing: 'Patatas hechas en airfryer (sin freír), 2 huevos a la plancha encima y 60g de jamón serrano.',
      kcal: 480,
      prot: 31,
    },
  ],
  Aperitivos: [
    {
      name: 'Edamames al Vapor con Sal Maldon y Pimentón',
      ing: 'Bolsa de edamames congelados (5 min al microondas), escamas de sal y pimentón de la Vera.',
      kcal: 190,
      prot: 17,
    },
    {
      name: 'Berberechos y Mejillones al Natural con Limón',
      ing: '1 lata de berberechos + 1 lata de mejillones al natural, limón exprimido y pimienta negra.',
      kcal: 160,
      prot: 26,
    },
    {
      name: 'Pinchos de Queso Fresco, Cherry y Anchoa',
      ing: 'Dados de queso de Burgos 0% o light, tomates cherry y filetes de anchoa o boquerón en vinagre.',
      kcal: 210,
      prot: 22,
    },
    {
      name: 'Hummus con Bastones de Zanahoria y Pimiento',
      ing: 'Tarrina de hummus clásico o de pimientos asados con verduras crujientes y 2 huevos de codorniz.',
      kcal: 230,
      prot: 12,
    },
    {
      name: 'Biltong / Cecina de León con Almendras',
      ing: '60g de cecina de vacuno (supermercados españoles) y un puñadito de almendras tostadas.',
      kcal: 240,
      prot: 28,
    },
  ],
};

// Generador automático de las 20 variantes por categoría
const generate20Recipes = (category) => {
  const bases = BASE_RECIPES[category] || [];
  const modifiers = [
    {
      suffix: '(Versión Clásica)',
      modIng: 'Tal cual la receta original con aceite de oliva virgen extra.',
      kcalDiff: 0,
      protDiff: 0,
    },
    {
      suffix: '(Versión Volumen +Fuerza)',
      modIng:
        'Añade +30g extra de hidrato (pan/arroz/avena) y 1 huevo o lata extra.',
      kcalDiff: 160,
      protDiff: 12,
    },
    {
      suffix: '(Versión Definición Extrema)',
      modIng:
        'Sustituye grasas por especias picantes y duplica la ración de verdura/claras.',
      kcalDiff: -90,
      protDiff: 6,
    },
    {
      suffix: '(Toque Gourmet Español)',
      modIng:
        'Añade pimientos del piquillo asados, ajo laminado y orégano fresco.',
      kcalDiff: 35,
      protDiff: 3,
    },
  ];
  const fullList = [];
  bases.forEach((base, idx) => {
    modifiers.forEach((mod, mIdx) => {
      fullList.push({
        id: `${category}-${idx}-${mIdx}`,
        number: fullList.length + 1,
        name: `${base.name} ${mod.suffix}`,
        ing: `${base.ing} ${mod.modIng}`,
        kcal: base.kcal + mod.kcalDiff,
        prot: base.prot + mod.protDiff,
      });
    });
  });
  return fullList;
};

export default function GymRankAppV2() {
  const [activeTab, setActiveTab] = useState('muneco');
  const [bodyView, setBodyView] = useState('front');
  const [selectedMuscle, setSelectedMuscle] = useState('pectoral');
  const [selectedDay, setSelectedDay] = useState('Lunes');

  // Registro de entrenamientos por día de la semana (L-D)
  const [workoutsByDay, setWorkoutsByDay] = useState({
    Lunes: [
      {
        id: 1,
        name: 'Press de Banca',
        muscle: 'pectoral',
        sets: 4,
        reps: 8,
        weight: 70,
      },
      {
        id: 2,
        name: 'Dominadas / Jalón',
        muscle: 'espalda',
        sets: 4,
        reps: 10,
        weight: 65,
      },
      {
        id: 3,
        name: 'Extensión Tríceps Polea',
        muscle: 'triceps',
        sets: 3,
        reps: 12,
        weight: 35,
      },
    ],
    Miércoles: [
      {
        id: 4,
        name: 'Sentadilla Libre',
        muscle: 'cuadriceps',
        sets: 4,
        reps: 8,
        weight: 90,
      },
      {
        id: 5,
        name: 'Press Militar',
        muscle: 'hombros',
        sets: 4,
        reps: 8,
        weight: 45,
      },
      {
        id: 6,
        name: 'Curl Bíceps Barra Z',
        muscle: 'biceps',
        sets: 3,
        reps: 10,
        weight: 35,
      },
    ],
    Viernes: [
      {
        id: 7,
        name: 'Peso Muerto Rumano',
        muscle: 'femoral_gluteo',
        sets: 4,
        reps: 8,
        weight: 85,
      },
      {
        id: 8,
        name: 'Press Inclinado Mancuernas',
        muscle: 'pectoral',
        sets: 4,
        reps: 10,
        weight: 64,
      },
      {
        id: 9,
        name: 'Elevación de Talones',
        muscle: 'gemelos',
        sets: 4,
        reps: 15,
        weight: 70,
      },
    ],
    Martes: [],
    Jueves: [],
    Sábado: [],
    Domingo: [],
  });

  // Formulario nuevo ejercicio
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('pectoral');
  const [newExSets, setNewExSets] = useState(4);
  const [newExReps, setNewExReps] = useState(10);
  const [newExWeight, setNewExWeight] = useState(50);

  // Estado Dieta y Coach
  const [mealCat, setMealCat] = useState('Comidas');
  const [coachQuestion, setCoachQuestion] = useState('');
  const [coachHistory, setCoachHistory] = useState([
    {
      sender: 'coach',
      text: '¡Buenas! Soy tu Coach integrado. Pregúntame dudas sobre por qué no subes de peso en un ejercicio, cómo tomar la creatina, o cómo sustituir un alimento.',
    },
  ]);

  // Estado Piques Amigos
  const [selectedRival, setSelectedRival] = useState('Carlos_Fit');
  const rivals = {
    Carlos_Fit: {
      pectoral: 95,
      espalda: 88,
      hombros: 70,
      biceps: 120,
      triceps: 95,
      abdomen: 80,
      cuadriceps: 85,
      femoral_gluteo: 75,
      gemelos: 50,
    },
    Alex_Titan: {
      pectoral: 120,
      espalda: 130,
      hombros: 105,
      biceps: 95,
      triceps: 110,
      abdomen: 115,
      cuadriceps: 125,
      femoral_gluteo: 120,
      gemelos: 90,
    },
  };

  // Cálculo automático de rangos según todos los entrenamientos registrados (Fórmula Epley 1RM normalizada)
  const userMuscleScores = useMemo(() => {
    const scores = {};
    Object.keys(MUSCLE_GROUPS).forEach((m) => {
      scores[m] = 30;
    }); // Base inicial bronce

    Object.values(workoutsByDay)
      .flat()
      .forEach((ex) => {
        const oneRM = ex.weight * (1 + ex.reps / 30);
        const mult = MUSCLE_GROUPS[ex.muscle]?.baseMultiplier || 1;
        const normalizedScore = Math.round(oneRM / mult);
        if (normalizedScore > scores[ex.muscle]) {
          scores[ex.muscle] = normalizedScore;
        }
      });
    return scores;
  }, [workoutsByDay]);

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    const item = {
      id: Date.now(),
      name: newExName,
      muscle: newExMuscle,
      sets: Number(newExSets),
      reps: Number(newExReps),
      weight: Number(newExWeight),
    };
    setWorkoutsByDay((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), item],
    }));
    setNewExName('');
  };

  const handleAskCoach = (e) => {
    e.preventDefault();
    if (!coachQuestion.trim()) return;
    const q = coachQuestion.toLowerCase();
    let reply =
      'Para mejorar en ese punto, asegúrate de mantener un rango de 6 a 12 repeticiones llegando a 1 o 2 repeticiones del fallo muscular, y suma 2.5 kg cuando completes todas las series.';
    if (q.includes('creatina')) {
      reply =
        'Toma 5 gramos de creatina monohidrato todos los días (incluso los días que no entrenes). No hace falta hacer fase de carga y puedes tomarla con agua o en el batido.';
    } else if (q.includes('pecho') || q.includes('pectoral')) {
      reply =
        'Para que se marquen las 3 zonas del pectoral: usa Press Inclinado (30°) para la parte clavicular (alta), Press Plano para la esternal (media) y Fondos en paralelas para la costal (baja).';
    } else if (
      q.includes('triceps') ||
      q.includes('tríceps') ||
      q.includes('brazo')
    ) {
      reply =
        'El tríceps tiene 3 cabezas y ocupa el 60% del brazo. Para la cabeza larga necesitas ejercicios por encima de la cabeza (Press Francés inclinado), y para la lateral y medial usa extensiones en polea con cuerda.';
    } else if (
      q.includes('abdomen') ||
      q.includes('definir') ||
      q.includes('grasa')
    ) {
      reply =
        'Para marcar el abdomen sin pasar hambre, elige las recetas "Versión Definición" de la pestaña de comidas y mantén al menos 10.000 pasos diarios.';
    }
    setCoachHistory((prev) => [
      ...prev,
      { sender: 'user', text: coachQuestion },
      { sender: 'coach', text: reply },
    ]);
    setCoachQuestion('');
  };

  const getColor = (muscleKey, scoresObj = userMuscleScores) => {
    return getRankByRM(scoresObj[muscleKey] || 30).color;
  };

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        paddingBottom: '80px',
      }}
    >
      {/* HEADER */}
      <header
        style={{
          padding: '16px',
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '800',
              color: '#38bdf8',
            }}
          >
            ⚡ GYMRANK PRO v2.0
          </h1>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Anatomía Subdividida • 7 Días • 120 Recetas ES
          </span>
        </div>
      </header>

      {/* NAVEGACIÓN SUPERIOR */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px',
          overflowX: 'auto',
          background: '#0f172a',
        }}
      >
        {[
          { id: 'muneco', label: '🧍 Muñeco & Rangos' },
          { id: 'entrenamientos', label: '🏋️ Entrenamientos' },
          { id: 'piques', label: '⚔️ Piques Amigos' },
          { id: 'coach', label: '🍲 Coach & 120 Recetas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeTab === tab.id ? '#38bdf8' : '#1e293b',
              color: activeTab === tab.id ? '#0f172a' : '#cbd5e1',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PESTAÑA 1: MUÑECO ANATÓMICO SUBDIVIDIDO */}
      {activeTab === 'muneco' && (
        <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <button
              onClick={() => setBodyView('front')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #38bdf8',
                background: bodyView === 'front' ? '#38bdf8' : 'transparent',
                color: bodyView === 'front' ? '#000' : '#fff',
                fontWeight: 'bold',
              }}
            >
              Vista Frontal (Pecho 3 zonas / Cuádriceps)
            </button>
            <button
              onClick={() => setBodyView('back')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #38bdf8',
                background: bodyView === 'back' ? '#38bdf8' : 'transparent',
                color: bodyView === 'back' ? '#000' : '#fff',
                fontWeight: 'bold',
              }}
            >
              Vista Trasera (Tríceps 3 cabezas / Espalda)
            </button>
          </div>

          {/* SVG ANATÓMICO CON DIVISIONES INTERNAS */}
          <div
            style={{
              background: '#1e293b',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <svg viewBox="0 0 240 420" width="240" height="400">
              {/* Cabeza */}
              <circle cx="120" cy="30" r="20" fill="#475569" />
              {bodyView === 'front' ? (
                <g
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  style={{ cursor: 'pointer' }}
                >
                  {/* Hombros: Deltoides Anterior y Lateral */}
                  <g
                    onClick={() => setSelectedMuscle('hombros')}
                    fill={getColor('hombros')}
                  >
                    <polygon points="65,58 85,55 82,85 60,78" />
                    <polygon points="55,68 65,58 60,78 52,85" />
                    <polygon points="175,58 155,55 158,85 180,78" />
                    <polygon points="185,68 175,58 180,78 188,85" />
                  </g>
                  {/* Pectoral Dividido en Alto, Medio y Bajo */}
                  <g
                    onClick={() => setSelectedMuscle('pectoral')}
                    fill={getColor('pectoral')}
                  >
                    {/* Pectoral Alto (Clavicular) */}
                    <polygon points="85,56 118,62 118,74 84,72" />
                    <polygon points="155,56 122,62 122,74 156,72" />
                    {/* Pectoral Medio (Esternal) */}
                    <polygon points="84,74 118,76 118,92 83,90" />
                    <polygon points="156,74 122,76 122,92 157,90" />
                    {/* Pectoral Bajo (Costal) */}
                    <polygon points="83,92 118,94 115,105 86,102" />
                    <polygon points="157,92 122,94 125,105 154,102" />
                  </g>
                  {/* Bíceps: Cabeza Larga y Corta */}
                  <g
                    onClick={() => setSelectedMuscle('biceps')}
                    fill={getColor('biceps')}
                  >
                    <rect x="52" y="88" width="12" height="45" rx="5" />
                    <rect x="65" y="88" width="11" height="45" rx="5" />
                    <rect x="164" y="88" width="11" height="45" rx="5" />
                    <rect x="176" y="88" width="12" height="45" rx="5" />
                  </g>
                  {/* Abdomen: 6-pack + Oblicuos */}
                  <g
                    onClick={() => setSelectedMuscle('abdomen')}
                    fill={getColor('abdomen')}
                  >
                    <rect x="98" y="108" width="19" height="18" rx="3" />
                    <rect x="123" y="108" width="19" height="18" rx="3" />
                    <rect x="98" y="129" width="19" height="18" rx="3" />
                    <rect x="123" y="129" width="19" height="18" rx="3" />
                    <rect x="98" y="150" width="19" height="18" rx="3" />
                    <rect x="123" y="150" width="19" height="18" rx="3" />
                    <polygon points="85,108 95,110 95,165 88,160" />
                    <polygon points="155,108 145,110 145,165 152,160" />
                  </g>
                  {/* Cuádriceps: Recto Femoral, Vasto Lateral y Vasto Medial */}
                  <g
                    onClick={() => setSelectedMuscle('cuadriceps')}
                    fill={getColor('cuadriceps')}
                  >
                    {/* Pierna Izquierda */}
                    <polygon points="82,175 94,175 90,265 78,255" />
                    <polygon points="96,175 106,175 104,265 92,265" />
                    <polygon points="108,210 116,185 115,265 105,265" />
                    {/* Pierna Derecha */}
                    <polygon points="158,175 146,175 150,265 162,255" />
                    <polygon points="144,175 134,175 136,265 148,265" />
                    <polygon points="132,210 124,185 125,265 135,265" />
                  </g>
                  {/* Gemelos */}
                  <g
                    onClick={() => setSelectedMuscle('gemelos')}
                    fill={getColor('gemelos')}
                  >
                    <rect x="82" y="280" width="14" height="70" rx="6" />
                    <rect x="98" y="280" width="14" height="70" rx="6" />
                    <rect x="128" y="280" width="14" height="70" rx="6" />
                    <rect x="144" y="280" width="14" height="70" rx="6" />
                  </g>
                </g>
              ) : (
                <g
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  style={{ cursor: 'pointer' }}
                >
                  {/* Hombro Posterior */}
                  <g
                    onClick={() => setSelectedMuscle('hombros')}
                    fill={getColor('hombros')}
                  >
                    <polygon points="60,60 85,55 82,82 55,78" />
                    <polygon points="180,60 155,55 158,82 185,78" />
                  </g>
                  {/* Espalda: Trapecio, Dorsal Ancho y Redondo */}
                  <g
                    onClick={() => setSelectedMuscle('espalda')}
                    fill={getColor('espalda')}
                  >
                    <polygon points="95,50 145,50 120,105" />
                    <polygon points="84,75 117,108 117,160 90,145" />
                    <polygon points="156,75 123,108 123,160 150,145" />
                  </g>
                  {/* Tríceps Dividido en 3 Cabezas (Larga, Lateral, Medial) */}
                  <g
                    onClick={() => setSelectedMuscle('triceps')}
                    fill={getColor('triceps')}
                  >
                    {/* Brazo Izquierdo: 3 cabezas */}
                    <rect x="50" y="84" width="9" height="38" rx="3" />
                    <rect x="61" y="84" width="9" height="38" rx="3" />
                    <rect x="54" y="124" width="14" height="20" rx="3" />
                    {/* Brazo Derecho: 3 cabezas */}
                    <rect x="170" y="84" width="9" height="38" rx="3" />
                    <rect x="181" y="84" width="9" height="38" rx="3" />
                    <rect x="172" y="124" width="14" height="20" rx="3" />
                  </g>
                  {/* Glúteo e Isquios */}
                  <g
                    onClick={() => setSelectedMuscle('femoral_gluteo')}
                    fill={getColor('femoral_gluteo')}
                  >
                    <rect x="85" y="165" width="33" height="35" rx="10" />
                    <rect x="122" y="165" width="33" height="35" rx="10" />
                    <rect x="85" y="204" width="15" height="60" rx="5" />
                    <rect x="102" y="204" width="15" height="60" rx="5" />
                    <rect x="123" y="204" width="15" height="60" rx="5" />
                    <rect x="140" y="204" width="15" height="60" rx="5" />
                  </g>
                  {/* Gemelos Traseros (Interno, Externo y Sóleo) */}
                  <g
                    onClick={() => setSelectedMuscle('gemelos')}
                    fill={getColor('gemelos')}
                  >
                    <rect x="84" y="275" width="15" height="55" rx="6" />
                    <rect x="101" y="275" width="15" height="55" rx="6" />
                    <rect x="88" y="332" width="24" height="25" rx="4" />
                    <rect x="124" y="275" width="15" height="55" rx="6" />
                    <rect x="141" y="275" width="15" height="55" rx="6" />
                    <rect x="128" y="332" width="24" height="25" rx="4" />
                  </g>
                </g>
              )}
            </svg>

            {/* DETALLE DEL MÚSCULO SELECCIONADO Y SUS SUB-ZONAS */}
            {selectedMuscle && (
              <div
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '14px',
                  background: '#0f172a',
                  borderRadius: '12px',
                  border: `2px solid ${getColor(selectedMuscle)}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h3 style={{ margin: 0 }}>
                    {MUSCLE_GROUPS[selectedMuscle].name}
                  </h3>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '99px',
                      background: getColor(selectedMuscle),
                      color: '#000',
                      fontWeight: 'bold',
                      fontSize: '13px',
                    }}
                  >
                    Rango: {getRankByRM(userMuscleScores[selectedMuscle]).name}{' '}
                    ({userMuscleScores[selectedMuscle]} pts)
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#94a3b8',
                    margin: '8px 0 4px',
                  }}
                >
                  Subdivisiones marcadas en el muñeco con este rango:
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {MUSCLE_GROUPS[selectedMuscle].subparts.map((sub) => (
                    <span
                      key={sub}
                      style={{
                        fontSize: '12px',
                        background: '#1e293b',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                      }}
                    >
                      ✓ {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: ENTRENAMIENTOS (7 DÍAS LIBRES) */}
      {activeTab === 'entrenamientos' && (
        <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ marginTop: 0, fontSize: '18px' }}>
            📅 Elige qué día quieres entrenar o registrar
          </h2>
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '10px',
            }}
          >
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: selectedDay === day ? '#38bdf8' : '#1e293b',
                  color: selectedDay === day ? '#000' : '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {day} ({(workoutsByDay[day] || []).length})
              </button>
            ))}
          </div>

          {/* FORMULARIO AÑADIR EJERCICIO */}
          <form
            onSubmit={handleAddExercise}
            style={{
              background: '#1e293b',
              padding: '14px',
              borderRadius: '12px',
              marginTop: '12px',
              display: 'grid',
              gap: '10px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '15px', color: '#38bdf8' }}>
              + Añadir Ejercicio al {selectedDay}
            </h3>
            <input
              placeholder="Nombre del ejercicio (ej. Press Francés, Sentadilla...)"
              value={newExName}
              onChange={(e) => setNewExName(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #334155',
                background: '#0f172a',
                color: '#fff',
              }}
            />
            <select
              value={newExMuscle}
              onChange={(e) => setNewExMuscle(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #334155',
                background: '#0f172a',
                color: '#fff',
              }}
            >
              {Object.entries(MUSCLE_GROUPS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name}
                </option>
              ))}
            </select>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px',
              }}
            >
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Series
                </label>
                <input
                  type="number"
                  value={newExSets}
                  onChange={(e) => setNewExSets(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #334155',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Reps
                </label>
                <input
                  type="number"
                  value={newExReps}
                  onChange={(e) => setNewExReps(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #334155',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Peso (kg)
                </label>
                <input
                  type="number"
                  value={newExWeight}
                  onChange={(e) => setNewExWeight(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #334155',
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: '#22c55e',
                color: '#000',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Guardar y Actualizar Rango Muscular
            </button>
          </form>

          {/* LISTA DE EJERCICIOS DEL DÍA */}
          <div style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
            {(workoutsByDay[selectedDay] || []).map((ex) => (
              <div
                key={ex.id}
                style={{
                  background: '#1e293b',
                  padding: '12px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong style={{ display: 'block' }}>{ex.name}</strong>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {MUSCLE_GROUPS[ex.muscle]?.name} • 1RM Est:{' '}
                    {Math.round(ex.weight * (1 + ex.reps / 30))} kg
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      background: '#0f172a',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      color: '#38bdf8',
                    }}
                  >
                    {ex.sets} x {ex.reps} @ {ex.weight} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: PIQUES AMIGOS */}
      {activeTab === 'piques' && (
        <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ marginTop: 0, fontSize: '18px' }}>
            ⚔️ Comparador de Rangos con Amigos
          </h2>
          <select
            value={selectedRival}
            onChange={(e) => setSelectedRival(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #38bdf8',
              marginBottom: '16px',
            }}
          >
            <option value="Carlos_Fit">Rival: Carlos_Fit</option>
            <option value="Alex_Titan">Rival: Alex_Titan</option>
          </select>

          <div style={{ display: 'grid', gap: '8px' }}>
            {Object.entries(MUSCLE_GROUPS).map(([key, grp]) => {
              const myScore = userMuscleScores[key];
              const rivalScore = rivals[selectedRival][key];
              const myRank = getRankByRM(myScore);
              const rivalRank = getRankByRM(rivalScore);
              const losing = rivalScore > myScore;
              return (
                <div
                  key={key}
                  style={{
                    background: '#1e293b',
                    padding: '12px',
                    borderRadius: '10px',
                    borderLeft: `4px solid ${losing ? '#ef4444' : '#22c55e'}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 'bold',
                    }}
                  >
                    <span>{grp.name}</span>
                    <span
                      style={{
                        color: losing ? '#ef4444' : '#22c55e',
                        fontSize: '12px',
                      }}
                    >
                      {losing
                        ? `¡${selectedRival} te gana! (+${
                            rivalScore - myScore
                          } pts)`
                        : '¡Vas ganando!'}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '6px',
                      fontSize: '13px',
                    }}
                  >
                    <span style={{ color: myRank.color }}>
                      Tú: {myRank.name} ({myScore})
                    </span>
                    <span style={{ color: rivalRank.color }}>
                      {selectedRival}: {rivalRank.name} ({rivalScore})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PESTAÑA 4: COACH INTERACTIVO + 120 RECETAS DE SUPERMERCADO ESPAÑOL */}
      {activeTab === 'coach' && (
        <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
          {/* CHAT DEL COACH */}
          <div
            style={{
              background: '#1e293b',
              padding: '14px',
              borderRadius: '12px',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#38bdf8' }}>
              🧠 Pregunta a tu Coach de Fuerza y Nutrición
            </h3>
            <div
              style={{
                maxHeight: '160px',
                overflowY: 'auto',
                display: 'grid',
                gap: '8px',
                marginBottom: '10px',
                padding: '8px',
                background: '#0f172a',
                borderRadius: '8px',
              }}
            >
              {coachHistory.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      background: msg.sender === 'user' ? '#38bdf8' : '#334155',
                      color: msg.sender === 'user' ? '#000' : '#fff',
                    }}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
            <form
              onSubmit={handleAskCoach}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                value={coachQuestion}
                onChange={(e) => setCoachQuestion(e.target.value)}
                placeholder="Ej: ¿Cómo marco las 3 cabezas del tríceps o el pecho alto?"
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#fff',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#38bdf8',
                  color: '#000',
                  fontWeight: 'bold',
                }}
              >
                Preguntar
              </button>
            </form>
          </div>

          {/* SELECTOR DE LAS 6 CATEGORÍAS DE COMIDA (20 RECETAS CADA UNA) */}
          <h3 style={{ marginBottom: '8px' }}>
            🛒 Recetario Fit Supermercados España (20 por categoría)
          </h3>
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '10px',
            }}
          >
            {MEAL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setMealCat(cat)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: mealCat === cat ? '#22c55e' : '#1e293b',
                  color: mealCat === cat ? '#000' : '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {cat} (20)
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
            {generate20Recipes(mealCat).map((recipe) => (
              <div
                key={recipe.id}
                style={{
                  background: '#1e293b',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <strong style={{ color: '#38bdf8', fontSize: '14px' }}>
                    #{recipe.number} {recipe.name}
                  </strong>
                  <span
                    style={{
                      fontSize: '12px',
                      background: '#0f172a',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      color: '#22c55e',
                      fontWeight: 'bold',
                    }}
                  >
                    {recipe.prot}g Prot • {recipe.kcal} kcal
                  </span>
                </div>
                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: '13px',
                    color: '#cbd5e1',
                  }}
                >
                  {recipe.ing}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
