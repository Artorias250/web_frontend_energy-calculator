import { useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import { PUBLISHED_APPLIANCES } from "./data/appliances";
import { BottomNav } from "./components/BottomNav";
import { CatalogPage } from "./pages/CatalogPage";
import { FeedPage } from "./pages/FeedPage";
import { DraftPage } from "./pages/DraftPage";

export default function App() {
  // Состояние общее для страниц; данные и обработчики передаются только через props.
  const [minPower, setMinPower] = useState(0);
  const appliances = PUBLISHED_APPLIANCES.filter(
    (item) => item.powerWatts >= minPower,
  );
  const firstId = (appliances[0] ?? PUBLISHED_APPLIANCES[0]).id;
  return (
    <div className="app-shell">
      <main className="app-content">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/appliances-catalog" replace />}
          />
          <Route
            path="/appliances-catalog"
            element={
              <CatalogPage
                appliances={appliances}
                minPower={minPower}
                onApply={setMinPower}
              />
            }
          />
          <Route
            path="/appliances-feed"
            element={<Navigate to={`/appliances-feed/${firstId}`} replace />}
          />
          <Route
            path="/appliances-feed/:id"
            element={<FeedPage appliances={appliances} />}
          />
          <Route path="/appliances-draft" element={<DraftPage />} />
          <Route
            path="*"
            element={
              <section className="page">
                <h1>Страница не найдена</h1>
                <p>Выберите ленту или плитку в нижнем меню.</p>
              </section>
            }
          />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
