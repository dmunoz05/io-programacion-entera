import { useState } from 'react';
import axios from 'axios';

function App() {
  const [problemType, setProblemType] = useState('max');
  const [numVars, setNumVars] = useState(2);
  const [objectiveCoeffs, setObjectiveCoeffs] = useState([]);
  const [numConstraints, setNumConstraints] = useState(1);
  const [constraints, setConstraints] = useState([]);
  const [result, setResult] = useState(null);
  const urlApi = import.meta.env.VITE_API_URL || 'https://images-pyxpert-backend.onrender.com/api/v1/process-app-io/';

  const handleObjectiveChange = (index, value) => {
    const newCoeffs = [...objectiveCoeffs];
    newCoeffs[index] = parseFloat(value);
    setObjectiveCoeffs(newCoeffs);
  };

  const handleConstraintChange = (cIndex, vIndex, value) => {
    const newConstraints = [...constraints];
    newConstraints[cIndex].coeffs[vIndex] = parseFloat(value);
    setConstraints(newConstraints);
  };

  const handleRelationChange = (cIndex, value) => {
    const newConstraints = [...constraints];
    newConstraints[cIndex].relation = value;
    setConstraints(newConstraints);
  };

  const handleRHSChange = (cIndex, value) => {
    const newConstraints = [...constraints];
    newConstraints[cIndex].rhs = parseFloat(value);
    setConstraints(newConstraints);
  };

  const setupObjective = () => {
    setObjectiveCoeffs(Array(numVars).fill(0));
  };

  const setupConstraints = () => {
    const cons = [];
    for (let i = 0; i < numConstraints; i++) {
      cons.push({
        coeffs: Array(numVars).fill(0),
        relation: '<=',
        rhs: 0
      });
    }
    setConstraints(cons);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        problem_type: problemType,
        num_vars: numVars,
        objective_coeffs: objectiveCoeffs,
        constraints: constraints
      };
      const response = await axios.post(urlApi, payload);
      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Error al enviar datos al servidor.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-600 to-black text-black p-4">
      <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-700">Solucionador de Programación Entera</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">¿Maximizar o minimizar?</label>
            <select value={problemType} onChange={(e) => setProblemType(e.target.value)} className="w-full border p-2 rounded-lg">
              <option value="max">Maximizar</option>
              <option value="min">Minimizar</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Número de variables:</label>
            <div className="flex gap-2">
              <input type="number" min="1" value={numVars} onChange={(e) => setNumVars(parseInt(e.target.value))} className="border p-2 rounded-lg w-full" />
              <button type="button" onClick={setupObjective} className="bg-blue-500 hover:bg-blue-600 text-black px-4 py-2 rounded-lg">Definir función objetivo</button>
            </div>
          </div>

          {objectiveCoeffs.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Función Objetivo:</h2>
              <div className="flex flex-wrap gap-2">
                {objectiveCoeffs.map((val, idx) => (
                  <input
                    key={idx}
                    type="number"
                    value={val}
                    onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                    className="border p-2 rounded-lg w-20"
                    placeholder={`x${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium">Número de restricciones:</label>
            <div className="flex gap-2">
              <input type="number" min="1" value={numConstraints} onChange={(e) => setNumConstraints(parseInt(e.target.value))} className="border p-2 rounded-lg w-full" />
              <button type="button" onClick={setupConstraints} className="bg-blue-500 hover:bg-blue-600 text-black px-4 py-2 rounded-lg">Definir restricciones</button>
            </div>
          </div>

          {constraints.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Restricciones:</h2>
              {constraints.map((con, cIdx) => (
                <div key={cIdx} className="flex flex-wrap gap-2 mb-4">
                  {con.coeffs.map((val, vIdx) => (
                    <input
                      key={vIdx}
                      type="number"
                      value={val}
                      onChange={(e) => handleConstraintChange(cIdx, vIdx, e.target.value)}
                      className="border p-2 rounded-lg w-20"
                      placeholder={`x${vIdx + 1}`}
                    />
                  ))}
                  <select value={con.relation} onChange={(e) => handleRelationChange(cIdx, e.target.value)} className="border p-2 rounded-lg">
                    <option value="<=">{`<=`}</option>
                    <option value="=">{`=`}</option>
                    <option value=">=">{`>=`}</option>
                  </select>
                  <input
                    type="number"
                    value={con.rhs}
                    onChange={(e) => handleRHSChange(cIdx, e.target.value)}
                    className="border p-2 rounded-lg w-28"
                    placeholder="Lado derecho"
                  />
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-lg font-semibold">Resolver</button>
        </form>

        {result && (
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl shadow-inner">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">Resultado</h2>
            <p className="mb-2">Estado: <span className="font-semibold">{result.status}</span></p>
            <p className="mb-2">Valor óptimo: <span className="font-semibold">{result.optimal_value}</span></p>
            <div>
              <h3 className="font-semibold mt-4">Variables:</h3>
              <ul className="list-disc list-inside">
                {result.variables.map((v, idx) => (
                  <li key={idx}>{v.name} = {v.value}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;