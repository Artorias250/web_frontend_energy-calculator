import { useState } from "react";
import { Button, Form } from "react-bootstrap";

interface Props {
  minPower: number;
  onApply: (value: number) => void;
}
export function PowerFilter({ minPower, onApply }: Props) {
  const [value, setValue] = useState(minPower);
  return (
    <Form
      className="power-filter"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(value);
      }}
    >
      <Form.Label htmlFor="power-range" className="visually-hidden">
        Минимальная мощность
      </Form.Label>
      <div className="filter-row">
        <output id="power-output" htmlFor="power-range">
          Мин. мощность: {value} Вт
        </output>
        <Button type="submit">ОК</Button>
      </div>
      <Form.Range
        id="power-range"
        aria-label="Минимальная мощность"
        aria-describedby="power-output"
        min={0}
        max={3000}
        step={50}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
      />
    </Form>
  );
}
