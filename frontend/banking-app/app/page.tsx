'use client';

import { useState, useEffect } from 'react';

interface PredictionResult {
  prediction: number;
  probability_no: number;
  probability_yes: number;
  confidence: number;
  recommendation: string;
}

interface FormData {
  age: number;
  balance: number;
  day: number;
  month: number;
  campaign: number;
  pdays: number;
  previous: number;
  default_0: number;
  default_1: number;
  housing_0: number;
  housing_1: number;
  loan_0: number;
  loan_1: number;
  education_ordinal: number;
  month_ordinal: number;
  job_admin_: number;
  job_blue_collar: number;
  job_entrepreneur: number;
  job_housemaid: number;
  job_management: number;
  job_retired: number;
  job_services: number;
  job_technician: number;
  job_unemployed: number;
  job_unknown: number;
  marital_divorced: number;
  marital_married: number;
  marital_single: number;
  contact_telephone: number;
  contact_unknown: number;
  poutcome_failure: number;
  poutcome_other: number;
  poutcome_success: number;
}

const initialFormData: FormData = {
  age: 40,
  balance: 1000,
  day: 15,
  month: 6,
  campaign: 1,
  pdays: 999,
  previous: 0,
  default_0: 1,
  default_1: 0,
  housing_0: 1,
  housing_1: 0,
  loan_0: 1,
  loan_1: 0,
  education_ordinal: 2,
  month_ordinal: 6,
  job_admin_: 0,
  job_blue_collar: 0,
  job_entrepreneur: 0,
  job_housemaid: 0,
  job_management: 1,
  job_retired: 0,
  job_services: 0,
  job_technician: 0,
  job_unemployed: 0,
  job_unknown: 0,
  marital_divorced: 0,
  marital_married: 1,
  marital_single: 0,
  contact_telephone: 0,
  contact_unknown: 1,
  poutcome_failure: 1,
  poutcome_other: 0,
  poutcome_success: 0,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function BankingPredictorPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'customer' | 'categorical'>('customer');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setApiStatus('online');
        setError(null);
      } else {
        setApiStatus('offline');
        setError('Backend API is not responding correctly');
      }
    } catch {
      setApiStatus('offline');
      setError(`Backend API is offline. Make sure it's running at ${API_BASE_URL}`);
    }
  };

  const handleInputChange = (field: keyof FormData, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBinaryToggle = (field: string, option: 0 | 1) => {
    const baseField = field.replace(/_[01]$/, '');
    const fields = [`${baseField}_0`, `${baseField}_1`];
    const newData = { ...formData };
    fields.forEach((f) => {
      newData[f as keyof FormData] = 0;
    });
    newData[`${baseField}_${option}` as keyof FormData] = 1;
    setFormData(newData);
  };

  const handlePredict = async () => {
    if (apiStatus !== 'online') {
      setError('Backend API is offline. Please start the API server first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Sending prediction request to:', `${API_BASE_URL}/predict`);
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Prediction failed';
      console.error('Prediction error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const predictionPercentage = result
    ? Math.round(result.probability_yes * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <span className="text-lg font-bold">📊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Bank Marketing Predictor</h1>
                <p className="text-sm text-slate-400">
                  AI-powered term deposit subscription prediction
                </p>
              </div>
            </div>
            {/* API Status Indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  apiStatus === 'online'
                    ? 'bg-green-500 animate-pulse'
                    : apiStatus === 'offline'
                      ? 'bg-red-500'
                      : 'bg-yellow-500 animate-pulse'
                }`}
              />
              <span className="text-sm font-medium">
                {apiStatus === 'online'
                  ? '🟢 API Online'
                  : apiStatus === 'offline'
                    ? '🔴 API Offline'
                    : '🟡 Checking...'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
              <h2 className="mb-6 text-xl font-semibold">Customer Information</h2>

              {/* Tabs */}
              <div className="mb-6 flex gap-2 border-b border-slate-700">
                <button
                  onClick={() => setActiveTab('customer')}
                  className={`pb-3 px-4 font-medium transition-colors ${
                    activeTab === 'customer'
                      ? 'border-b-2 border-blue-500 text-blue-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Customer Profile
                </button>
                <button
                  onClick={() => setActiveTab('categorical')}
                  className={`pb-3 px-4 font-medium transition-colors ${
                    activeTab === 'categorical'
                      ? 'border-b-2 border-blue-500 text-blue-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Categorical Features
                </button>
              </div>

              {/* Customer Profile Tab */}
              {activeTab === 'customer' && (
                <div className="space-y-4">
                  {/* Numeric Inputs Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) =>
                          handleInputChange('age', parseInt(e.target.value) || 0)
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        placeholder="Enter age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Balance ($)
                      </label>
                      <input
                        type="number"
                        value={formData.balance}
                        onChange={(e) =>
                          handleInputChange('balance', parseFloat(e.target.value) || 0)
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        placeholder="Enter balance"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Day of Month
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={formData.day}
                        onChange={(e) =>
                          handleInputChange('day', parseInt(e.target.value) || 0)
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        placeholder="1-31"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Month
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={formData.month}
                        onChange={(e) =>
                          handleInputChange('month', parseInt(e.target.value) || 0)
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        placeholder="1-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Campaign Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.campaign}
                        onChange={(e) =>
                          handleInputChange('campaign', parseInt(e.target.value) || 0)
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        placeholder="0+"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Days Since Last Contact
                      </label>
                      <input
                        type="number"
                        value={formData.pdays}
                        onChange={(e) =>
                          handleInputChange('pdays', parseInt(e.target.value) || 0)
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        placeholder="999 if never"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Previous Campaigns
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.previous}
                        onChange={(e) =>
                          handleInputChange('previous', parseInt(e.target.value) || 0)
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        placeholder="0+"
                      />
                    </div>
                  </div>

                  {/* Binary Toggle Buttons */}
                  <div className="space-y-3 pt-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Default Status
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBinaryToggle('default', 0)}
                          className={`flex-1 rounded-lg py-2 font-medium transition-colors ${
                            formData.default_0 === 1
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          No Default
                        </button>
                        <button
                          onClick={() => handleBinaryToggle('default', 1)}
                          className={`flex-1 rounded-lg py-2 font-medium transition-colors ${
                            formData.default_1 === 1
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Has Default
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Housing Loan
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBinaryToggle('housing', 0)}
                          className={`flex-1 rounded-lg py-2 font-medium transition-colors ${
                            formData.housing_0 === 1
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          No Loan
                        </button>
                        <button
                          onClick={() => handleBinaryToggle('housing', 1)}
                          className={`flex-1 rounded-lg py-2 font-medium transition-colors ${
                            formData.housing_1 === 1
                              ? 'bg-green-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Has Loan
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Personal Loan
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBinaryToggle('loan', 0)}
                          className={`flex-1 rounded-lg py-2 font-medium transition-colors ${
                            formData.loan_0 === 1
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          No Loan
                        </button>
                        <button
                          onClick={() => handleBinaryToggle('loan', 1)}
                          className={`flex-1 rounded-lg py-2 font-medium transition-colors ${
                            formData.loan_1 === 1
                              ? 'bg-green-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Has Loan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Categorical Features Tab */}
              {activeTab === 'categorical' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Education Level (0-3)
                      </label>
                      <select
                        value={formData.education_ordinal}
                        onChange={(e) =>
                          handleInputChange(
                            'education_ordinal',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value={0}>Primary (0)</option>
                        <option value={1}>Secondary (1)</option>
                        <option value={2}>Tertiary (2)</option>
                        <option value={3}>Unknown (3)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Month Ordinal (1-12)
                      </label>
                      <select
                        value={formData.month_ordinal}
                        onChange={(e) =>
                          handleInputChange(
                            'month_ordinal',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Month {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Job Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Job Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'job_admin_', label: 'Admin' },
                        { key: 'job_blue_collar', label: 'Blue Collar' },
                        { key: 'job_entrepreneur', label: 'Entrepreneur' },
                        { key: 'job_housemaid', label: 'Housemaid' },
                        { key: 'job_management', label: 'Management' },
                        { key: 'job_retired', label: 'Retired' },
                        { key: 'job_services', label: 'Services' },
                        { key: 'job_technician', label: 'Technician' },
                        { key: 'job_unemployed', label: 'Unemployed' },
                        { key: 'job_unknown', label: 'Unknown' },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => {
                            const newData = { ...formData };
                            Object.keys(formData).forEach((k) => {
                              if (k.startsWith('job_')) {
                                newData[k as keyof FormData] = 0;
                              }
                            });
                            newData[key as keyof FormData] = 1;
                            setFormData(newData);
                          }}
                          className={`rounded-lg py-2 px-3 text-sm font-medium transition-colors ${
                            formData[key as keyof FormData] === 1
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Marital Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'marital_single', label: 'Single' },
                        { key: 'marital_married', label: 'Married' },
                        { key: 'marital_divorced', label: 'Divorced' },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => {
                            const newData = { ...formData };
                            Object.keys(formData).forEach((k) => {
                              if (k.startsWith('marital_')) {
                                newData[k as keyof FormData] = 0;
                              }
                            });
                            newData[key as keyof FormData] = 1;
                            setFormData(newData);
                          }}
                          className={`rounded-lg py-2 px-3 text-sm font-medium transition-colors ${
                            formData[key as keyof FormData] === 1
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Contact Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'contact_telephone', label: 'Telephone' },
                        { key: 'contact_unknown', label: 'Unknown' },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => {
                            const newData = { ...formData };
                            Object.keys(formData).forEach((k) => {
                              if (k.startsWith('contact_')) {
                                newData[k as keyof FormData] = 0;
                              }
                            });
                            newData[key as keyof FormData] = 1;
                            setFormData(newData);
                          }}
                          className={`rounded-lg py-2 px-3 text-sm font-medium transition-colors ${
                            formData[key as keyof FormData] === 1
                              ? 'bg-orange-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Previous Outcome */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Previous Campaign Outcome
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'poutcome_success', label: 'Success' },
                        { key: 'poutcome_failure', label: 'Failure' },
                        { key: 'poutcome_other', label: 'Other' },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => {
                            const newData = { ...formData };
                            Object.keys(formData).forEach((k) => {
                              if (k.startsWith('poutcome_')) {
                                newData[k as keyof FormData] = 0;
                              }
                            });
                            newData[key as keyof FormData] = 1;
                            setFormData(newData);
                          }}
                          className={`rounded-lg py-2 px-3 text-sm font-medium transition-colors ${
                            formData[key as keyof FormData] === 1
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Predict Button */}
              <button
                onClick={handlePredict}
                disabled={loading || apiStatus !== 'online'}
                className="mt-6 w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Predicting...' : apiStatus !== 'online' ? '⚠️ API Offline' : '🚀 Predict'}
              </button>

              {error && (
                <div className="mt-4 rounded-lg bg-red-900/20 border border-red-700 p-4">
                  <p className="text-red-400 text-sm font-medium mb-1">Error:</p>
                  <p className="text-red-300 text-sm">{error}</p>
                  {apiStatus === 'offline' && (
                    <button
                      onClick={checkApiHealth}
                      className="mt-2 text-xs text-red-200 hover:text-red-100 underline"
                    >
                      Retry connection
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            {result ? (
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
                <h2 className="mb-6 text-xl font-semibold">Prediction Result</h2>

                {/* Prediction Card */}
                <div
                  className={`rounded-lg p-6 mb-6 text-center ${
                    result.prediction === 1
                      ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-600/50'
                      : 'bg-gradient-to-br from-red-900/20 to-rose-900/20 border border-red-600/50'
                  }`}
                >
                  <p className="text-slate-400 text-sm mb-2">Prediction</p>
                  <p className="text-4xl font-bold mb-2">
                    {result.prediction === 1 ? '✅ YES' : '❌ NO'}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {result.prediction === 1
                      ? 'Will Subscribe'
                      : 'Will Not Subscribe'}
                  </p>
                </div>

                {/* Probability Gauge */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">
                      Subscription Probability
                    </span>
                    <span className="text-lg font-bold text-cyan-400">
                      {predictionPercentage}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${predictionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Probability Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Will Subscribe</span>
                    <span className="font-semibold text-green-400">
                      {(result.probability_yes * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Will Not Subscribe</span>
                    <span className="font-semibold text-red-400">
                      {(result.probability_no * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Confidence</span>
                    <span className="font-semibold text-yellow-400">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-sm font-medium text-slate-300 mb-2">
                    Recommendation
                  </p>
                  <p className="text-sm text-slate-400">{result.recommendation}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
                <div className="text-center">
                  <div className="text-4xl mb-4">📈</div>
                  <h3 className="text-lg font-semibold mb-2">No Prediction Yet</h3>
                  <p className="text-slate-400">
                    Fill in the customer information and click predict to see results.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
