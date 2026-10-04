import { InvoiceDetailPage } from '@/views/InvoiceDetailPage';
import type { Metadata } from 'next';

interface InvoiceRouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: InvoiceRouteProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Invoice #${id} - Creatorin Secure Escrow`,
    description: `Faktur pembayaran resmi Creatorin dengan sistem proteksi rekening escrow aman.`,
  };
}

export default async function InvoiceRoute({ params }: InvoiceRouteProps) {
  const { id } = await params;
  return (
    <InvoiceDetailPage invoiceData={{ id }} />
  );
}
