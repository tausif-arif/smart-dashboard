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
        <div className="flex flex-col md:flex-row min-h-[100dvh] w-full bg-canvas text-ink">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 w-full md:max-w-7xl md:mx-auto">
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
