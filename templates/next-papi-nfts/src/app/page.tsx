import { ConnectionStatus } from "./components/ConnectionStatus";
import { WalletConnectButton } from "./components/WalletConnectButton";
import { WalletModal } from "./components/WalletModal";

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>AssetHub NFT App</h1>
      <WalletConnectButton />
      <ConnectionStatus />
      <WalletModal />
    </div>
  );
}