import { SupplierProfileScreen } from "@/components/suppliers/supplier-profile-screen";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
  const { supplierId } = await params;
  return <SupplierProfileScreen supplierId={Number(supplierId)} />;
}
