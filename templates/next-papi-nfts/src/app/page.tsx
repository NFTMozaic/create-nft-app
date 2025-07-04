import { ConnectionStatus } from "./components/ConnectionStatus";

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>AssetHub NFT App</h1>
      <ConnectionStatus />
    </div>
  );
}
