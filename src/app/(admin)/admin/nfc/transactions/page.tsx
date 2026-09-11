export const dynamic = "force-dynamic";

import { getNfcTransactions } from "./actions";
import TransactionsClient from "./TransactionsClient";

export default async function NfcTransactionsPage() {
  const initialData = await getNfcTransactions({ page: 1, pageSize: 50 });

  return <TransactionsClient initialData={initialData} />;
}
