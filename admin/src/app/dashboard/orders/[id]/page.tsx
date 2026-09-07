import OrderDetailsClient from './OrderDetailsClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function OrderDetailsPage() {
  return <OrderDetailsClient />;
}
