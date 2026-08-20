import { SubVendorProfileScreen } from "@/components/suppliers/sub-vendor-profile-screen";

export default async function SubVendorDetailPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;
  return <SubVendorProfileScreen vendorId={Number(vendorId)} />;
}
