import React, { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  type: 'mint' | 'list' | 'buy' | 'cancel';
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  details: string;
}

interface TransactionStatusProps {
  transactions: Transaction[];
  onClear: () => void;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({ transactions, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const pendingCount = transactions.filter(tx => tx.status === 'pending').length;
  const recentTransactions = transactions.slice(0, 5); // Show only 5 most recent

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'success':
        return '✅';
      case 'failed':
        return '❌';
    }
  };

  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'mint':
        return 'Mint NFT';
      case 'list':
        return 'List NFT';
      case 'buy':
        return 'Buy NFT';
      case 'cancel':
        return 'Cancel Listing';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (transactions.length === 0) return null;

  return (
    <div className="transaction-status">
      <div className="status-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="status-summary">
          <span className="status-icon">📊</span>
          <span>Transactions</span>
          {pendingCount > 0 && (
            <span className="pending-badge">{pendingCount} pending</span>
          )}
        </div>
        <button className="expand-btn">
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>

      {isExpanded && (
        <div className="status-content">
          <div className="status-actions">
            <button onClick={onClear} className="clear-btn">
              Clear History
            </button>
          </div>

          <div className="transaction-list">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className={`transaction-item ${transaction.status}`}>
                <div className="transaction-info">
                  <span className="transaction-icon">
                    {getStatusIcon(transaction.status)}
                  </span>
                  <div className="transaction-details">
                    <div className="transaction-type">
                      {getTypeLabel(transaction.type)}
                    </div>
                    <div className="transaction-description">
                      {transaction.details}
                    </div>
                  </div>
                </div>
                <div className="transaction-meta">
                  <div className="transaction-time">
                    {formatTime(transaction.timestamp)}
                  </div>
                  <div className="transaction-id">
                    {transaction.id.slice(0, 8)}...
                  </div>
                </div>
              </div>
            ))}
          </div>

          {transactions.length > 5 && (
            <div className="more-transactions">
              +{transactions.length - 5} more transactions
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionStatus;