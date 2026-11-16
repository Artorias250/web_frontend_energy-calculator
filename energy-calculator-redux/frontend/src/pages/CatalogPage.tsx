import { useEffect } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { ApplianceCard } from '../components/ApplianceCard';
import { PowerFilter } from '../components/PowerFilter';
import { SourceNotice } from '../components/SourceNotice';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppDispatch, useAppSelector, useBusy } from '../store/hooks';
import { fetchAppliances, setMinPower } from '../store/appliancesSlice';
export function CatalogPage() {
  usePageTitle('Каталог приборов');
  const dispatch = useAppDispatch(); const busy = useBusy();
  const { items, minPower, catalogSource, error } = useAppSelector(state => state.appliances);
  const authenticated = useAppSelector(state => state.auth.isAuthenticated);
  useEffect(() => {
    const request = dispatch(fetchAppliances());
    return () => request.abort();
  }, [dispatch, minPower, authenticated]);
  return <section className="page catalog-page">
    <h1>Каталог приборов</h1>
    <SourceNotice source={catalogSource} />
    <PowerFilter key={minPower} minPower={minPower} onApply={value => {
      if (value === minPower) void dispatch(fetchAppliances());
      else dispatch(setMinPower(value));
    }} />
    <Button variant="link" disabled={busy} onClick={() => void dispatch(fetchAppliances())}>Обновить список</Button>
    <div className="catalog-grid">{items.map(appliance => <ApplianceCard key={appliance.id} appliance={appliance} />)}</div>
    {!busy && !error && !items.length && <Alert variant="light">Приборы с такой мощностью не найдены. Уменьшите значение фильтра.</Alert>}
  </section>;
}
