import { useEffect, useRef, useState } from 'react';
import "./Ranges.scss";

let elementX: number | null = null;
let activeElement: HTMLDivElement | null = null;

document.addEventListener('mouseup', () => {
  activeElement = null;
  elementX = 0;
});

document.addEventListener('mousemove', (e) => {
  if (
    e.clientX <= 0
    || e.clientX >= window.innerWidth
    || e.clientY <= 0
    || e.clientY >= window.innerHeight
  ) {
    activeElement = null;
    elementX = 0;
  }
})

type RangeType = {
  values: [number, number],
  setStart: (start: number) => void,
  setEnd: (start: number) => void,
}

function Range({ values, setStart, setEnd }: RangeType) {
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function moveStartPoint(ev: MouseEvent | TouchEvent) {
      if (activeElement !== startRef.current || !elementX) {
        return
      }

      const parentX = elementX;
      const pointX = ev instanceof TouchEvent ? ev.touches[0].clientX : ev.clientX;
      
      setStart(pointX - parentX);
    }

    document.addEventListener('mousemove', moveStartPoint);
    document.addEventListener('touchmove', moveStartPoint);

    return () => {
      document.removeEventListener('mousemove', moveStartPoint);
      document.removeEventListener('touchmove', moveStartPoint);
    }
  }, [setStart]);
  
  useEffect(() => {

    function moveEndPoint(ev: MouseEvent | TouchEvent) {
      if (activeElement !== endRef.current || !elementX) {
        return
      }

      const parentX = elementX;
      const pointX = ev instanceof TouchEvent ? ev.touches[0].clientX : ev.clientX;

      setEnd(pointX - parentX);
    }

    document.addEventListener('mousemove', moveEndPoint);
    document.addEventListener('touchmove', moveEndPoint);

    return () => {
      document.removeEventListener('mousemove', moveEndPoint);
      document.removeEventListener('touchmove', moveEndPoint);
    }
  }, [setEnd]);

  useEffect(() => {
    return () => {
      activeElement = null;
    }
  }, []);

  return (
    <div className="ranges__range" style={{ left: values[0], width: values[1] - values[0] }}>
      <div 
        className="ranges__start"
        ref={startRef}
        onMouseDown={(e) => {
          activeElement = e.target as HTMLDivElement;
        }}
      />
      <div 
        className="ranges__end"
        ref={endRef}
        onMouseDown={(e) => {
          activeElement = e.target as HTMLDivElement;
        }}
      />
    </div>
  );
}

export type RangesListProps = {
  maxValue: number,
  values: [number, number][],
  setValues: (values: [number, number][]) => void,
  align?: (v: [number, number]) => [number, number],
}

export function RangesList({ values, setValues, maxValue }: RangesListProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const { width = 0 } = rootRef.current?.getBoundingClientRect() || {};

  const [,updateTrigger] = useState(0);

  useEffect(() => {
    setTimeout(() => { updateTrigger(t => t + 1) }, 100)
  }, [width]);

  const alignStart = ([startPx, end]: [number, number], index: number) => {
    const [,prevEnd = 0] = values[index - 1] || [];;

    const prevPx = prevEnd * width / maxValue;
    const endPx = end  * width / maxValue;

    return Math.min(endPx, Math.max(startPx, prevPx)) * maxValue / width >> 0
  }

  function alignEnd([start, endPx]: [number, number], index: number) {
    const [nextStart = maxValue] = values[index + 1] || [];

    const startPx = start * width / maxValue;
    const nextPx = nextStart * width / maxValue;

    return Math.max(startPx, Math.min(endPx, nextPx)) * maxValue / width >> 0;
  }

  return (
    <div
      className="ranges"
      ref={rootRef}
      onMouseDown={(e) => elementX = (e.currentTarget as HTMLElement).getBoundingClientRect().left}
      onTouchStart={(e) => elementX = (e.currentTarget as HTMLElement).getBoundingClientRect().left}
    >
      {values.map(([start, end], id) => (
        <Range
          key={id}
          values={[start * width / maxValue, end * width / maxValue]}
          setStart={(start) => setValues(values.map((range, index) => id === index
            ? [alignStart([start, range[1]], index), range[1]]
            : range))
          }
          setEnd={(end) => setValues(values.map((range, index) => id === index
            ? [range[0], alignEnd([range[0], end], index)]
            : range))
          }
        />
      ))}
    </div>
  )
}

const stepMap = (val: number, step: number) => Math.round(val/step)*step

export type RangesType = RangesListProps & {
  step?: number;
}

export function Ranges({ values, setValues, maxValue, step = 1 }: RangesType) {
  return (
    <RangesList
      maxValue={maxValue}
      values={values}
      setValues={(valuesState) => {
        const mapped: [number, number][] = valuesState
          .map(([start, end]) => [stepMap(start, step), stepMap(end, step)])
        
        const values: [number, number][] = [];

        for (let index = 0; index < mapped.length; index++) {
          const current = mapped[index];
          const prev = mapped[index - 1];

          if (prev && prev[1] === current[0]) {
            prev[1] = current[1];
          } else {
            values.push(current);
          }
        }

        setValues(values);
      }}
    />
  )
}

export default Ranges;
