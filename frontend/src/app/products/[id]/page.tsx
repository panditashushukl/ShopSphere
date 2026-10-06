import ProductDetailClient from "./ProductDetailClient";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
