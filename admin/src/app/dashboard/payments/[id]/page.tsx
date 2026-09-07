import PaymentDetailsClient from './PaymentDetailsClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <PaymentDetailsClient params={params} />;
}
