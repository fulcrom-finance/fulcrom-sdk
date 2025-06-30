import { ChainId, FulcromSDK } from "@fulcrom-finance/fulcrom-sdk";
import styles from "./page.module.css";

export default async function Home() {
  const fulcromSDK = new FulcromSDK();
  const positions = await fulcromSDK.getUserPositions('your wallet address', ChainId.CRONOS_TESTNET);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <table>
          <thead>
            <tr>
              <th>Index Token Address</th>
              <th>Collateral Token Address</th>
            </tr>
          </thead>
          <tbody>
            {positions?.data?.map((position) => (
              <tr key={position.key}>
                <td>{position.indexToken}</td>
                <td>{position.collateralToken}</td>
            </tr>))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
