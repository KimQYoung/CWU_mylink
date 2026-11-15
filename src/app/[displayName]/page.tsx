import { PublicProfileClient } from "./public-profile-client";

export default async function PublicDisplayNamePage({
  params,
}: PageProps<"/[displayName]">) {
  const { displayName } = await params;
  return <PublicProfileClient rawDisplayName={displayName} />;
}
