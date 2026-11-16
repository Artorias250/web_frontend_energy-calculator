import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router';
import { MediaVideo } from '../components/Media';
import { Icon } from '../components/Icons';
import { SourceNotice } from '../components/SourceNotice';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppDispatch, useAppSelector, useBusy } from '../store/hooks';
import { fetchApplianceFeed, setApplianceLike } from '../store/appliancesSlice';
import type { Appliance } from '../data/appliances';
function FeedItem({ appliance }: { appliance: Appliance }) {
  const [expanded, setExpanded] = useState(false);
  const dispatch = useAppDispatch(); const navigate = useNavigate(); const busy = useBusy();
  const authenticated = useAppSelector(state => state.auth.isAuthenticated);
  const source = useAppSelector(state => state.appliances.feedSource);
  async function next() {
    try {
      const result = await dispatch(fetchApplianceFeed({ id: appliance.id, next: true })).unwrap();
      navigate(`/appliances-feed/${result.item.id}`);
    } catch { /* ошибка отображается из Redux */ }
  }
  return <>
    <SourceNotice source={source} />
    <section className="feed-page" aria-label={appliance.applianceName}>
      <MediaVideo src={appliance.videoUrl} image={appliance.imageUrl} title={appliance.applianceName} className="feed-video" />
      <div className="feed-shade" />
      <div className="feed-description"><h1>{appliance.applianceName}</h1>
        <p id="appliance-description" className={expanded ? '' : 'description-collapsed'}>{appliance.description}</p>
        <button type="button" className="expand-description" disabled={busy} aria-expanded={expanded}
          aria-controls="appliance-description" onClick={() => setExpanded(value => !value)}>{expanded ? 'Меньше' : 'Ещё'}</button>
      </div>
      <aside className="feed-sidebar" aria-label="Характеристики прибора">
        <div><span className="sidebar-label">Мощность</span><strong>{appliance.powerWatts} Вт</strong></div>
        <div><span className="sidebar-label">Температура</span><strong>{appliance.minTemperature} °C</strong></div>
        <button className={`feed-likes ${authenticated && appliance.isLiked ? 'is-liked' : ''}`} type="button"
          disabled={busy || !authenticated || source !== 'api'} aria-pressed={authenticated && appliance.isLiked === 1}
          aria-label={authenticated ? (appliance.isLiked ? 'Снять лайк' : 'Поставить лайк') : 'Лайки доступны после входа'}
          onClick={() => void dispatch(setApplianceLike({ id: appliance.id, value: appliance.isLiked ? 0 : 1 }))}>
          <Icon name="heart" /><span>{appliance.likesCount}</span>
        </button>
        <Button variant="link" className="next-button" disabled={busy} onClick={() => void next()}><Icon name="next" /><span>Далее</span></Button>
      </aside>
    </section>
  </>;
}
export function FeedPage() {
  const { id } = useParams(); const dispatch = useAppDispatch(); const busy = useBusy();
  const { feed, error } = useAppSelector(state => state.appliances);
  const authenticated = useAppSelector(state => state.auth.isAuthenticated);
  usePageTitle(feed?.applianceName ?? 'Лента приборов');
  useEffect(() => {
    if (id !== undefined && (!/^\d+$/.test(id) || Number(id) < 1)) return;
    const request = dispatch(fetchApplianceFeed({ id: id === undefined ? undefined : Number(id) }));
    return () => request.abort();
  }, [dispatch, id, authenticated]);
  if ((id !== undefined && (!/^\d+$/.test(id) || Number(id) < 1)) || (!busy && error && !feed))
    return <section className="page"><h1>Прибор недоступен</h1><Link to="/appliances-catalog">Вернуться в каталог</Link></section>;
  return feed ? <FeedItem key={feed.id} appliance={feed} /> : <section className="page"><h1>Лента приборов</h1></section>;
}
