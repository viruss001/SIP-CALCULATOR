// App.js
import React, { useState, useEffect, useRef } from 'react';
import { Calculator, TrendingUp, PieChart, BarChart3, IndianRupeeIcon, Calendar, Percent } from 'lucide-react';
import Chart from 'chart.js/auto';

function App() {
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [years, setYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [results, setResults] = useState(null);
  const [yearlyData, setYearlyData] = useState([]);

  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const lineChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  const calculateSIP = () => {
    const monthlyRate = expectedReturn / 100 / 12;
    const totalMonths = years * 12;
    const totalInvested = monthlyAmount * totalMonths;

    const futureValue =
      monthlyAmount *
      (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
    const totalGains = futureValue - totalInvested;

    const yearly = [];
    for (let year = 1; year <= years; year++) {
      const months = year * 12;
      const invested = monthlyAmount * months;
      const value =
        monthlyAmount *
        (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
      const gains = value - invested;
      yearly.push({ year, invested, value, gains });
    }

    setResults({
      totalInvested: Math.round(totalInvested),
      futureValue: Math.round(futureValue),
      totalGains: Math.round(totalGains),
    });

    setYearlyData(yearly);
  };

  const createLineChart = () => {
    if (lineChartInstance.current) lineChartInstance.current.destroy();
    if (!yearlyData.length) return;

    const ctx = lineChartRef.current.getContext('2d');
    lineChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: yearlyData.map((d) => `Year ${d.year}`),
        datasets: [
          {
            label: 'Total Investment',
            data: yearlyData.map((d) => d.invested),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Future Value',
            data: yearlyData.map((d) => d.value),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { padding: 20, font: { size: 12, weight: '500' } },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#3B82F6',
            borderWidth: 1,
            callbacks: {
              label: (context) =>
                context.dataset.label + ': ₹' + context.parsed.y.toLocaleString('en-IN'),
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '₹' + (value / 100000).toFixed(1) + 'L',
            },
            grid: { color: 'rgba(0, 0, 0, 0.1)' },
          },
          x: { grid: { color: 'rgba(0, 0, 0, 0.1)' } },
        },
        interaction: { intersect: false, mode: 'index' },
      },
    });
  };

  const createPieChart = () => {
    if (pieChartInstance.current) pieChartInstance.current.destroy();
    if (!results) return;

    const ctx = pieChartRef.current.getContext('2d');
    pieChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Total Invested', 'Gains'],
        datasets: [
          {
            data: [results.totalInvested, results.totalGains],
            backgroundColor: ['#3B82F6', '#10B981'],
            borderColor: ['#2563EB', '#059669'],
            borderWidth: 2,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 20, font: { size: 12, weight: '500' } },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#3B82F6',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percent = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ₹${context.parsed.toLocaleString('en-IN')} (${percent}%)`;
              },
            },
          },
        },
        cutout: '60%',
      },
    });
  };

  useEffect(() => {
    if (monthlyAmount && years && expectedReturn) calculateSIP();
  }, [monthlyAmount, years, expectedReturn]);

  useEffect(() => {
    if (yearlyData.length > 0) createLineChart();
  }, [yearlyData]);

  useEffect(() => {
    if (results) createPieChart();
  }, [results]);

  useEffect(() => {
    return () => {
      if (lineChartInstance.current) lineChartInstance.current.destroy();
      if (pieChartInstance.current) pieChartInstance.current.destroy();
    };
  }, []);

  const formatCurrency = (amount) => '₹' + amount.toLocaleString('en-IN');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-5 shadow-lg">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">SIP Calculator</h1>
          <p className="text-md sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate your Systematic Investment Plan returns and visualize your wealth growth
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 ring-2 ring-blue-200 ring-offset-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <IndianRupeeIcon className="w-5 h-5 mr-2 text-blue-600" />
                Investment Details
              </h2>

              <div className="space-y-6">
                {/* Monthly Investment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Investment Amount
                  </label>
                  <input
                    type="number"
                    value={monthlyAmount}
                    min="100"
                    max="500000"
                    step="500"
                    onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-lg"
                  />
                  <input
                    type="range"
                    min="100"
                    max="500000"
                    step="500"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>

                {/* Years */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Investment Period (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-lg"
                  />
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>

                {/* Expected Return */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Percent className="w-4 h-4 mr-1" />
                    Expected Annual Return (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-lg"
                  />
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="0.5"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-2">
            {results && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl shadow-md ring-2 ring-blue-200">
                    <p className="text-sm text-gray-500">Total Invested</p>
                    <h3 className="text-xl font-bold text-blue-600">{formatCurrency(results.totalInvested)}</h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-md ring-2 ring-green-200">
                    <p className="text-sm text-gray-500">Future Value</p>
                    <h3 className="text-xl font-bold text-green-600">{formatCurrency(results.futureValue)}</h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-md ring-2 ring-purple-200">
                    <p className="text-sm text-gray-500">Total Gains</p>
                    <h3 className="text-xl font-bold text-purple-600">{formatCurrency(results.totalGains)}</h3>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-4 rounded-xl shadow-md ring-2 ring-blue-200">
                    <h3 className="font-semibold mb-2">Investment Growth</h3>
                    <div className="h-64 sm:h-80 overflow-x-auto">
                      <canvas ref={lineChartRef}></canvas>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-md ring-2 ring-blue-200">
                    <h3 className="font-semibold mb-2">Investment Breakdown</h3>
                    <div className="h-64 sm:h-80 overflow-x-auto">
                      <canvas ref={pieChartRef}></canvas>
                    </div>
                  </div>
                </div>

                {/* Yearly Table */}
                <div className="bg-white rounded-xl shadow-md ring-2 ring-blue-200 overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2">Year</th>
                        <th className="px-4 py-2 text-right">Invested</th>
                        <th className="px-4 py-2 text-right">Value</th>
                        <th className="px-4 py-2 text-right">Gains</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyData.map((row) => (
                        <tr key={row.year} className="border-t">
                          <td className="px-4 py-2">{row.year}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(Math.round(row.invested))}</td>
                          <td className="px-4 py-2 text-right text-green-600">{formatCurrency(Math.round(row.value))}</td>
                          <td className="px-4 py-2 text-right text-purple-600">{formatCurrency(Math.round(row.gains))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
