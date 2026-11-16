import { Button, Card } from 'react-bootstrap';
import { Link } from 'react-router';
import type { Appliance } from '../data/appliances';
import { MediaImage } from './Media';
import { useAppDispatch, useAppSelector, useBusy } from '../store/hooks';
import { deleteAppliance } from '../store/appliancesSlice';
export function ApplianceCard({ appliance }: { appliance: Appliance }) {
  const dispatch = useAppDispatch(); const busy = useBusy();
  const authenticated = useAppSelector(state => state.auth.isAuthenticated);
  return <Card as="article" className="appliance-card">
    <Link to={`/appliances-feed/${appliance.id}`} className="card-link" aria-label={`Открыть: ${appliance.applianceName}`}>
      <MediaImage src={appliance.imageUrl} alt={appliance.applianceName} className="card-image" />
      <Card.Body><Card.Title as="h2">{appliance.applianceName}</Card.Title>
        <div className="card-specs"><span>Мощность: {appliance.powerWatts} Вт</span><span>Мин. темп: {appliance.minTemperature} °C</span></div>
        <p className="likes-count">Интерес: {appliance.likesCount}</p>
      </Card.Body>
    </Link>
    {authenticated && appliance.isOwner === 1 && <Button variant="danger" className="delete-button" disabled={busy}
      onClick={() => void dispatch(deleteAppliance(appliance.id))}>Удалить</Button>}
  </Card>;
}
