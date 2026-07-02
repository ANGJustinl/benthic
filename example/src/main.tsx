import React from 'react';
import ReactDOM from 'react-dom/client';
import { ExampleApp } from './ExampleApp';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ExampleApp />
  </React.StrictMode>,
);
