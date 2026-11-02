import { Card } from "react-bootstrap";
import { Link } from "react-router";
import type { Appliance } from "../data/appliances";
import { MediaImage } from "./Media";

export function ApplianceCard({ appliance }: { appliance: Appliance }) {
  return (
    <Card as="article" className="appliance-card">
      <Link
        to={`/appliances-feed/${appliance.id}`}
        className="card-link"
        aria-label={`Открыть: ${appliance.applianceName}`}
      >
        <MediaImage
          src={appliance.imageUrl}
          alt={appliance.applianceName}
          className="card-image"
        />
        <Card.Body>
          <Card.Title as="h2">{appliance.applianceName}</Card.Title>
          <div className="card-specs">
            <span>Мощность: {appliance.powerWatts} Вт</span>
            <span>Мин. темп: {appliance.minTemperature} °C</span>
          </div>
          <p className="likes-count">Интерес: {appliance.likesCount}</p>
        </Card.Body>
      </Link>
    </Card>
  );
}
