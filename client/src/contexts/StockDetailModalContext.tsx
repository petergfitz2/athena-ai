import { createContext, useContext, useState, ReactNode } from 'react';
import { StockDetailModalPro } from '@/components/StockDetailModalPro';

interface StockDetailModalContextType {
  openModal: (symbol: string) => void;
  closeModal: () => void;
}

const StockDetailModalContext = createContext<StockDetailModalContextType | undefined>(undefined);

export function useStockDetailModal() {
  const context = useContext(StockDetailModalContext);
  if (!context) {
    throw new Error('useStockDetailModal must be used within a StockDetailModalProvider');
  }
  return context;
}

interface StockDetailModalProviderProps {
  children: ReactNode;
  onTrade?: (action: 'buy' | 'sell', symbol: string) => void;
}

export function StockDetailModalProvider({ children, onTrade }: StockDetailModalProviderProps) {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const openModal = (symbol: string) => {
    setSelectedStock(symbol);
    setIsOpen(true);
  };
  
  const closeModal = () => {
    setIsOpen(false);
    setSelectedStock(null);
  };
  
  return (
    <StockDetailModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {selectedStock && (
        <StockDetailModalPro
          symbol={selectedStock}
          open={isOpen}
          onOpenChange={setIsOpen}
          onTrade={onTrade}
        />
      )}
    </StockDetailModalContext.Provider>
  );
}