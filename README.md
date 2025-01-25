# Stock Portfolio Analyzer

I built this project in React and used Vite to set up the Environment (I wanted to try it out). This project is a tool that evaluates the performance of stocks in your portfolio and provides recommendations for redistributing funds. The analysis is based on key financial metrics and generates  insights to improve your portfolio. All you do is enter the stock symbol and amount in dollars you have invested in the stock(s), and it will give you an analyzation of your portfolio.

---

## Features

- **Stock Performance Analysis**: Calculate scores for individual stocks based on valuation, profitability, growth, risk, dividend, and momentum metrics.
- **Recommendations**: Suggests reallocating funds from underperforming stocks to better-performing ones.
- **Dynamic Visualization**: Display stock scores using a color-coded bar chart (green for good, yellow for neutral, red for poor).
- **Portfolio Details**: View detailed financial metrics such as P/E Ratio, PEG Ratio, ROE, Profit Margin, Revenue Growth, and more.

---

## Tech Stack

- **React**: For building the user interface.
- **Chart.js**: For dynamic visualizations.
- **Axios**: For making API calls.
- **Alpha Vantage API**: For fetching financial data.
- **CSS**: For styling the components.
- **Vite**: For setting up the environment.
- **JavaScript**: I decided to build this project with JavaScript rather than TypeScript, as I just wanted to try it out with React.

---

## Financial Metrics Used

- **P/E Ratio** (Price-to-Earnings Ratio)
- **PEG Ratio** (Price/Earnings-to-Growth Ratio)
- **ROE** (Return on Equity)
- **Profit Margin**
- **Revenue Growth**
- **Earnings Growth**
- **Beta**
- **Dividend Yield**
- **Proximity to 52-Week High**

Each metric contributes to the overall stock score, which determines the stock's category:
- **Very Good**: Score > 0.18
- **Good**: Score > 0.05
- **Neutral**: Score between -0.1 and 0.05
- **Poor**: Score < -0.1

---

## File Structure

```
ScoreMyStocks
├── public
│   └── vite.svg
├── src
│   ├── folders
│   │   ├── assets
│   │   └── Logos
│   ├── App.jsx //This is the main file where all the brain stuff happens
│   ├── index.css
│   └── main.js
│   └── App.css
├── .gitignore
├── package.json
├── README.md
└── dist (generated after build)
└── more files...
```

---

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and create a pull request.

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---


## Acknowledgments

- [Alpha Vantage API](https://www.alphavantage.co/) for financial data.
- [Chart.js](https://www.chartjs.org/) for data visualization.
- [React](https://reactjs.org/) for building a dynamic user interface.

