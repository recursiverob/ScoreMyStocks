
import React, { useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BASE_URL = "https://www.alphavantage.co/query";

const PerformanceChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Portfolio Performance",
      },
    },
  };

  return <Bar data={data} options={options} />;
};

const StockAnalysisTool = () => {
  const [stocks, setStocks] = useState([{ symbol: "", amount: 0 }]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);


  const handleInputChange = (index, field, value) => {
    const newStocks = [...stocks];
    newStocks[index][field] = value;
    setStocks(newStocks);
  };

  const addStock = () => {
    setStocks([...stocks, { symbol: "", amount: 0 }]);
  };

  const calculateScore = (metrics) => {
    let score = 0;

    // Valuation 
    if (metrics.PERatio < 15) score += 0.5 * 0.15;
    else if (metrics.PERatio <= 25) score += 0.2 * 0.15;
    else score -= 0.3 * 0.15;

    if (metrics.PEGRatio < 1) score += 0.3 * 0.1;
    else if (metrics.PEGRatio <= 2) score += 0.1 * 0.1;
    else score -= 0.2 * 0.1;

    // Profitability 
    if (metrics.ROE > 20) score += 0.5 * 0.2;
    else if (metrics.ROE >= 10) score += 0.2 * 0.2;
    else score -= 0.3 * 0.2;

    if (metrics.ProfitMargin > 15) score += 0.3 * 0.1;
    else if (metrics.ProfitMargin >= 5) score += 0.1 * 0.1;
    else score -= 0.2 * 0.1;

    // Growth 
    if (metrics.RevenueGrowth > 15) score += 0.3 * 0.15;
    else if (metrics.RevenueGrowth >= 5) score += 0.2 * 0.15;
    else score -= 0.3 * 0.15;

    if (metrics.EarningsGrowth > 20) score += 0.4 * 0.1;
    else if (metrics.EarningsGrowth >= 10) score += 0.2 * 0.1;
    else score -= 0.3 * 0.1;

    // Risk 
    if (metrics.Beta < 1) score += 0.2 * 0.1;
    else if (metrics.Beta <= 1.5) score += 0.1 * 0.1;
    else score -= 0.3 * 0.1;

    // Dividend 
    if (metrics.DividendYield > 3) score += 0.2 * 0.05;
    else if (metrics.DividendYield < 1) score -= 0.2 * 0.05;

    // Momentum 
    if (metrics.ProximityTo52WeekHigh > 80) score += 0.3 * 0.05;
    else if (metrics.ProximityTo52WeekHigh >= 50) score += 0.1 * 0.05;

    return score;
  };

  const fetchStockData = async () => {
    const API_KEY = "279TPVN6WA0R6RBB"; 
    const results = [];
    let totalPoorValue = 0; 
  
    for (const stock of stocks) {
      try {
        if (!stock.symbol) {
          setError("Stock symbol cannot be empty.");
          continue;
        }
  
        const overviewResponse = await axios.get(BASE_URL, {
          params: {
            function: "OVERVIEW",
            symbol: stock.symbol,
            apikey: API_KEY, 
          },
        });
  
        const metrics = overviewResponse.data;
  
        if (!metrics || !metrics.PERatio || !metrics.PEGRatio) {
          console.error(`Invalid data for ${stock.symbol}:`, metrics);
          continue;
        }
  
        const ProximityTo52WeekHigh = metrics["52WeekHigh"] && metrics["52WeekLow"]
          ? ((metrics["50DayMovingAverage"] - metrics["52WeekLow"]) /
              (metrics["52WeekHigh"] - metrics["52WeekLow"])) * 100
          : 0;
  
        const data = {
          PERatio: parseFloat(metrics.PERatio) || 0,
          PEGRatio: parseFloat(metrics.PEGRatio) || 0,
          ROE: parseFloat(metrics.ReturnOnEquityTTM) * 100 || 0,
          ProfitMargin: parseFloat(metrics.ProfitMargin) * 100 || 0,
          RevenueGrowth: parseFloat(metrics.QuarterlyRevenueGrowthYOY) * 100 || 0,
          EarningsGrowth: parseFloat(metrics.QuarterlyEarningsGrowthYOY) * 100 || 0,
          Beta: parseFloat(metrics.Beta) || 0,
          DividendYield: parseFloat(metrics.DividendYield) * 100 || 0,
          ProximityTo52WeekHigh,
        };
  
        const score = calculateScore(data);
        let category;
        if (score > 0.18) {
          category = "Very Good";
        } else if (score > 0.05) {
          category = "Good";
        } else if (score === -0.1) {
          category = "Neutral"; 
        } else {
          category = "Poor";
        }
  
        const investmentValue = stock.amount;
        if (category === "Poor") totalPoorValue += investmentValue;
        console.log("Total Poor Value:", totalPoorValue);
  
        results.push({
          symbol: stock.symbol,
          score: score.toFixed(2),
          category,
          investmentValue,
          ...data,
        });
        console.log(
          `Stock: ${stock.symbol}, Score: ${score.toFixed(2)}, Category: ${category}, Investment: $${investmentValue}`
        );
        console.log("Metrics:", data);
      } catch (err) {
        console.error(`Error fetching data for ${stock.symbol}:`, err.message);
        setError(`Failed to fetch data for ${stock.symbol}`);
      }
    }
  
    setAnalysisResults(results);
  
    
    const recommendations = calculateRecommendations(results, totalPoorValue);
    setRecommendations(recommendations);
    console.log(recommendations);
  };
  
  
  const calculateRecommendations = (results, totalPoorValue) => {
    
    const poorStocks = results.filter((stock) => stock.category === "Poor");
  
    
    const goodStocks = results.filter(
      (stock) => stock.category === "Very Good" || stock.category === "Good"
    );
  
    
    if (poorStocks.length === 0 || goodStocks.length === 0) {
      return ["No recommendations available. Ensure you have both poor and good-performing stocks."];
    }
  
    
    const totalGoodScore = goodStocks.reduce((sum, stock) => sum + parseFloat(stock.score), 0);
  
    
    const recommendations = [];
  
    for (const poorStock of poorStocks) {
      const availableFunds = poorStock.investmentValue; 
      goodStocks.forEach((goodStock) => {
        const allocation = (
          (parseFloat(goodStock.score) / totalGoodScore) * availableFunds
        ).toFixed(2);
        recommendations.push(
          `Move $${allocation} from ${poorStock.symbol} (${poorStock.category}) to ${goodStock.symbol} (${goodStock.category}).`
        );
      });
    }
  
    return recommendations;
  };
  
  
  
  
  const chartData = {
    labels: analysisResults.map((result) => result.symbol),
    datasets: [
      {
        label: "Score",
        data: analysisResults.map((result) => result.score),
        backgroundColor: analysisResults.map((result) => {
          if (result.category === "Very Good" || result.category === "Good") {
            return "rgba(75, 192, 75, 0.6)"; 
          } else if (result.category === "Neutral") {
            return "rgba(255, 206, 86, 0.6)"; 
          } else {
            return "rgba(255, 99, 132, 0.6)"; 
          }
        }),
        borderColor: analysisResults.map((result) => {
          if (result.category === "Very Good" || result.category === "Good") {
            return "rgba(75, 192, 75, 1)"; 
          } else if (result.category === "Neutral") {
            return "rgba(255, 206, 86, 1)";
          } else {
            return "rgba(255, 99, 132, 1)"; 
          }
        }),
        borderWidth: 1,
      },
    ],
  };
  

  return (
    <div className="app" style={{ fontFamily: "Arial, sans-serif", padding: "2rem", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: "1rem", fontSize: "2rem", color: "#333" }}>
          Stock Portfolio Analyzer
        </h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "2rem" }}>
          Enter your stock portfolio details for analysis and recommendations
        </p>


        {/* Stock Input Section */}
        <div style={{ marginBottom: "2rem", padding: "1rem", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          {stocks.map((stock, index) => (
            <div key={index} style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ flex: 2 }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#333" }}>Stock Symbol</label>
                <input
                  type="text"
                  value={stock.symbol}
                  onChange={(e) => handleInputChange(index, "symbol", e.target.value)}
                  placeholder="e.g., AAPL"
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#333" }}>Amount ($)</label>
                <input
                  type="number"
                  value={stock.amount}
                  onChange={(e) => handleInputChange(index, "amount", e.target.value)}
                  placeholder="e.g., 1000"
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>
              <button
                onClick={() => setStocks(stocks.filter((_, i) => i !== index))}
                style={{ alignSelf: "center", padding: "0.5rem", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                &times;
              </button>
            </div>
          ))}
          <button
            onClick={addStock}
            style={{ padding: "0.75rem", width: "100%", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Add Another Stock
          </button>
        </div>

        {/* Analyze Button */}
        <button
          onClick={fetchStockData}
          style={{ display: "block", width: "100%", padding: "1rem", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold", marginBottom: "2rem" }}
        >
          Analyze Portfolio
        </button>

        {/* Error Message */}
        {error && <p style={{ color: "#dc3545", textAlign: "center" }}>{error}</p>}

        {/* Results Section */}
{analysisResults.length > 0 && (
  <div style={{ display: "flex", gap: "2rem" }}>
    {/* Graph Section */}
    <div style={{ flex: 2, padding: "1rem", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
      <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "#333" }}>Portfolio Performance</h2>
      <PerformanceChart data={chartData} />

      {/* Recommendations Section */}
      <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h3 style={{ fontSize: "1.15rem", marginBottom: "1rem", color: "#333" }}>Recommendations</h3>
        {recommendations.length > 0 ? (
          <ul style={{ paddingLeft: "1rem" }}>
            {recommendations.map((rec, index) => (
              <li key={index} style={{ marginBottom: "0.5rem", color: "#555" }}>
                {rec}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#666" }}>No recommendations available.</p>
        )}
      </div>
    </div>

{/* Analysis Details */}
<div style={{ flex: 1, padding: "1rem", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
  {analysisResults.map((result, index) => (
    <div key={index} style={{ marginBottom: "1rem", borderBottom: "1px solid #ddd", paddingBottom: "1rem" }}>
      <h3 style={{ fontSize: "1.1rem", color: "#333", marginBottom: "0.5rem" }}>
        {result.symbol}
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li><strong>P/E Ratio:</strong> {result.PERatio || "N/A"}</li>
        <li><strong>PEG Ratio:</strong> {result.PEGRatio || "N/A"}</li>
        <li><strong>ROE:</strong> {result.ROE ? `${result.ROE}%` : "N/A"}</li>
        <li><strong>Profit Margin:</strong> {result.ProfitMargin ? `${result.ProfitMargin}%` : "N/A"}</li>
        <li><strong>Revenue Growth:</strong> {result.RevenueGrowth ? `${result.RevenueGrowth}%` : "N/A"}</li>
        <li><strong>Earnings Growth:</strong> {result.EarningsGrowth ? `${result.EarningsGrowth}%` : "N/A"}</li>
        <li><strong>Beta:</strong> {result.Beta || "N/A"}</li>
        <li><strong>Dividend Yield:</strong> {result.DividendYield ? `${result.DividendYield}%` : "N/A"}</li>
        <li><strong>Proximity to 52-Week High:</strong> {result.ProximityTo52WeekHigh ? `${result.ProximityTo52WeekHigh.toFixed(2)}%` : "N/A"}</li>
        <li><strong>Final Score:</strong> {result.score || "N/A"}</li>
        <li><strong>Category:</strong> {result.category || "N/A"}</li>
      </ul>
    </div>
  ))}
</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAnalysisTool;

