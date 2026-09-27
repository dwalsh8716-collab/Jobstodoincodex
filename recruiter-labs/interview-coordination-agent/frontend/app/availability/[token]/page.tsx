import AvailabilityPicker from "./picker";

export default async function AvailabilityPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <AvailabilityPicker token={token} />;
}
