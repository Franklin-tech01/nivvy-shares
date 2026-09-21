import type { Metadata } from "next";
import { ErrorNotice, PageHeader } from "@/components/layout/page-header";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { getTransactions } from "@/lib/data";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const { data, error } = await getTransactions();
  return (
    <>
      <PageHeader title="Transactions" description="Your deposits, purchases, bonuses and rewards." />
      {error ? <ErrorNotice message={error} /> : <TransactionTable transactions={data} />}
    </>
  );
}
