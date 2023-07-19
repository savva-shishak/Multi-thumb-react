import { useState } from 'react';
import Ranges from './Ranges';

function toTime(minutes: number) {
  return (minutes / 60 > 9 ? '' : '0') + (minutes / 60 >> 0) + ':' + (minutes % 60 > 9 ? '' : '0') + (minutes % 60);
}

function App() {
  const [values, setValues] = useState<[number, number][]>([[60, 300], [360, 510]]);

  return (
    <div style={{ paddingLeft: 100, width: 500 }}>
      <Ranges
        step={30}
        maxValue={1440}
        values={values}
        setValues={setValues}
      />
      <div style={{marginTop: 50, height: 100 }}>
        <ul>
          {values.map(([start, end]) => <li key={start + end}> {toTime(start)} - {toTime(end)} </li>)}
        </ul>
      </div>
    </div>
  )
}

export default App
