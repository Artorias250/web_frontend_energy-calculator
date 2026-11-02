import { useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router";
import { PUBLISHED_APPLIANCES } from "../data/appliances";
import type { Appliance } from "../data/appliances";
import { MediaVideo } from "../components/Media";
import { Icon } from "../components/Icons";
import { usePageTitle } from "../hooks/usePageTitle";

function FeedItem({
  appliance,
  next,
}: {
  appliance: Appliance;
  next?: Appliance;
}) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  return (
    <section className="feed-page" aria-label={appliance.applianceName}>
      <MediaVideo
        src={appliance.videoUrl}
        image={appliance.imageUrl}
        title={appliance.applianceName}
        className="feed-video"
      />
      <div className="feed-shade" />
      <div className="feed-description">
        <h1>{appliance.applianceName}</h1>
        <p
          id="appliance-description"
          className={expanded ? "" : "description-collapsed"}
        >
          {appliance.description}
        </p>
        <button
          type="button"
          className="expand-description"
          aria-expanded={expanded}
          aria-controls="appliance-description"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Меньше" : "Ещё"}
        </button>
      </div>
      <aside className="feed-sidebar" aria-label="Характеристики прибора">
        <div>
          <span className="sidebar-label">Мощность</span>
          <strong>{appliance.powerWatts} Вт</strong>
        </div>
        <div>
          <span className="sidebar-label">Температура</span>
          <strong>{appliance.minTemperature} °C</strong>
        </div>
        <div
          className="feed-likes"
          aria-label={`Количество лайков: ${appliance.likesCount}`}
        >
          <Icon name="heart" />
          <span>{appliance.likesCount}</span>
        </div>
        <Button
          variant="link"
          className="next-button"
          disabled={!next}
          onClick={() => {
            if (next) navigate(`/appliances-feed/${next.id}`);
          }}
        >
          <Icon name="next" />
          <span>{next ? "Далее" : "Конец ленты"}</span>
        </Button>
      </aside>
    </section>
  );
}
export function FeedPage({ appliances }: { appliances: Appliance[] }) {
  const { id } = useParams();
  const appliance = PUBLISHED_APPLIANCES.find((item) => String(item.id) === id);
  usePageTitle(appliance?.applianceName ?? "Прибор не найден");
  if (!appliance)
    return (
      <section className="page">
        <h1>Прибор не найден</h1>
        <Alert variant="light">Такой опубликованной карточки нет.</Alert>
        <Link to="/appliances-catalog">Вернуться в каталог</Link>
      </section>
    );
  const sequence = appliances.some((item) => item.id === appliance.id)
    ? appliances
    : PUBLISHED_APPLIANCES;
  const next =
    sequence[sequence.findIndex((item) => item.id === appliance.id) + 1];
  return <FeedItem key={appliance.id} appliance={appliance} next={next} />;
}
