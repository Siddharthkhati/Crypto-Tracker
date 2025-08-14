import React, { useState, useEffect } from 'react';

const Home = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [coinHistory, setCoinHistory] = useState([]);
  const [selectedCoinId, setSelectedCoinId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://crypto-tracker-v6je.onrender.com/api/coins")
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setCryptoData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cryptos:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleCoinClick = async (coinId) => {
        setSelectedCoinId(coinId);
        try {
            const res = await fetch(`https://crypto-tracker-v6je.onrender.com/api/history/${coinId}`);
            if (!res.ok) {
            setCoinHistory([]);
            console.log(`No history found for ${coinId}`);
            return;
            }
            const history = await res.json();
            setCoinHistory(history);
        } catch (err) {
            console.error(`Error fetching history for ${coinId}:`, err);
        }
    };



  const formatMarketCap = (marketCap) => {
    if (marketCap >= 1e12) {
      return `$ ${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$ ${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$ ${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$ ${marketCap.toLocaleString()}`;
    }
  };
  
  const getCoinInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Loading cryptocurrency data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500">Error: {error}</p>
          <p className="text-gray-400">Failed to fetch cryptocurrency data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-white mb-2">
            Cryptocurrency Tracker
          </h1>
          <p className="text-gray-400 text-sm">
            Live cryptocurrency prices and market data
          </p>
        </div>

        {/* Table Container */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/70 border-b border-gray-700/50">
                  <th className="text-left py-4 px-6 text-gray-300 font-medium text-sm">
                    Coin Name
                  </th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium text-sm">
                    Symbol
                  </th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium text-sm">
                    Price (USD)
                  </th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium text-sm">
                    Market Cap
                  </th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium text-sm">
                    24h % Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {cryptoData.map((coin) => (
                  <tr
                    key={coin.id}
                    className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleCoinClick(coin.coinId)}
                  >
                    {/* Coin Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white">
                          {getCoinInitials(coin.name)}
                        </div>
                        <div>
                          <div className="font-medium text-white hover:underline">
                            {coin.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Symbol */}
                    <td className="py-4 px-6 text-gray-400 font-mono text-sm text-left">
                      {coin.symbol}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-6 text-white font-semibold text-left">
                        $ {coin.priceUSD?.toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                        })}
                    </td>

                    {/* Market Cap */}
                    <td className="py-4 px-6 text-gray-300 text-left">
                      {formatMarketCap(coin.marketCap)}
                    </td>

                    {/* 24h Change */}
                    <td className="py-4 px-6 text-left">
                      <span className={`font-semibold ${
                        coin.change24h >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
                Live data on page load • Last refresh: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>

        {coinHistory.length > 0 && (
            <div className="mt-6 bg-gray-800/50 p-4 rounded-xl">
                <h2 className="text-white font-medium mb-2">
                    History — {selectedCoinId || "Coin"}
                </h2>
                <ul className="text-gray-300 text-sm">
                {coinHistory.map((item, index) => (
                    <li key={index}>
                    {new Date(item.timestamp).toLocaleString()} — $ {item.priceUSD}
                    </li>
                ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
};

export default Home;
