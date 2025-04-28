import { useState } from 'react';
import axios from 'axios';

function App() {
  const [problemType, setProblemType] = useState('max');
  const [numVars, setNumVars] = useState(2);
  const [objectiveCoeffs, setObjectiveCoeffs] = useState([]);
  const [numConstraints, setNumConstraints] = useState(1);
  const [constraints, setConstraints] = useState([]);
  const [result, setResult] = useState(null);

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
      const response = await axios.post('http://localhost:8000/api/solve/', payload);
      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Error al enviar datos al servidor.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Solucionador de Programación Entera</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label>¿Maximizar o minimizar?</label>
          <select value={problemType} onChange={(e) => setProblemType(e.target.value)} className="border p-2 ml-2">
            <option value="max">Maximizar</option>
            <option value="min">Minimizar</option>
          </select>
        </div>

        <div>
          <label>Número de variables:</label>
          <input type="number" min="1" value={numVars} onChange={(e) => setNumVars(parseInt(e.target.value))} className="border p-2 ml-2" />
          <button type="button" onClick={setupObjective} className="ml-4 bg-blue-500 text-white px-4 py-2 rounded">Definir función objetivo</button>
        </div>

        {objectiveCoeffs.length > 0 && (
          <div>
            <h2 className="font-semibold">Función Objetivo:</h2>
            {objectiveCoeffs.map((val, idx) => (
              <input
                key={idx}
                type="number"
                value={val}
                onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                className="border p-2 m-1"
                placeholder={`Coef. x${idx + 1}`}
              />
            ))}
          </div>
        )}

        <div>
          <label>Número de restricciones:</label>
          <input type="number" min="1" value={numConstraints} onChange={(e) => setNumConstraints(parseInt(e.target.value))} className="border p-2 ml-2" />
          <button type="button" onClick={setupConstraints} className="ml-4 bg-blue-500 text-white px-4 py-2 rounded">Definir restricciones</button>
        </div>

        {constraints.length > 0 && (
          <div>
            <h2 className="font-semibold">Restricciones:</h2>
            {constraints.map((con, cIdx) => (
              <div key={cIdx} className="mb-4">
                {con.coeffs.map((val, vIdx) => (
                  <input
                    key={vIdx}
                    type="number"
                    value={val}
                    onChange={(e) => handleConstraintChange(cIdx, vIdx, e.target.value)}
                    className="border p-2 m-1"
                    placeholder={`Coef. x${vIdx + 1}`}
                  />
                ))}
                <select value={con.relation} onChange={(e) => handleRelationChange(cIdx, e.target.value)} className="border p-2 m-1">
                  <option value="<=">{`<=`}</option>
                  <option value="=">{`=`}</option>
                  <option value=">=">{`>=`}</option>
                </select>
                <input
                  type="number"
                  value={con.rhs}
                  onChange={(e) => handleRHSChange(cIdx, e.target.value)}
                  className="border p-2 m-1"
                  placeholder="Lado derecho"
                />
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded">Resolver</button>
      </form>

      {result && (
        <div className="mt-8 p-4 border rounded bg-gray-100">
          <h2 className="text-xl font-bold mb-2">Resultado</h2>
          <p>Estado: {result.status}</p>
          <p>Valor óptimo: {result.optimal_value}</p>
          <div>
            <h3 className="font-semibold mt-2">Variables:</h3>
            <ul>
              {result.variables.map((v, idx) => (
                <li key={idx}>{v.name} = {v.value}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;