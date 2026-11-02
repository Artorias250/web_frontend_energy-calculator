import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { DRAFT_APPLIANCE } from '../data/appliances';
import { MediaImage, MediaVideo } from '../components/Media';
import { usePageTitle } from '../hooks/usePageTitle';

function useFilePreview(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url;
}
export function DraftPage() {
  usePageTitle('Черновик прибора');
  const [draft, setDraft] = useState(DRAFT_APPLIANCE);
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const imagePreview = useFilePreview(image);
  const videoPreview = useFilePreview(video);
  function selectFile(
    event: ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
  ) {
    const file = event.target.files?.[0];
    if (file) setFile(file);
  }
  return (
    <section className="page draft-page">
      <h1>Черновик прибора</h1>
      <Form onSubmit={(event) => event.preventDefault()}>
        <Form.Group controlId="draft-image">
          <Form.Label>Фотография</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              selectFile(event, setImage)
            }
          />
          <MediaImage
            src={imagePreview ?? draft.imageUrl}
            alt="Предпросмотр фотографии"
            className="draft-preview"
          />
        </Form.Group>
        <Form.Group controlId="draft-video">
          <Form.Label>Видеозапись</Form.Label>
          <Form.Control
            type="file"
            accept="video/*"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              selectFile(event, setVideo)
            }
          />
          <MediaVideo
            src={videoPreview ?? draft.videoUrl}
            image={imagePreview ?? draft.imageUrl}
            title="Предпросмотр видеозаписи"
            className="draft-preview"
            controls
          />
        </Form.Group>
        <Form.Group controlId="draft-name">
          <Form.Label>Название устройства</Form.Label>
          <Form.Control
            value={draft.applianceName}
            onChange={(event) =>
              setDraft({ ...draft, applianceName: event.target.value })
            }
          />
        </Form.Group>
        <Form.Group controlId="draft-description">
          <Form.Label>Описание</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={draft.description}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
          />
        </Form.Group>
        <Row className="g-2">
          <Col xs={6}>
            <Form.Group controlId="draft-power">
              <Form.Label>Мощность (Вт)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={draft.powerWatts}
                onChange={(event) =>
                  setDraft({ ...draft, powerWatts: Number(event.target.value) })
                }
              />
            </Form.Group>
          </Col>
          <Col xs={6}>
            <Form.Group controlId="draft-temperature">
              <Form.Label>Мин. температура (°C)</Form.Label>
              <Form.Control
                type="number"
                value={draft.minTemperature}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    minTemperature: Number(event.target.value),
                  })
                }
              />
            </Form.Group>
          </Col>
        </Row>
        <Button type="button" className="publish-button" disabled>
          Опубликовать
        </Button>
        <p className="draft-note">
          Предпросмотр формы. Изменения не сохраняются.
        </p>
      </Form>
    </section>
  );
}
