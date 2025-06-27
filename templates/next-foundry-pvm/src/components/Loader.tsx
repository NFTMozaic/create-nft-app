import styles from './Loader.module.css';

interface LoaderProps {
  message?: string;
}

export function Loader({ message = 'Loading...' }: LoaderProps) {
  return (
    <div className={styles.loader}>
      <div className={styles.spinner}></div>
      {message && <p className={styles.text}>{message}</p>}
    </div>
  );
}
