import { Alert } from 'react-bootstrap';
import type { DataSource } from '../store/appliancesSlice';
export function SourceNotice({ source }: { source: DataSource }) {
  return source === 'mock' ? <Alert variant="warning" className="source-notice">Сервер недоступен. Просмотр демонстрационных приборов в режиме гостя.</Alert> : null;
}
