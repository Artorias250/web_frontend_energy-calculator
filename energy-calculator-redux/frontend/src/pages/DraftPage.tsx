import { useEffect, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { MediaImage, MediaVideo } from '../components/Media';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppDispatch, useAppSelector, useBusy } from '../store/hooks';
import { createAppliance, fetchApplianceDraft, publishAppliance } from '../store/appliancesSlice';
function useFilePreview(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setUrl(null); return; }
    const next = URL.createObjectURL(file); setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}
function DraftForm() {
  const dispatch = useAppDispatch(); const navigate = useNavigate(); const busy = useBusy();
  const draft = useAppSelector(state => state.appliances.draft);
  const [name, setName] = useState(draft?.applianceName ?? '');
  const [description, setDescription] = useState(draft?.description ?? '');
  const [power, setPower] = useState(draft ? String(draft.powerWatts) : '');
  const [temperature, setTemperature] = useState(draft ? String(draft.minTemperature) : '');
  const [image, setImage] = useState<File | null>(null); const [video, setVideo] = useState<File | null>(null);
  const imagePreview = useFilePreview(image); const videoPreview = useFilePreview(video);
  return <Form onSubmit={async e => {
    e.preventDefault(); if (busy) return;
    try {
      if (!draft) { if (image && video) await dispatch(createAppliance({ applianceName: name.trim(), image, video })).unwrap(); }
      else {
        const result = await dispatch(publishAppliance({ description: description.trim(), powerWatts: Number(power), minTemperature: Number(temperature) })).unwrap();
        navigate(`/appliances-feed/${result.id}`);
      }
    } catch { /* ошибка из Redux */ }
  }}>
    <fieldset disabled={busy}>
      <Form.Group controlId="draft-image"><Form.Label>Фотография</Form.Label>
        <Form.Control type="file" accept="image/png,image/jpeg,image/webp,image/gif" required={!draft} disabled={!!draft}
          onChange={e => setImage((e.target as HTMLInputElement).files?.[0] ?? null)} />
        <MediaImage src={imagePreview ?? draft?.imageUrl ?? null} alt="Предпросмотр фотографии" className="draft-preview" /></Form.Group>
      <Form.Group controlId="draft-video"><Form.Label>Видеозапись</Form.Label>
        <Form.Control type="file" accept="video/mp4,video/webm,video/quicktime" required={!draft} disabled={!!draft}
          onChange={e => setVideo((e.target as HTMLInputElement).files?.[0] ?? null)} />
        <MediaVideo src={videoPreview ?? draft?.videoUrl ?? null} image={imagePreview ?? draft?.imageUrl ?? null}
          title="Предпросмотр видеозаписи" className="draft-preview" controls /></Form.Group>
      <Form.Group controlId="draft-name"><Form.Label>Название устройства</Form.Label>
        <Form.Control value={name} required maxLength={256} disabled={!!draft} onChange={e => setName(e.target.value)} /></Form.Group>
      {draft && <>
        <Form.Group controlId="draft-description"><Form.Label>Описание</Form.Label>
          <Form.Control as="textarea" rows={3} required value={description} onChange={e => setDescription(e.target.value)} /></Form.Group>
        <Row className="g-2"><Col xs={6}><Form.Group controlId="draft-power"><Form.Label>Мощность (Вт)</Form.Label>
          <Form.Control type="number" min={0} step={1} required value={power} onChange={e => setPower(e.target.value)} /></Form.Group></Col>
          <Col xs={6}><Form.Group controlId="draft-temperature"><Form.Label>Мин. температура (°C)</Form.Label>
            <Form.Control type="number" step={1} required value={temperature} onChange={e => setTemperature(e.target.value)} /></Form.Group></Col></Row>
      </>}
      <Button type="submit" className="publish-button" disabled={busy}>{draft ? 'Опубликовать' : 'Далее'}</Button>
    </fieldset>
  </Form>;
}
export function DraftPage() {
  usePageTitle('Добавление прибора'); const dispatch = useAppDispatch();
  const { draft } = useAppSelector(state => state.appliances);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { let active = true; const request = dispatch(fetchApplianceDraft());
    void request.then(() => { if (active) setLoaded(true); });
    return () => { active = false; request.abort(); }; }, [dispatch]);
  return <section className="page draft-page"><h1>{draft ? 'Черновик прибора' : 'Добавление прибора'}</h1>
    {loaded && <DraftForm key={draft?.id ?? 'new'} />}
  </section>;
}
