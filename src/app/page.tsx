'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

const App = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const workerRef = useRef<Worker>(null);
  const [result, setResult] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.js', import.meta.url));

    workerRef.current.onmessage = (event) => {
      const result = event.data.output;
      setResult(result);
      setTimeSpent(event.data.timeSpent);
      // Update the UI with the result
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const fetchImage = async () => {
    const response = await fetch('https://picsum.photos/1000');
    return response.url;
  };

  const refreshImage = async () => {
    const url = await fetchImage();
    if (imageRef.current) imageRef.current.src = url;
  };

  const handleClick = async () => {
    if (imageRef.current?.src) {
      setResult('Processing...');
      workerRef.current?.postMessage(imageRef.current.src);
    }
  };

  useEffect(() => {
    fetchImage().then((url) => {
      if (imageRef.current) imageRef.current.src = url;
    });
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src=""
          alt="An example image"
          width="500"
          height="500"
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleClick}>Start processing</button>
          <button onClick={refreshImage}>Refresh image</button>
        </div>
        <p>Result: {result}</p>
        <p>Time spent: {timeSpent}ms</p>
      </main>
    </div>
  );
};

export default App;
