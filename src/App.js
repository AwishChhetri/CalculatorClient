import React, { useState, useEffect } from 'react';
import { Chart, registerables} from 'chart.js';
import axios from 'axios';  // Make sure you have axios installed
import 'tailwindcss/tailwind.css';
import { Bar } from 'react-chartjs-2';

Chart.register(...registerables);

function App() {
  const [icePrice, setIcePrice] = useState(1500000);
  const [iceMileage, setIceMileage] = useState(10);
  const [fuelCost, setFuelCost] = useState(100);

  const [evPrice, setEvPrice] = useState(2000000);
  const [evRange, setEvRange] = useState(200);
  const [batteryCapacity, setBatteryCapacity] = useState(30);
  const [chargingCost, setChargingCost] = useState(9.5);
  const [batteryReplacementCost, setBatteryReplacementCost] = useState(700000);
  const [batteryReplacementInterval, setBatteryReplacementInterval] = useState(6);

  const [monthlyKm, setMonthlyKm] = useState(3000);
  const [calculationDuration, setCalculationDuration] = useState(15);
  const [considerBatteryReplacement, setConsiderBatteryReplacement] = useState(true);

  const [tcoData, setTcoData] = useState(null); // New state to store API response

  const handleClick = async () => {
    // Prepare the data to send to the API
    const payload = {
      icePrice,
      iceMileage,
      fuelCost,
      evPrice,
      evRange,
      batteryCapacity,
      chargingCost,
      batteryReplacementCost,
      batteryReplacementInterval,
      monthlyKm,
      calculationDuration,
      considerBatteryReplacement,
    };

    try {
      // Make an API call
      const response = await axios.post('http://localhost:8000/calculate', payload);
      setTcoData(response.data); // Set the TCO data from the response
    } catch (error) {
      console.error('Error fetching TCO data', error);
    }
  };

  useEffect(() => {
    const ctx = document.getElementById('tcoChart').getContext('2d');

    const tcoChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...Array(16).keys()].slice(1),
        datasets: [
          {
            label: 'ICE TCO',
            data: calculateTCO('ICE'),
            borderColor: 'blue',
            fill: false,
          },
          {
            label: 'EV TCO',
            data: calculateTCO('EV'),
            borderColor: 'red',
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: { title: { display: true, text: 'Years' } },
          y: { title: { display: true, text: 'TCO (Rs. in lakhs)' } },
        },
      },
    });

    return () => tcoChart.destroy();
  }, [icePrice, evPrice, monthlyKm]);

  function calculateTCO(vehicleType) {
    const tcoValues = [];
    for (let year = 1; year <= 15; year++) {
      if (vehicleType === 'ICE') {
        tcoValues.push(icePrice + year * monthlyKm * 12 * fuelCost / iceMileage);
      } else {
        const evTCO = evPrice + year * (monthlyKm * 12 * batteryCapacity / evRange) * chargingCost;
        if (considerBatteryReplacement && year % batteryReplacementInterval === 0) {
          tcoValues.push(evTCO + batteryReplacementCost);
        } else {
          tcoValues.push(evTCO);
        }
      }
    }
    return tcoValues;
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-center text-3xl font-bold mb-8">ICE Vehicle vs EV Cost Saving</h1>

      {/* Input Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ICE Vehicle */}
        <div>
          <h2 className="text-xl font-semibold mb-4">ICE Vehicle</h2>
          <div>
            <label className="block mb-2">ICE Price (Rs):</label>
            <input type="number" value={icePrice} onChange={e => setIcePrice(+e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-2">ICE Mileage (km/l):</label>
            <input type="number" value={iceMileage} onChange={e => setIceMileage(+e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-2">Fuel Cost (Rs/liter):</label>
            <input type="number" value={fuelCost} onChange={e => setFuelCost(+e.target.value)} className="w-full p-2 border rounded" />
          </div>
        </div>

        {/* EV Vehicle */}
        <div>
          <h2 className="text-xl font-semibold mb-4">EV Vehicle</h2>
          <div>
            <label className="block mb-2">EV Price (Rs):</label>
            <input type="number" value={evPrice} onChange={e => setEvPrice(+e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-2">True Range (Km):</label>
            <input type="number" value={evRange} onChange={e => setEvRange(+e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-2">Battery Capacity (kWh):</label>
            <input type="number" value={batteryCapacity} onChange={e => setBatteryCapacity(+e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-2">Charging Cost (Rs/kWh):</label>
            <input type="number" value={chargingCost} onChange={e => setChargingCost(+e.target.value)} className="w-full p-2 border rounded" />
          </div>
        </div>
      </div>

      {/* Customer Usage */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Customer Usage</h2>
        <div>
          <label className="block mb-2">Monthly Km:</label>
          <input type="number" value={monthlyKm} onChange={e => setMonthlyKm(+e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block mb-2">Calculation Duration (Years):</label>
          <input type="number" value={calculationDuration} onChange={e => setCalculationDuration(+e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div className="mt-4">
          <label className="inline-flex items-center">
            <input type="checkbox" checked={considerBatteryReplacement} onChange={e => setConsiderBatteryReplacement(e.target.checked)} className="mr-2" />
            Consider Battery Replacement
          </label>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-10">
        <canvas id="tcoChart" className="w-full"></canvas>
      </div>

      <button onClick={handleClick} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Calculate</button>

      {/* Render the ResultComponent if TCO data is available */}
      {tcoData && <ResultComponent tcoData={tcoData} />}
    </div>
  );
}

const ResultComponent = ({ tcoData }) => {
  // Prepare chart data
  const data = {
    labels: ['ICE', 'EV'],
    datasets: [
      {
        label: 'Total Cost of Ownership (TCO)',
        data: [tcoData.ice_tco, tcoData.ev_tco],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'ICE vs EV - Total Cost of Ownership (TCO)',
      },
    },
  };

  return (
    <div>
      <h2>Total Cost of Ownership (TCO) Comparison</h2>
      <Bar data={data} options={options} />
      <div>
        <h3>Breakdown:</h3>
        <div>
          <h4>ICE:</h4>
          <p>Purchase Price: {tcoData.breakdown.ice.purchasePrice}</p>
          <p>Fuel Cost: {tcoData.breakdown.ice.fuelCost}</p>
          <p>Maintenance Cost: {tcoData.breakdown.ice.maintenanceCost}</p>
          <p>Insurance Cost: {tcoData.breakdown.ice.insuranceCost}</p>
          <p>Resale Value: {tcoData.breakdown.ice.resaleValue}</p>
        </div>
        <div>
          <h4>EV:</h4>
          <p>Purchase Price: {tcoData.breakdown.ev.purchasePrice}</p>
          <p>Charging Cost: {tcoData.breakdown.ev.chargingCost}</p>
          <p>Maintenance Cost: {tcoData.breakdown.ev.maintenanceCost}</p>
          <p>Insurance Cost: {tcoData.breakdown.ev.insuranceCost}</p>
          <p>Battery Replacement Cost: {tcoData.breakdown.ev.batteryReplacementCost}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
