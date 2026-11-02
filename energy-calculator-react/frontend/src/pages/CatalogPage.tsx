import { Alert } from "react-bootstrap";
import type { Appliance } from "../data/appliances";
import { ApplianceCard } from "../components/ApplianceCard";
import { PowerFilter } from "../components/PowerFilter";
import { usePageTitle } from "../hooks/usePageTitle";

interface Props {
  appliances: Appliance[];
  minPower: number;
  onApply: (value: number) => void;
}
export function CatalogPage({ appliances, minPower, onApply }: Props) {
  usePageTitle("Каталог приборов");
  return (
    <section className="page catalog-page">
      <h1>Каталог приборов</h1>
      <PowerFilter minPower={minPower} onApply={onApply} />
      <div className="catalog-grid">
        {appliances.map((appliance) => (
          <ApplianceCard key={appliance.id} appliance={appliance} />
        ))}
      </div>
      {!appliances.length && (
        <Alert variant="light" className="empty-state">
          Приборы с такой мощностью не найдены. Уменьшите значение фильтра.
        </Alert>
      )}
    </section>
  );
}
