import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "@/app/Sidebar";
import { OverviewPage } from "@/features/overview";
import { AskPage } from "@/features/ask";
import { InsightsPage } from "@/features/insights";
import { SalesPage } from "@/features/sales";
import { CustomersPage } from "@/features/customers";
import { ProductsPage } from "@/features/products";
import { DataStatusPage } from "@/features/data-status";
import "@/styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--canvas)" }}>
          <Sidebar />
          <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/ask" element={<AskPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/data-status" element={<DataStatusPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
