import EditProductClient from './EditProductClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function EditProductPage() {
  return <EditProductClient />;
}
