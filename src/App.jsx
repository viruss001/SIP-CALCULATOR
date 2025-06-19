import React, { useState, useEffect, useRef } from 'react';
import { Calculator, TrendingUp, PieChart, BarChart3, IndianRupeeIcon, Calendar, Percent } from 'lucide-react';
import Chart from 'chart.js/auto';
import StarBorder from './Components/StarBorder'

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

    // SIP Future Value Formula: PMT * (((1 + r)^n - 1) / r) * (1 + r)
    const futureValue = monthlyAmount * (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
    const totalGains = futureValue - totalInvested;

    // Calculate yearly breakdown
    const yearly = [];
    for (let year = 1; year <= years; year++) {
      const months = year * 12;
      const invested = monthlyAmount * months;
      const value = monthlyAmount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
      const gains = value - invested;

      yearly.push({
        year,
        invested,
        value,
        gains
      });
    }

    setResults({
      totalInvested: Math.round(totalInvested),
      futureValue: Math.round(futureValue),
      totalGains: Math.round(totalGains)
    });

    setYearlyData(yearly);
  };

  const createLineChart = () => {
    if (lineChartInstance.current) {
      lineChartInstance.current.destroy();
    }

    if (!yearlyData.length) return;

    const ctx = lineChartRef.current.getContext('2d');

    lineChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: yearlyData.map(d => `Year ${d.year}`),
        datasets: [
          {
            label: 'Total Investment',
            data: yearlyData.map(d => d.invested),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Future Value',
            data: yearlyData.map(d => d.value),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              padding: 20,
              font: {
                size: 12,
                weight: '500'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#3B82F6',
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString('en-IN');
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return '₹' + (value / 100000).toFixed(1) + 'L';
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  };

  const createPieChart = () => {
    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
    }

    if (!results) return;

    const ctx = pieChartRef.current.getContext('2d');

    pieChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Total Invested', 'Gains'],
        datasets: [{
          data: [results.totalInvested, results.totalGains],
          backgroundColor: ['#3B82F6', '#10B981'],
          borderColor: ['#2563EB', '#059669'],
          borderWidth: 2,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: 12,
                weight: '500'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#3B82F6',
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return context.label + ': ₹' + context.parsed.toLocaleString('en-IN') + ' (' + percentage + '%)';
              }
            }
          }
        },
        cutout: '60%'
      }
    });
  };

  useEffect(() => {
    if (monthlyAmount && years && expectedReturn) {
      calculateSIP();
    }
  }, [monthlyAmount, years, expectedReturn]);


  useEffect(() => {
    if (yearlyData.length > 0) {
      createLineChart();
    }
  }, [yearlyData]);

  useEffect(() => {
    if (results) {
      createPieChart();
    }
  }, [results]);

  useEffect(() => {
    return () => {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
    };
  }, []);

  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">SIP Calculator</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate your Systematic Investment Plan returns and visualize your wealth growth over time
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="border-2 border-blue-200 ring-4 ring-offset-4 ring-blue-500 bg-white rounded-2xl shadow-xl p-8 pb-[6rem] ">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
                <IndianRupeeIcon className="w-6 h-6 mr-3 text-blue-600" />
                Investment Details
              </h2>

              <div className="space-y-8">
                {/* Monthly Investment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Monthly Investment Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input
                      type="number"
                      value={monthlyAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setMonthlyAmount('');
                        } else {
                          setMonthlyAmount(Number(value));
                        }
                      }}
                      className="w-full pl-8 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
                      min="500"
                      step="500"
                    />
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="500000"
                    step="500"
                    value={monthlyAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setMonthlyAmount('');
                      } else {
                        setMonthlyAmount(Number(value));
                      }
                    }}
                    className="w-full mt-3 h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Investment Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Investment Period (Years)
                  </label>
                  <input
                    type="number"
                    value={years}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setYears('');
                      } else {
                        setYears(Number(value));
                      }
                    }}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
                    min="1"
                    max="40"
                  />
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={years}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setYears('');
                      } else {
                        setYears(Number(value));
                      }
                    }}
                    className="w-full mt-3 h-2 bg-green-100 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Expected Returns */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Percent className="w-4 h-4 mr-2" />
                    Expected Annual Returns (%)
                  </label>
                  <input
                    type="number"
                    value={expectedReturn}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setExpectedReturn('');
                      } else {
                        setExpectedReturn(Number(value));
                      }
                    }}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
                    min="1"
                    max="100"
                    step="0.5"
                  />
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="0.5"
                    value={expectedReturn}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setExpectedReturn('');
                      } else {
                        setExpectedReturn(Number(value));
                      }
                    }}
                    className="w-full mt-3 h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {results && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6">

                  <div className="border-2 border-blue-200 ring-4 ring-offset-4 ring-blue-500 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <IndianRupeeIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Total Invested</h3>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(results.totalInvested)}</p>
                  </div>

                  <div className="border-2 border-blue-200 ring-4 ring-offset-4 ring-blue-500 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Future Value</h3>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(results.futureValue)}</p>
                  </div>

                  <div className="border-2 border-blue-200 ring-4 ring-offset-4 ring-blue-500 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Total Gains</h3>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(results.totalGains)}</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Line Chart */}
                  <div className="border-2 border-blue-200 ring-4 ring-offset-4 ring-blue-500 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                      Investment Growth
                    </h3>
                    <div className="h-80">
                      <canvas ref={lineChartRef}></canvas>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="border-2 border-blue-200 ring-4 ring-offset-4 ring-blue-500 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <PieChart className="w-5 h-5 mr-2 text-green-600" />
                      Investment Breakdown
                    </h3>
                    <div className="h-80">
                      <canvas ref={pieChartRef}></canvas>
                    </div>
                  </div>
                </div>

                {/* Year-wise Breakdown Full Width Table */}
                {results && (
                  <div className="mt-12">
                    <div className="border-2 border-blue-200 ring-4 ring-offset-4 ring-blue-500 bg-white rounded-2xl shadow-xl border border-gray-100 ">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Year-wise Breakdown</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Year</th>
                              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Invested</th>
                              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Value</th>
                              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Gains</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {yearlyData.map((data, index) => (
                              <tr key={data.year} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{data.year}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(Math.round(data.invested))}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-green-600 text-right">{formatCurrency(Math.round(data.value))}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-purple-600 text-right">{formatCurrency(Math.round(data.gains))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;